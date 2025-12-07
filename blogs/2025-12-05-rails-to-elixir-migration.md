# Migrating a Rails API to Elixir/Phoenix: A Practical Guide

*December 5, 2025*

I just completed migrating the backend API for Chi War, a Feng Shui 2 RPG campaign management application, from Ruby on Rails to Elixir/Phoenix. Last week I removed all the old Ruby and legacy Next.js code from the repository, so as of this week the application is running entirely on Elixir. This post documents the key decisions, challenges, and patterns that emerged during the process.

## Why Migrate?

The Rails backend worked fine for development, but I wanted to explore Elixir's concurrency model and the reliability guarantees of the BEAM VM. The application has real-time features (combat tracking, live updates) that felt like a natural fit for Phoenix Channels. I also appreciated the explicit nature of Elixir code compared to Rails' "magic."

The goals were straightforward:
- Maintain full API compatibility with the existing Next.js frontend
- Share the same PostgreSQL database during migration
- Run both backends simultaneously until confidence was established
- Improve real-time performance for combat encounters

## The Migration Strategy

Rather than a big-bang rewrite, I took an incremental approach:

1. **Phase 1**: Build Phoenix API alongside Rails, sharing the database
2. **Phase 2**: Switch frontend to Phoenix endpoints via environment config
3. **Phase 3**: Deploy Phoenix to production, keep Rails as fallback
4. **Phase 4**: Remove Rails entirely, Phoenix becomes the sole backend

The shared database was crucial. Both applications read from and write to the same PostgreSQL instance, which meant I could switch between backends without data migration.

## Key Technology Mappings

### Authentication: Devise to Guardian

Rails used Devise with JWT tokens. The challenge was maintaining token compatibility so users wouldn't be logged out during the switch.

**Rails JWT structure:**
```ruby
# Nested user data in claims
{
  "jti" => "unique-token-id",
  "user" => {
    "email" => "user@example.com",
    "admin" => false,
    ...
  },
  "sub" => "user-uuid"
}
```

The Phoenix Guardian implementation needed to handle both formats:

```elixir
defmodule ShotElixir.Guardian do
  use Guardian, otp_app: :shot_elixir

  def resource_from_claims(%{"user" => %{"email" => email}}) do
    # Handle Rails-style nested JWT
    case Accounts.get_user_by_email(email) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  def resource_from_claims(%{"sub" => id}) do
    # Handle Phoenix-style JWT
    case Accounts.get_user(id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end
end
```

This bidirectional compatibility meant existing tokens continued working during the transition.

### Background Jobs: Sidekiq to Oban

Rails used Sidekiq with Redis for background jobs. Phoenix uses Oban, which stores jobs in PostgreSQL. This eliminated Redis as a dependency and integrated better with Ecto transactions.

```elixir
defmodule ShotElixir.Workers.EmailWorker do
  use Oban.Worker, queue: :emails, max_attempts: 3

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"type" => "invitation", "invitation_id" => id}}) do
    invitation = Invitations.get_invitation!(id)
    invitation
    |> UserEmail.invitation_email()
    |> Mailer.deliver()
  end
end
```

Enqueueing jobs uses a consistent pattern:

```elixir
%{"type" => "invitation", "invitation_id" => invitation.id}
|> EmailWorker.new()
|> Oban.insert()
```

The PostgreSQL-backed queue provides transactional guarantees that Redis couldn't offer. If the database transaction fails, the job is never enqueued.

### Real-time: Action Cable to Phoenix Channels

This was the most satisfying part of the migration. Phoenix Channels are first-class citizens, not an add-on.

```elixir
defmodule ShotElixirWeb.FightChannel do
  use ShotElixirWeb, :channel

  def join("fight:" <> fight_id, _params, socket) do
    fight = Fights.get_fight!(fight_id)
    {:ok, assign(socket, :fight, fight)}
  end

  def handle_in("shot:update", %{"shot_id" => id, "value" => value}, socket) do
    case Fights.update_shot_value(id, value) do
      {:ok, shot} ->
        broadcast!(socket, "shot:updated", render_shot(shot))
        {:reply, :ok, socket}
      {:error, _} ->
        {:reply, {:error, "update_failed"}, socket}
    end
  end
end
```

The message format remained compatible with the frontend's existing Action Cable integration.

## Schema Organization: Models to Contexts

Rails scatters business logic across models, controllers, and services. Phoenix encourages organizing code into contexts - modules that define clear boundaries around related functionality.

```
lib/shot_elixir/
├── accounts.ex       # User management
├── campaigns.ex      # Campaign CRUD + memberships
├── characters.ex     # Character management
├── fights.ex         # Combat encounters
└── invitations.ex    # Campaign invitations
```

Each context owns its schemas and exposes a public API:

```elixir
defmodule ShotElixir.Characters do
  alias ShotElixir.Characters.Character

  def list_campaign_characters(campaign_id) do
    Character
    |> where(campaign_id: ^campaign_id)
    |> where(active: true)
    |> preload([:weapons, :schticks])
    |> Repo.all()
  end

  def create_character(attrs) do
    %Character{}
    |> Character.changeset(attrs)
    |> Repo.insert()
  end
end
```

This explicit API makes dependencies clear. Controllers call context functions; contexts don't call each other directly without good reason.

## View Modules vs Serializers

Rails uses Active Model Serializers (or JBuilder, or as_json). Phoenix uses explicit View modules. This caught me early - I initially created `*JSON` modules following newer Phoenix conventions, but the codebase uses the traditional `*View` pattern.

```elixir
defmodule ShotElixirWeb.Api.V2.CharacterView do
  def render("show.json", %{character: character}) do
    # Single resource: return directly, no wrapper
    render_character_full(character)
  end

  def render("index.json", %{characters: characters, meta: meta}) do
    # Collection: wrap with plural key
    %{
      characters: Enum.map(characters, &render_character_summary/1),
      meta: meta
    }
  end

  defp render_character_full(character) do
    %{
      id: character.id,
      name: character.name,
      archetype: character.archetype,
      character_type: character.character_type,
      weapons: Enum.map(character.weapons, &render_weapon/1),
      schticks: Enum.map(character.schticks, &render_schtick/1)
    }
  end
end
```

The explicit rendering makes the API contract clear. There's no hidden serialization logic.

## Challenges Encountered

### Database Schema Ownership

I decided Rails would own the database schema during the migration period. Phoenix loaded the schema from `priv/repo/structure.sql` rather than running its own migrations. Now that Rails is gone, I'll transition schema management to Ecto migrations going forward.

```bash
# In CI, set up test database with Rails schema
psql -d shot_server_test < priv/repo/structure.sql
```

### CORS Configuration

Both backends needed identical CORS configuration:

```elixir
plug CORSPlug,
  origin: [
    "http://localhost:3001",
    "https://chiwar.net",
    "https://shot-client-phoenix.fly.dev"
  ]
```

Missing a domain from this list caused mysterious failures that took time to debug.

### Email Templates

Swoosh doesn't have built-in template rendering like Rails mailers. I used Phoenix's view system:

```elixir
defmodule ShotElixir.Emails.UserEmail do
  import Swoosh.Email
  import Phoenix.Template, only: [embed_templates: 1]

  embed_templates "user_email/*"

  def invitation_email(invitation) do
    new()
    |> to(invitation.email)
    |> from({"Chi War", "admin@chiwar.net"})
    |> subject("You've been invited to #{invitation.campaign.name}")
    |> html_body(invitation_html(%{invitation: invitation}))
    |> text_body(invitation_text(%{invitation: invitation}))
  end
end
```

Templates live in `lib/shot_elixir_web/templates/email/user_email/`.

## Production Deployment

The production stack runs on Fly.io:

```
chiwar.net → shot-client-phoenix (Next.js) → shot-elixir (Phoenix) → shot-counter-db (PostgreSQL)
```

Deployment is straightforward:

```bash
cd shot-elixir
fly deploy -a shot-elixir
```

Phoenix's release system bundles everything into a single deployable artifact. No Ruby version management, no Bundler, no asset pipeline complexity.

## Results

The migration achieved its goals:

- **API Compatibility**: The frontend required zero changes. Token format, response structure, and endpoint paths all matched.
- **Real-time Performance**: Phoenix Channels handle concurrent WebSocket connections more efficiently than Action Cable.
- **Operational Simplicity**: Fewer moving parts. No Redis. PostgreSQL handles both data and job queues.
- **Code Clarity**: Explicit contexts and view modules make the codebase easier to navigate.
- **Clean Repository**: Last week I removed all the legacy Ruby and old Next.js code, leaving a clean Elixir-only backend.

## Lessons Learned

1. **Start with authentication compatibility.** Getting JWT tokens working bidirectionally unlocked the incremental migration.

2. **Share the database.** Running both backends against the same data store removed the riskiest part of migration.

3. **Match the API exactly.** The frontend shouldn't know or care which backend is responding.

4. **Embrace contexts.** The organizational pattern takes adjustment but pays off in clarity.

5. **Test both backends.** Playwright E2E tests validated that both implementations behaved identically before cutting over.

6. **Delete the old code.** Once you're confident in the new implementation, remove the legacy code. It felt good to finally delete the Rails backend last week.

The migration was worth the effort, primarily for the improved real-time capabilities and the pleasure of working with Elixir's explicit, functional style.

---

*Chi War is a campaign management tool for the Feng Shui 2 tabletop RPG. The codebase is available at [github.com/progressions](https://github.com/progressions).*
