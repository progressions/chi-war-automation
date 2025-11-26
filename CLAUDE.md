# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Interaction Guidelines

Never tell me "You're absolutely right!". Don't compliment me or praise me or agree with my assessment. Use a plain,  matter-of-fact tone without sycophancy.

## Git Workflow

**Never commit directly to main/master.** Always create a feature branch and make a pull request. Wait for CI to pass before merging.

## Repository Overview

This is a coordination repository for managing Feng Shui 2 RPG campaigns with two primary applications:
- **shot-elixir**: Elixir/Phoenix 1.8 API backend (port 4002) - separate git repository, **production backend**
- **shot-client-next**: Next.js 15.4 frontend (port 3001) - separate git repository, **production frontend**

### Production Stack

**Live at https://chiwar.net**

```
chiwar.net → shot-client-phoenix (Next.js on Fly.io) → shot-elixir (Phoenix on Fly.io) → shot-counter-db (PostgreSQL on Fly.io)
```

| Component | Technology | Fly.io App | Purpose |
|-----------|------------|------------|---------|
| Frontend | Next.js 15.4 | shot-client-phoenix | React UI served at chiwar.net |
| Backend | Phoenix 1.8 / Elixir | shot-elixir | REST API + WebSocket channels |
| Database | PostgreSQL | shot-counter-db | Shared database with UUID primary keys |

### Legacy Applications (Deprecated)

The following are no longer in production but may exist locally for reference:
- **shot-server**: Ruby on Rails 8.0 API backend - **deprecated**, replaced by shot-elixir
- **legacy-client**: Original Next.js frontend - **deprecated**

### Directory Structure

```
chi-war/                          # Root coordination repository
├── create-invitation.sh          # Quick script to generate test invitations (./create-invitation.sh [email])
├── shot-elixir/                  # Phoenix API backend (separate git repo, gitignored)
│   ├── lib/                      # Elixir application code
│   │   ├── shot_elixir/          # Business logic, schemas, services
│   │   └── shot_elixir_web/      # Controllers, views, channels, router
│   ├── config/                   # Phoenix configuration
│   ├── priv/                     # Static assets and migrations
│   ├── test/                     # ExUnit test suite
│   └── CLAUDE.md                 # Phoenix-specific documentation
├── shot-client-next/             # Next.js frontend (separate git repo, gitignored)
│   ├── src/                      # Source code
│   │   ├── app/                  # Next.js App Router pages
│   │   ├── components/           # React components by feature
│   │   ├── contexts/             # React context providers
│   │   ├── lib/                  # API clients and utilities
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # Domain logic services
│   │   └── types/                # TypeScript type definitions
│   ├── plop-templates/           # Code generation templates
│   └── CLAUDE.md                 # Frontend-specific documentation
├── shot-server/                  # Rails API backend (DEPRECATED - local dev only)
├── issues/                       # Issue tracking (markdown files)
│   ├── TEMPLATE.md               # Issue template
│   └── *.md                      # Individual issue files
├── specs/                        # Development specifications
│   └── *.md                      # Feature specifications and plans
├── test-scripts/                 # Playwright automation scripts
│   ├── test-*.js                 # E2E test scripts
│   ├── login-helper.js           # Test authentication helper
│   └── test-results/             # Test screenshots and artifacts
├── .gitignore                    # Ignores shot-elixir/, shot-server/, shot-client-next/
└── CLAUDE.md                     # This file - overall documentation
```

**Key Points:**
- **shot-elixir/** and **shot-client-next/** are separate git repositories, ignored by the root .gitignore
- **shot-elixir is the source of truth** for the backend API - all new development should target Phoenix
- Root chi-war repository tracks shared coordination files: issues, specs, test scripts, and documentation
- Each sub-application maintains its own git history and CLAUDE.md documentation
- Development workflow involves working in individual repositories while coordinating through shared test infrastructure
- Issues directory provides systematic tracking of bugs and improvements
- Test scripts validate critical user flows across both applications

## Common Development Commands

### Backend (shot-elixir) - PRIMARY
```bash
cd shot-elixir
mix deps.get                      # Install dependencies
mix ecto.migrate                  # Run database migrations
mix phx.server                    # Start development server (port 4002)
iex -S mix phx.server             # Start with interactive console
mix test                          # Run all tests
mix test test/shot_elixir/        # Run specific tests
mix format                        # Format code
mix compile --warnings-as-errors  # Check for warnings
```

### Frontend (shot-client-next)
```bash
cd shot-client-next
npm install                       # Install dependencies
npm run dev                       # Start development server with Turbopack
npm run build                     # Build for production
npm run lint                      # Run ESLint
npm run format                    # Format with Prettier
npm run fl                        # Format and lint together
npm run generate:component        # Generate new component with Plop
```

### Backend (shot-server) - DEPRECATED
```bash
# Rails backend is deprecated. Use shot-elixir for all new development.
# These commands are for legacy reference only:
cd shot-server
bundle install                    # Install dependencies
rails db:migrate                  # Run database migrations
rails server                      # Start development server
bundle exec rspec                 # Run all tests
```

## Test Environment Configuration

**Separate Test Ports for Concurrent Development and Testing:**

### Development Servers (Default)
- **Phoenix**: Port 4002 (`mix phx.server`)
- **Next.js**: Port 3001 (`npm run dev`)

### Starting Development Environment

**Complete Development Environment Setup:**
```bash
# Kill all existing servers
pkill -f "beam" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Phoenix development server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-elixir && mix phx.server' &

# Start Next.js development server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && npm run dev' &

# Wait for servers to start
sleep 10

# Verify servers are running
curl -s http://localhost:4002/api/v2/users/current | head -1  # Should return auth error
curl -s http://localhost:3001 | head -1                       # Should return redirect
```

**Individual Server Startup:**

For Phoenix development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-elixir
mix phx.server
# Or with interactive console:
iex -S mix phx.server
```

For Next.js development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
npm run dev
```

**Notes:**
- Phoenix development server starts quickly (~2-3 seconds)
- Next.js server is usually ready in ~3-5 seconds with Turbopack
- Both servers should show proper error responses when running correctly
- Phoenix uses the same database as production (shot_counter_local)

### Test Environment
```bash
# Terminal 1 - Start Phoenix server
cd shot-elixir && mix phx.server

# Terminal 2 - Start Next.js server
cd shot-client-next && npm run dev

# Terminal 3 - Run E2E tests
cd test-scripts && node test-invitation-simple.js
```

**Benefits:**
- Phoenix and Next.js can run concurrently
- Shared database between development and test
- E2E tests validate full stack integration

## High-Level Architecture

### Backend Architecture (Phoenix/Elixir)
The Phoenix API follows an organized pattern with:
- **Controllers** in `lib/shot_elixir_web/controllers/api/v2/` - Handle HTTP requests
- **Schemas** in `lib/shot_elixir/` (by context) - Ecto schemas with UUID primary keys
- **Views** in `lib/shot_elixir_web/views/api/v2/` - Format JSON responses
- **Services** in `lib/shot_elixir/services/` - Complex business logic
- **Workers** in `lib/shot_elixir/workers/` - Background processing with Oban
- **Channels** in `lib/shot_elixir_web/channels/` - WebSocket connections via Phoenix Channels

Key services:
- `AiService` - Character generation using AI
- `NotionService` - Sync characters to Notion
- `DiscordBot` - Discord integration for game management (via Nostrum)
- `CharacterDuplicatorService` - Clone characters
- `DiceRoller` - Dice rolling logic

**Context organization:**
- `ShotElixir.Accounts` - Users, authentication
- `ShotElixir.Campaigns` - Campaigns, memberships
- `ShotElixir.Characters` - Characters, schticks, weapons
- `ShotElixir.Fights` - Fights, shots, encounters
- `ShotElixir.World` - Sites, parties, factions, junctures

### Frontend Architecture
The Next.js app uses:
- **App Router** with layouts and loading states
- **Components** organized by feature in `src/components/`
- **Contexts** for global state in `src/contexts/`
- **Hooks** for data fetching in `src/hooks/`
- **Services** for domain logic in `src/services/`
- **API clients** in `src/lib/Api.ts` and `ApiV2.ts`

Component patterns:
- Feature folders contain List, Show, Form, Table, View components
- Autocomplete components for entity selection
- Avatar and Badge components for visual representation
- Rich text editor with mentions using TipTap

### Toast Notification System

The application uses a centralized toast notification system for user feedback:

**Core Implementation Files:**
- **Toast Context**: `src/contexts/ToastContext.tsx` - Main implementation
- **Toast Component**: `src/components/PopupToast.tsx` - UI component
- **Toast Types**: `src/types/ui.ts` - TypeScript interfaces

**Available Toast Functions:**
```typescript
import { useToast } from "@/contexts"

const { toastSuccess, toastError, toastInfo, toastWarning, closeToast } = useToast()

// Usage examples:
toastSuccess("Operation completed successfully")
toastError("Failed to complete operation")
toastInfo("Information message")
toastWarning("Warning message")
```

**Common Usage Patterns:**
```typescript
// CRUD Operations
try {
  await client.createEntity(data)
  toastSuccess("Entity created successfully")
} catch (error) {
  toastError("Failed to create entity")
}

// With entity context
toastSuccess(`Campaign "${campaign.name}" activated`)
toastError(`Error updating ${entityName}`)
```

**Toast Behavior:**
- Auto-hide after 6 seconds
- Single toast displayed at a time
- Uses Material-UI Snackbar/Alert components
- User dismissible via click or close button

**Best Practices:**
- Always pair API operations with appropriate toast notifications
- Use descriptive, user-friendly messages
- Include entity names for context: `"Character deleted successfully"`
- Avoid technical error details in user-facing messages

### Communication Flow
1. Frontend authenticates via Guardian JWT tokens stored in localStorage
2. API requests use Axios with token in Authorization header
3. Real-time updates via Phoenix Channels WebSocket connections
4. CORS configured for cross-origin requests (chiwar.net, shot-client-phoenix.fly.dev)

## Domain Model

Core entities and relationships:
- **Campaign** has many Users (gamemaster + players), Characters, Fights, Sites, Parties, Factions
- **Character** belongs to Campaign, has many Schticks, Weapons, can join Fights via Shots
- **Fight** tracks combat with Shots (initiative system), belongs to Campaign
- **Shot** represents a character's position in initiative order
- **Vehicle** used in chase scenes, similar to Character
- **Juncture** represents time periods (Ancient, 1850s, Contemporary, Future)

Character types: `:pc`, `:npc`, `:uber_boss`, `:boss`, `:featured_foe`, `:mook`, `:ally`

## API Endpoints

### V2 API (Current - Phoenix)
Uses consistent RESTful patterns:
- `GET /api/v2/{resource}` - List with pagination
- `GET /api/v2/{resource}/{id}` - Show single resource
- `POST /api/v2/{resource}` - Create
- `PATCH /api/v2/{resource}/{id}` - Update
- `DELETE /api/v2/{resource}/{id}` - Delete

Resources: campaigns, characters, vehicles, fights, schticks, weapons, sites, parties, factions, junctures, users, invitations, encounters, ai, ai_images

### Authentication Endpoints
- `POST /users/sign_in` - Login (returns JWT)
- `POST /users/sign_up` - Registration
- `DELETE /users/sign_out` - Logout

### V1 API (Legacy - Deprecated)
V1 endpoints existed in the Rails backend. All new development should use V2 API.

## Testing Approach

### Backend Testing (Phoenix)
```bash
mix test                                   # Run all tests
mix test test/shot_elixir/characters_test.exs  # Run specific test file
mix test --only focus                      # Run focused tests
```

Test database setup:
```bash
mix ecto.create
mix ecto.migrate
```

### End-to-End Testing with Playwright

**Test Environment Setup:**
The Chi War application uses Playwright for end-to-end testing with a comprehensive test suite in `test-scripts/`.

**Reliable Test Environment Startup:**
```bash
# Kill any existing processes first
pkill -f "beam" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Phoenix server in background
cd shot-elixir && mix phx.server &

# Start Next.js development server in background
cd ../shot-client-next && npm run dev &

# Wait for servers to fully initialize
sleep 10
```

**Test Database Seed Data:**
The test environment is seeded with:
- **Gamemaster user**: `progressions@gmail.com` (password: `password`)
- **Player user**: `player@example.com` (password: `password`)
- **Campaigns**: "Test Campaign" (active), "Secondary Campaign", "Third Campaign"
- **User memberships**: Player user is member of multiple campaigns with "Test Campaign" as active
- **Characters**: Sample characters for testing

**Authentication in Tests:**
Tests use the `login-helper.js` module for authentication:
```javascript
const { loginAsPlayer, loginAsGamemaster } = require('./login-helper');

// Login as player user with seed data
await loginAsPlayer(page, { takeScreenshot: true, screenshotPath: 'test-results' });

// Login as gamemaster user with seed data  
await loginAsGamemaster(page, { takeScreenshot: true, screenshotPath: 'test-results' });
```

**Running Playwright Tests:**
```bash
cd test-scripts

# Complete End-to-End User Journey Test (PRIMARY TEST)
# Tests full user story from new visitor to running RPG session
# Validates: registration, onboarding, campaign creation, character creation, 
# world-building, player invitations, party formation, fight setup
node test-complete-user-journey.js

# Individual feature test scripts
node test-current-campaign-clearing-e2e.js
node test-campaign-activation.js
node test-profile-page.js

# UI validation tests (no backend integration required)
node test-current-campaign-clearing-ui-validated.js

# Run with Playwright test runner
npx playwright test tests/current-campaign-clearing.spec.js
```

**Complete User Journey Test:**
The `test-complete-user-journey.js` script provides comprehensive validation of the entire user experience:
- **Phase 1**: Gamemaster registration & setup (campaign, world-building)
- **Phase 2**: Player invitation & registration (4 players)  
- **Phase 3**: Character creation (4 players + GM NPCs)
- **Phase 4**: Session organization (party formation, fight setup)
- **Phase 5**: Gameplay validation (fight initiation, combat mechanics)

This test validates the complete "happy path" including the new user onboarding system and ensures all core functionality integrates properly.

**Test Structure:**
- `test-scripts/` - Individual Node.js test scripts using Playwright
- `test-scripts/tests/` - Official Playwright test format `.spec.js` files
- `login-helper.js` - Reusable authentication utilities
- `test-results/` - Screenshots and test artifacts
- `playwright.config.js` - Playwright configuration with server setup

**Known Issues:**
- Next.js development overlay can intercept clicks in some scenarios
- Use `page.locator().click({ force: true })` to bypass overlay interference  
- Backend API errors in test environment typically indicate authentication or seed data issues

### Frontend Testing
Playwright end-to-end tests provide comprehensive frontend validation. No additional unit test framework currently configured.

### Reliable Server Startup for Testing

**Starting Phoenix Server:**
```bash
# From shot-elixir directory:
cd shot-elixir
mix phx.server
# Or with interactive console:
iex -S mix phx.server
```

**Starting Next.js Development Server:**
```bash
# From shot-client-next directory:
cd shot-client-next
npm run dev
```

**Complete Test Environment Setup:**
```bash
# Kill all existing servers
pkill -f "beam" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Phoenix server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-elixir && mix phx.server' &

# Start Next.js server in background
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && npm run dev &

# Wait for servers to start
sleep 10

# Verify servers are running
curl -s http://localhost:4002/api/v2/users/current | head -1  # Should return auth error
curl -s http://localhost:3001 | head -1                       # Should return redirect
```

**Notes:**
- Phoenix server starts quickly (~2-3 seconds)
- Next.js server is usually ready in ~5-8 seconds
- Both servers will show proper error responses when running correctly
- Development uses the same database as production (shot_counter_local)

## Database Management

PostgreSQL with UUID primary keys:
```bash
mix ecto.create                   # Create database
mix ecto.migrate                  # Run migrations
mix ecto.rollback                 # Rollback last migration
mix run priv/repo/seeds.exs       # Load seed data
mix ecto.gen.migration add_field_to_model  # Generate migration
```

## Background Jobs

Oban processes these job types:
- AI character/image generation
- Email delivery
- Notion synchronization
- Discord notifications
- Campaign/fight broadcasts

Monitor jobs via Oban dashboard or IEx console:
```elixir
# In IEx
Oban.Job |> ShotElixir.Repo.all()
```

## Real-time Features

Phoenix Channels:
- `CampaignChannel` - Campaign-wide updates
- `FightChannel` - Fight-specific updates (shot changes, character actions)

Frontend subscribes via `@rails/actioncable` compatible Phoenix transport.

## Environment Variables

Backend (Phoenix) requires:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY_BASE` - Phoenix secret key
- `PHX_HOST` - Hostname (shot-elixir.fly.dev)
- `DISCORD_TOKEN` - Discord bot token
- `NOTION_TOKEN` - Notion API key
- `IMAGEKIT_*` - ImageKit credentials
- `MAILGUN_*` - Mailgun email credentials

Frontend requires:
- `NEXT_PUBLIC_API_URL` - Backend API URL (https://shot-elixir.fly.dev)
- `NEXT_PUBLIC_WS_URL` - WebSocket URL

## Deployment

### Backend (Phoenix) - shot-elixir
```bash
cd shot-elixir
fly deploy -a shot-elixir
fly logs -a shot-elixir
fly ssh console -a shot-elixir
```

### Frontend (Next.js) - shot-client-phoenix
```bash
cd shot-client-next
fly deploy -a shot-client-phoenix
fly logs -a shot-client-phoenix
```

### Production URLs
- **Frontend**: https://chiwar.net (shot-client-phoenix.fly.dev)
- **Backend API**: https://shot-elixir.fly.dev
- **Database**: shot-counter-db.fly.dev (PostgreSQL)

## Code Generation

Frontend component generation:
```bash
npm run generate:component
# Follow prompts to create component with test, styles, and index
```

Templates in `plop-templates/` define component structure.

## Important Patterns

1. **Authorization**: Gamemaster-only actions check `current_user.gamemaster?` or Guardian plugs
2. **Soft deletes**: Use `active` boolean instead of destroying records
3. **Campaign context**: Most operations scoped to `current_campaign`
4. **View selection**: Different view renders for index vs show actions
5. **Channel broadcasts**: Trigger after state changes for real-time updates
6. **Context modules**: Business logic organized by domain context (Accounts, Campaigns, Characters, etc.)
- run "nr fl" to lint and format in shot-client-next
- run "mix format" to format in shot-elixir

## Issue Tracking

When the user says **"create an issue"**, this means:

1. **Create a new markdown file** in the `issues/` directory
2. **File naming**: Use format `YYYY-MM-DD-short-description.md` (today's date + brief description)
3. **Use the template** from `issues/TEMPLATE.md` as the starting structure
4. **Fill in all sections**:
   - Date: Today's date
   - Priority: Low/Medium/High/Critical (based on severity)
   - Category: UI/UX, Backend, Frontend, Authentication, Performance, Testing, etc.
   - Description: Detailed explanation of the issue
   - Steps to Reproduce: Clear reproduction steps
   - Expected vs Actual Behavior
   - Related Files: Files that may need changes (with paths)
   - Screenshots: Reference any relevant images from test-results/
   - Investigation Notes: Any debugging context or findings
5. **Commit to git** with descriptive message
6. **Push to GitHub** to maintain issue tracking history

This creates a systematic approach to documenting bugs, improvements, and technical debt discovered during development and testing.
- use full paths to navigate to the root, shot-elixir, and shot-client-next directories
- when i say make a new branch, make a new branch in root, shot-elixir, and shot-client-next directories
- when writing tests, use the login-helper.js
- always use @agent-test-environment-manager to run tests
- shot-elixir and shot-client-next are gitignored, each their own git repo
- When developing new features, follow the development guide in chi-war/DEVELOPMENT_GUIDE.md.
Always start with Phase 0 (issue/specs review) before any code exploration.
- Any new API endpoints must use Api V2 in shot-elixir (Phoenix)
- **shot-elixir is the source of truth** - do not develop new features in shot-server (Rails)
