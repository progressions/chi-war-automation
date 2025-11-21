# Email Implementation for Phoenix API - Technical Specification

**Date:** 2025-01-21
**Status:** Planning
**Priority:** High
**Type:** Feature Implementation

## Overview

Implement email functionality in the shot-elixir Phoenix API to match the existing Rails shot-server email behavior. This includes transactional emails for user registration, invitations, password resets, and system notifications.

## Current Rails Email Implementation Analysis

### Email Infrastructure (Rails)

**Mailer Configuration:**
- **From Address:** `admin@chiwar.net` (ApplicationMailer, UserMailer)
- **System Address:** `system@chiwar.net` (AdminMailer)
- **SMTP Provider:** Microsoft Office 365 (`smtp.office365.com:587`)
- **Authentication:** Login with STARTTLS
- **Delivery Method:** Background jobs via Sidekiq (`.deliver_later!` / `.deliver_later`)
- **Development:** Uses `letter_opener` gem to preview emails in browser
- **Test:** Uses `:test` delivery method with `ActionMailer::Base.deliveries` array

**SMTP Configuration (Production):**
```ruby
config.action_mailer.smtp_settings = {
  address: 'smtp.office365.com',
  port: 587,
  domain: 'chiwar.net',
  user_name: Rails.application.credentials.smtp.user_name,
  password: Rails.application.credentials.smtp.password,
  authentication: 'login',
  enable_starttls_auto: true,
  openssl_verify_mode: 'none'
}
```

**URL Configuration:**
- Production: `https://chiwar.net`
- Development: `http://localhost:3001` (frontend port)
- Frontend URL construction for links in emails

### Email Types Implemented

#### 1. UserMailer (Devise Integration)

**Base Configuration:**
- Inherits from `Devise::Mailer`
- Uses Devise views and URL helpers
- Custom mailer specified in Devise config: `config.mailer = 'UserMailer'`

**Email Types:**

1. **Welcome Email** (`welcome`)
   - Sent after user registration
   - Simple greeting email
   - Variables: `@user`
   - Subject: "Welcome to the Chi War!"

2. **Invitation Email** (`invitation`)
   - Sent when gamemaster invites new player
   - Includes campaign details and invitation link
   - Variables: `@invitation`, `@campaign`, `@root_url`
   - Subject: "You have been invited to join {campaign.name} in the Chi War!"
   - Call site: `Api::V2::InvitationsController#create`, `#resend`
   - Delivery: `.deliver_later!` (background job with error raising)
   - Redemption URL: `{root_url}/redeem/{invitation.id}`

3. **Joined Campaign Email** (`joined_campaign`)
   - Sent when user joins a campaign
   - Variables: `@user`, `@campaign`
   - Subject: "You have joined the campaign: {campaign.name}"

4. **Removed from Campaign Email** (`removed_from_campaign`)
   - Sent when user removed from campaign
   - Variables: `@user`, `@campaign`
   - Subject: "You have been removed from the campaign: {campaign.name}"

5. **Confirmation Instructions** (`confirmation_instructions`) - Devise Override
   - Sent on user registration requiring email confirmation
   - Custom logic for invitation-based registrations
   - Variables: `@user`, `@token`, `@invitation`, `@campaign`, `@frontend_confirmation_url`
   - Subject:
     - With invitation: "Confirm your account to join {campaign.name} in the Chi War!"
     - Without: "Confirm your account - Welcome to the Chi War!"
   - Confirmation URL: `{protocol}://{host}:{port}/confirm?confirmation_token={token}`
   - Token expiry: 24 hours (Devise default)
   - Special handling: Uses `user.pending_invitation_id` to customize message

6. **Reset Password Instructions** (`reset_password_instructions`) - Devise Override
   - Sent on password reset request
   - Variables: `@user`, `@token`, `@frontend_reset_url`
   - Subject: "Reset your Chi War password"
   - Reset URL: `{protocol}://{host}:{port}/reset-password/{token}`
   - Token expiry: 2 hours (Devise default)
   - Security headers: `X-Auto-Response-Suppress`, `X-Mailer`
   - Both HTML and text versions

#### 2. AdminMailer

**Purpose:** System error notifications to administrators

1. **Blob Sequence Error** (`blob_sequence_error`)
   - Critical system error notification
   - Sent when Active Storage blob sequence conflict occurs
   - Variables: `@campaign`, `@error_message`, `@timestamp`
   - Recipient: `progressions@gmail.com` (hardcoded admin)
   - Subject: "[CRITICAL] Campaign Seeding Failed - Blob Sequence Error"
   - Priority: High
   - Both HTML and text formats
   - Includes detailed debugging information and remediation steps

### Email Templates

**Location:** `app/views/user_mailer/`, `app/views/devise/mailer/`

**Styling Approach:**
- Inline CSS for email client compatibility
- Responsive design with max-width constraints
- Color scheme: Green theme (`#4CAF50`, `#2E7D32`) for main actions
- Professional HTML email structure
- Fallback text versions for compatibility

**Common Design Elements:**
- Centered layout, max-width 600px
- Header with title/branding
- Content sections with background colors
- Call-to-action buttons (large, centered, colorful)
- Security notices and warnings
- Footer with additional info and links
- Typography: Sans-serif fonts, 14-16px base size

### Mailer Call Sites

**Invitation Flow:**
```ruby
# Create invitation
UserMailer.with(invitation: @invitation).invitation.deliver_later!

# Resend invitation
UserMailer.with(invitation: @invitation).invitation.deliver_later!
```

**Registration Flow:**
```ruby
# After user registration (Devise handles confirmation email automatically)
UserMailer.with(user: resource).welcome.deliver_later
```

**Campaign Membership:**
```ruby
# Joined campaign
UserMailer.with(user: @user, campaign: @campaign).joined_campaign.deliver_later

# Removed from campaign
UserMailer.with(user: user, campaign: campaign).removed_from_campaign.deliver_later
```

**System Errors:**
```ruby
# Critical errors
AdminMailer.blob_sequence_error(campaign, error.message).deliver_later
```

## Phoenix Email Implementation Requirements

### Technology Stack

**Swoosh Library:**
- Primary email library for Elixir/Phoenix
- Supports multiple adapters (SMTP, Mailgun, SendGrid, etc.)
- Background job support via Oban
- Template rendering with Phoenix views
- Testing support with local adapter

**Oban Background Jobs:**
- Reliable job processing for email delivery
- Retry logic for failed deliveries
- Job monitoring and error tracking
- Already in use for other background tasks

**Required Dependencies:**
```elixir
# In mix.exs
{:swoosh, "~> 1.16"},
{:phoenix_swoosh, "~> 1.2"},
{:gen_smtp, "~> 1.2"},  # For SMTP adapter
{:oban, "~> 2.17"}      # Already installed
```

### Configuration Structure

**Config Files:**

1. **config/config.exs** (Base configuration)
```elixir
config :shot_elixir, ShotElixir.Mailer,
  adapter: Swoosh.Adapters.Local  # Default for dev

config :swoosh, :api_client, Swoosh.ApiClient.Finch

# Oban configuration for email jobs
config :shot_elixir, Oban,
  queues: [
    default: 10,
    emails: 20,      # Dedicated email queue
    high_priority: 5
  ]
```

2. **config/dev.exs** (Development)
```elixir
config :shot_elixir, ShotElixir.Mailer,
  adapter: Swoosh.Adapters.Local

# Enable mailbox preview in browser
config :shot_elixir, ShotElixirWeb.Endpoint,
  live_view: [signing_salt: "..."]

# URL options for email links
config :shot_elixir, :mailer_url_options,
  scheme: "http",
  host: "localhost",
  port: 3001  # Frontend port
```

3. **config/test.exs** (Test)
```elixir
config :shot_elixir, ShotElixir.Mailer,
  adapter: Swoosh.Adapters.Test

config :shot_elixir, :mailer_url_options,
  scheme: "http",
  host: "localhost",
  port: 3001
```

4. **config/runtime.exs** (Production with secrets)
```elixir
if config_env() == :prod do
  config :shot_elixir, ShotElixir.Mailer,
    adapter: Swoosh.Adapters.SMTP,
    relay: "smtp.office365.com",
    port: 587,
    username: System.get_env("SMTP_USERNAME"),
    password: System.get_env("SMTP_PASSWORD"),
    tls: :always,
    auth: :always,
    ssl: false,
    retries: 2

  config :shot_elixir, :mailer_url_options,
    scheme: "https",
    host: "chiwar.net",
    port: nil
end
```

### File Structure

```
lib/shot_elixir/
├── mailer.ex                           # Base mailer module
├── emails/
│   ├── user_email.ex                   # User-facing emails
│   ├── admin_email.ex                  # System/admin emails
│   └── email_helpers.ex                # Shared email utilities
└── workers/
    └── email_worker.ex                 # Oban worker for email delivery

lib/shot_elixir_web/
├── templates/
│   ├── email/
│   │   ├── layout/
│   │   │   └── email.html.heex         # Base email layout
│   │   ├── user_email/
│   │   │   ├── welcome.html.heex
│   │   │   ├── invitation.html.heex
│   │   │   ├── joined_campaign.html.heex
│   │   │   ├── removed_from_campaign.html.heex
│   │   │   ├── confirmation_instructions.html.heex
│   │   │   ├── reset_password_instructions.html.heex
│   │   │   └── reset_password_instructions.text.eex
│   │   └── admin_email/
│   │       ├── blob_sequence_error.html.heex
│   │       └── blob_sequence_error.text.eex
└── views/
    └── email_view.ex                   # View helpers for templates
```

### Implementation Tasks

#### Phase 1: Infrastructure Setup (2-3 hours)

**Task 1.1: Install Dependencies**
- [ ] Add Swoosh, Phoenix.Swoosh, and gen_smtp to mix.exs
- [ ] Run `mix deps.get`
- [ ] Verify Oban is configured with email queue

**Task 1.2: Configure Mailer**
- [ ] Create `lib/shot_elixir/mailer.ex` base module
- [ ] Configure Swoosh adapter per environment
- [ ] Set up SMTP credentials in Fly.io secrets
- [ ] Configure URL options for email links
- [ ] Test configuration in development

**Task 1.3: Set Up Email Worker**
- [ ] Create `lib/shot_elixir/workers/email_worker.ex` Oban worker
- [ ] Implement retry logic (3 attempts with backoff)
- [ ] Add error handling and logging
- [ ] Test worker functionality

**Task 1.4: Create Base Templates**
- [ ] Create email layout template `email.html.heex`
- [ ] Set up view module with helper functions
- [ ] Create CSS variables for brand colors
- [ ] Test template rendering

**Files to Create:**
```elixir
# lib/shot_elixir/mailer.ex
defmodule ShotElixir.Mailer do
  use Swoosh.Mailer, otp_app: :shot_elixir
end

# lib/shot_elixir/workers/email_worker.ex
defmodule ShotElixir.Workers.EmailWorker do
  use Oban.Worker, queue: :emails, max_attempts: 3

  alias ShotElixir.Mailer

  @impl Oban.Worker
  def perform(%Oban.Job{args: %{"email" => email_data}}) do
    email_data
    |> build_email()
    |> Mailer.deliver()
  end

  defp build_email(%{"type" => type} = data) do
    # Dispatch to appropriate email builder
  end
end
```

#### Phase 2: User Emails (4-5 hours)

**Task 2.1: Welcome Email**
- [ ] Create `lib/shot_elixir/emails/user_email.ex`
- [ ] Implement `welcome/1` function
- [ ] Create `welcome.html.heex` template
- [ ] Add tests for welcome email generation
- [ ] Add integration test for delivery

**Task 2.2: Invitation Email**
- [ ] Implement `invitation/1` function with campaign context
- [ ] Create `invitation.html.heex` template matching Rails design
- [ ] Build invitation URL with frontend host
- [ ] Add tests for invitation email generation
- [ ] Test email rendering with real data

**Task 2.3: Campaign Membership Emails**
- [ ] Implement `joined_campaign/2` function
- [ ] Create `joined_campaign.html.heex` template
- [ ] Implement `removed_from_campaign/2` function
- [ ] Create `removed_from_campaign.html.heex` template
- [ ] Add tests for both email types

**Task 2.4: Confirmation Instructions**
- [ ] Implement `confirmation_instructions/2` function
- [ ] Create `confirmation_instructions.html.heex` template
- [ ] Handle invitation context (pending_invitation_id)
- [ ] Build confirmation URL with token
- [ ] Match Rails subject logic (with/without campaign)
- [ ] Add comprehensive tests

**Task 2.5: Password Reset**
- [ ] Implement `reset_password_instructions/2` function
- [ ] Create both HTML and text templates
- [ ] Build password reset URL with token
- [ ] Add security headers
- [ ] Match Rails styling and security notices
- [ ] Add tests for email generation and links

**Example Implementation:**
```elixir
# lib/shot_elixir/emails/user_email.ex
defmodule ShotElixir.Emails.UserEmail do
  import Swoosh.Email
  alias ShotElixir.Mailer
  alias ShotElixirWeb.EmailView

  @from_email "admin@chiwar.net"

  def welcome(user) do
    new()
    |> to({user.first_name || user.email, user.email})
    |> from({" Chi War", @from_email})
    |> subject("Welcome to the Chi War!")
    |> render_body(:welcome, %{user: user})
  end

  def invitation(invitation) do
    campaign = invitation.campaign
    root_url = build_root_url()
    invitation_url = "#{root_url}/redeem/#{invitation.id}"

    new()
    |> to(invitation.email)
    |> from({"Chi War", @from_email})
    |> subject("You have been invited to join #{campaign.name} in the Chi War!")
    |> render_body(:invitation, %{
      invitation: invitation,
      campaign: campaign,
      invitation_url: invitation_url
    })
  end

  def confirmation_instructions(user, token) do
    {subject, template_assigns} =
      case user.pending_invitation_id do
        nil ->
          {"Confirm your account - Welcome to the Chi War!", %{invitation: nil, campaign: nil}}

        invitation_id ->
          invitation = ShotElixir.Repo.get(ShotElixir.Invitations.Invitation, invitation_id)
          campaign = invitation && invitation.campaign

          subject = if campaign do
            "Confirm your account to join #{campaign.name} in the Chi War!"
          else
            "Confirm your account - Welcome to the Chi War!"
          end

          {subject, %{invitation: invitation, campaign: campaign}}
      end

    confirmation_url = build_confirmation_url(token)

    new()
    |> to({user.first_name || user.email, user.email})
    |> from({"Chi War", @from_email})
    |> subject(subject)
    |> render_body(:confirmation_instructions,
        Map.merge(template_assigns, %{
          user: user,
          confirmation_url: confirmation_url
        }))
  end

  defp build_root_url do
    opts = Application.get_env(:shot_elixir, :mailer_url_options, [])
    scheme = opts[:scheme] || "https"
    host = opts[:host] || "chiwar.net"
    port = opts[:port]

    port_string = if port, do: ":#{port}", else: ""
    "#{scheme}://#{host}#{port_string}"
  end

  defp build_confirmation_url(token) do
    "#{build_root_url()}/confirm?confirmation_token=#{token}"
  end

  defp render_body(email, template, assigns) do
    html_body = Phoenix.View.render_to_string(
      EmailView,
      "#{template}.html",
      assigns
    )

    html(email, html_body)
  end
end
```

#### Phase 3: Admin Emails (2 hours)

**Task 3.1: Critical Error Notifications**
- [ ] Create `lib/shot_elixir/emails/admin_email.ex`
- [ ] Implement `blob_sequence_error/2` function
- [ ] Create HTML and text templates
- [ ] Match Rails formatting and detail level
- [ ] Set priority header
- [ ] Add tests

**Example Implementation:**
```elixir
# lib/shot_elixir/emails/admin_email.ex
defmodule ShotElixir.Emails.AdminEmail do
  import Swoosh.Email

  @from_email "system@chiwar.net"
  @admin_email "progressions@gmail.com"

  def blob_sequence_error(campaign, error_message) do
    timestamp = DateTime.utc_now()

    new()
    |> to(@admin_email)
    |> from({"Chi War System", @from_email})
    |> subject("[CRITICAL] Campaign Seeding Failed - Blob Sequence Error")
    |> header("Priority", "high")
    |> html(blob_error_html(campaign, error_message, timestamp))
    |> text(blob_error_text(campaign, error_message, timestamp))
  end

  defp blob_error_text(campaign, error_message, timestamp) do
    """
    CRITICAL ERROR: Campaign Seeding Failed

    Time: #{timestamp}
    Campaign: #{campaign.name} (ID: #{campaign.id})
    User: #{campaign.user.email}

    Error: Active Storage blob ID sequence conflict
    #{error_message}

    IMMEDIATE ACTION REQUIRED:
    1. SSH into production: fly ssh console --app shot-elixir
    2. Run database sequence fix command
    3. Then recreate the campaign or manually run seeding

    This error occurs when the blob ID sequence is out of sync after importing data.
    The sequence needs to be reset to MAX(id) + 1.
    """
  end

  defp blob_error_html(campaign, error_message, timestamp) do
    # Render detailed HTML version matching Rails template
  end
end
```

#### Phase 4: Controller Integration (3-4 hours)

**Task 4.1: Update Invitation Controller**
- [ ] Add email delivery to `create` action
- [ ] Add email delivery to `resend` action
- [ ] Use Oban worker for background delivery
- [ ] Add error handling for email failures
- [ ] Test integration end-to-end

**Task 4.2: Update Registration Flow**
- [ ] Hook into user registration to send confirmation email
- [ ] Send welcome email after confirmation
- [ ] Handle pending invitation context
- [ ] Test full registration flow with emails

**Task 4.3: Update Campaign Membership**
- [ ] Send joined_campaign email on membership creation
- [ ] Send removed_from_campaign email on membership deletion
- [ ] Queue emails via Oban worker
- [ ] Test both flows

**Task 4.4: Error Handling Integration**
- [ ] Add admin email to critical error handlers
- [ ] Configure error thresholds
- [ ] Test error notification delivery

**Example Controller Integration:**
```elixir
# In invitation controller
def create(conn, %{"invitation" => invitation_params}) do
  # ... validation ...

  case Invitations.create_invitation(invitation_params) do
    {:ok, invitation} ->
      # Queue invitation email
      %{
        "type" => "invitation",
        "invitation_id" => invitation.id
      }
      |> EmailWorker.new()
      |> Oban.insert()

      render(conn, "show.json", invitation: invitation)

    {:error, changeset} ->
      render(conn, "error.json", changeset: changeset)
  end
end
```

#### Phase 5: Testing & Documentation (2-3 hours)

**Task 5.1: Email Testing**
- [ ] Unit tests for all email functions
- [ ] Template rendering tests
- [ ] URL generation tests
- [ ] Oban worker tests
- [ ] Integration tests for controller actions

**Task 5.2: Development Tools**
- [ ] Set up Swoosh mailbox preview (dev environment)
- [ ] Configure email preview routes
- [ ] Test email preview in browser
- [ ] Document how to preview emails locally

**Task 5.3: Production Testing**
- [ ] Test SMTP connection on Fly.io
- [ ] Send test emails in production
- [ ] Verify email delivery and formatting
- [ ] Check spam folder placement
- [ ] Test all email types end-to-end

**Task 5.4: Documentation**
- [ ] Update CLAUDE.md with email information
- [ ] Document email configuration
- [ ] Add troubleshooting guide
- [ ] Document development workflow

### Testing Strategy

**Unit Tests:**
```elixir
defmodule ShotElixir.Emails.UserEmailTest do
  use ShotElixir.DataCase
  import Swoosh.TestAssertions

  alias ShotElixir.Emails.UserEmail

  describe "invitation/1" do
    test "generates invitation email with correct content" do
      invitation = insert(:invitation)
      email = UserEmail.invitation(invitation)

      assert email.to == [{nil, invitation.email}]
      assert email.from == {" Chi War", "admin@chiwar.net"}
      assert email.subject =~ invitation.campaign.name
      assert email.html_body =~ "/redeem/#{invitation.id}"
    end
  end
end
```

**Integration Tests:**
```elixir
defmodule ShotElixirWeb.Api.V2.InvitationsControllerTest do
  use ShotElixirWeb.ConnCase
  import Swoosh.TestAssertions

  describe "POST /api/v2/invitations" do
    test "sends invitation email", %{conn: conn} do
      conn = post(conn, "/api/v2/invitations", %{
        invitation: %{email: "test@example.com"}
      })

      assert %{"id" => id} = json_response(conn, 201)

      # Verify email was queued
      assert_email_sent(subject: "You have been invited")
    end
  end
end
```

### Environment Variables

**Required Secrets for Fly.io:**
```bash
# Production SMTP credentials
fly secrets set SMTP_USERNAME=admin@chiwar.net -a shot-elixir
fly secrets set SMTP_PASSWORD=<password> -a shot-elixir
```

**Development .env:**
```bash
# No SMTP credentials needed - uses local adapter
MAILER_HOST=localhost
MAILER_PORT=3001
MAILER_SCHEME=http
```

### Migration from Rails

**Behavioral Parity Checklist:**
- [ ] All email types implemented
- [ ] Identical email content and styling
- [ ] Same sender addresses
- [ ] Same URL structures for links
- [ ] Background job delivery
- [ ] Retry logic for failures
- [ ] Development email preview
- [ ] Test email assertions
- [ ] Production SMTP configuration
- [ ] Error notifications

**Differences to Note:**
- Swoosh vs ActionMailer API differences
- Oban vs Sidekiq job format
- Phoenix templates (.heex) vs Rails ERB (.erb)
- No Devise integration (custom confirmation/reset logic)

### Acceptance Criteria

**Functional Requirements:**
1. ✅ All email types from Rails are implemented
2. ✅ Emails match Rails design and content
3. ✅ All links in emails point to correct frontend URLs
4. ✅ Emails are delivered via background jobs
5. ✅ Failed emails are retried appropriately
6. ✅ Development environment shows email previews
7. ✅ Production sends emails via Office 365 SMTP

**Technical Requirements:**
1. ✅ Swoosh configured with SMTP adapter
2. ✅ Oban worker handles email delivery
3. ✅ Email templates use Phoenix HEEx
4. ✅ All emails have test coverage
5. ✅ Configuration supports all environments
6. ✅ Error handling logs failures appropriately
7. ✅ SMTP credentials stored in Fly.io secrets

**User Experience:**
1. ✅ Invitation emails arrive within 1 minute
2. ✅ Email links work correctly
3. ✅ Emails display correctly in major email clients
4. ✅ Emails don't end up in spam folder
5. ✅ Confirmation and reset links expire correctly
6. ✅ Email text is professional and clear

### Implementation Timeline

**Estimated Total: 13-17 hours**

- **Phase 1** (Infrastructure): 2-3 hours
- **Phase 2** (User Emails): 4-5 hours
- **Phase 3** (Admin Emails): 2 hours
- **Phase 4** (Integration): 3-4 hours
- **Phase 5** (Testing/Docs): 2-3 hours

**Recommended Approach:**
1. Complete Phase 1 fully before moving on
2. Implement Phase 2 emails one at a time with tests
3. Phase 3 can be done in parallel with Phase 2
4. Phase 4 requires Phase 2 completion
5. Phase 5 ongoing throughout development

### Risk Assessment

**Medium Risk:**
- SMTP configuration differences between Rails and Phoenix
- Template rendering differences (ERB vs HEEx)
- Email client compatibility issues
- Delivery failures in production

**Low Risk:**
- Swoosh library is mature and well-documented
- Oban provides reliable background jobs
- Most logic is straightforward port from Rails

**Mitigation:**
- Test SMTP connection early in development
- Use Rails templates as exact reference
- Test in multiple email clients
- Implement comprehensive logging
- Start with low-volume testing in production

### Success Metrics

**Development:**
- All tests passing
- Email preview working in development
- Code review approved
- Documentation complete

**Production:**
- Emails delivered successfully (>99% success rate)
- Average delivery time <30 seconds
- Zero spam folder placement
- User confirmation rate matches Rails baseline

### References

**Rails Files:**
- `app/mailers/user_mailer.rb`
- `app/mailers/admin_mailer.rb`
- `app/mailers/application_mailer.rb`
- `app/views/user_mailer/*.html.erb`
- `app/controllers/api/v2/invitations_controller.rb`
- `config/environments/production.rb` (SMTP config)
- `config/initializers/devise.rb` (Mailer config)

**External Documentation:**
- Swoosh: https://hexdocs.pm/swoosh/
- Phoenix.Swoosh: https://hexdocs.pm/phoenix_swoosh/
- Oban: https://hexdocs.pm/oban/
- Office 365 SMTP: https://learn.microsoft.com/en-us/exchange/mail-flow-best-practices/how-to-set-up-a-multifunction-device-or-application-to-send-email-using-microsoft-365-or-office-365
