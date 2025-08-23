# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a coordination repository for managing Feng Shui 2 RPG campaigns with three separate applications:
- **shot-server**: Ruby on Rails 8.0 API backend (port 3000) - separate git repository
- **shot-client-next**: Next.js 15.4 frontend (port 3001) - separate git repository, current main frontend
- **legacy-client**: Original Next.js frontend - calls API v1 endpoints, maintained for backward compatibility

### Directory Structure

```
chi-war/                          # Root coordination repository
├── create-invitation.sh          # Quick script to generate test invitations (./create-invitation.sh [email])
├── shot-server/                  # Rails API backend (separate git repo, gitignored)
│   ├── app/                      # Rails application code
│   │   ├── controllers/          # API controllers (v1, v2)
│   │   ├── models/               # Active Record models
│   │   ├── serializers/          # JSON response formatting
│   │   ├── services/             # Business logic services
│   │   ├── jobs/                 # Background job processing
│   │   └── channels/             # WebSocket channels
│   ├── config/                   # Rails configuration
│   ├── db/                       # Database migrations and seeds
│   ├── spec/                     # RSpec test suite
│   └── CLAUDE.md                 # Rails-specific documentation
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
├── legacy-client/                # Original Next.js frontend (separate git repo)
│   ├── components/               # React components organized by feature
│   ├── pages/                    # Next.js Pages Router structure
│   ├── contexts/                 # React context providers
│   ├── services/                 # Business logic services
│   ├── reducers/                 # State management
│   ├── utils/                    # API clients and utilities
│   ├── types/                    # TypeScript type definitions
│   └── package.json              # Dependencies and scripts
├── issues/                       # Issue tracking (markdown files)
│   ├── TEMPLATE.md               # Issue template
│   └── *.md                      # Individual issue files
├── specs/                        # Development specifications
│   └── *.md                      # Feature specifications and plans
├── test-scripts/                 # Playwright automation scripts
│   ├── test-*.js                 # E2E test scripts
│   ├── login-helper.js           # Test authentication helper
│   └── test-results/             # Test screenshots and artifacts
├── .gitignore                    # Ignores shot-server/ and shot-client-next/ 
└── CLAUDE.md                     # This file - overall documentation
```

**Key Points:**
- **shot-server/** and **shot-client-next/** are separate git repositories, ignored by the root .gitignore
- Root chi-war repository tracks shared coordination files: issues, specs, test scripts, and documentation
- Each sub-application maintains its own git history and CLAUDE.md documentation
- Development workflow involves working in individual repositories while coordinating through shared test infrastructure
- Issues directory provides systematic tracking of bugs and improvements
- Test scripts validate critical user flows across both applications

## Common Development Commands

### Backend (shot-server)
```bash
cd shot-server
bundle install                    # Install dependencies
rails db:migrate                  # Run database migrations
rails server                      # Start development server
bundle exec sidekiq               # Start background job processor
bundle exec rspec                 # Run all tests
bundle exec rspec spec/models/    # Run model tests
rails console                     # Interactive Rails console
rails discord:register_commands   # Register Discord bot commands
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

## Test Environment Configuration

**Separate Test Ports for Concurrent Development and Testing:**

### Development Servers (Default)
- **Rails**: Port 3000 (`rails server`)
- **Next.js**: Port 3001 (`npm run dev`)

### Starting Development Environment

**Complete Development Environment Setup:**
```bash
# Kill all existing servers
pkill -f "rails server" ; pkill -f "puma" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Rails development server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && rails server -p 3000' &

# Start Next.js development server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && npm run dev' &

# Wait for servers to start
sleep 10

# Verify servers are running
curl -s http://localhost:3000/api/v2/users/current | head -1  # Should return auth error
curl -s http://localhost:3001 | head -1                      # Should return redirect
```

**Individual Server Startup:**

For Rails development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
rails server -p 3000
```

For Next.js development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
npm run dev
```

**Notes:**
- Rails development server takes ~8-10 seconds to fully start
- Next.js server is usually ready in ~3-5 seconds with Turbopack
- Both servers should show proper error responses when running correctly
- Rails development environment uses the main database (not test database)

### Test Servers (Isolated Testing)
- **Rails**: Port 3004 (`rails test:server`)
- **Next.js**: Port 3005 (`npm run test`)

### Starting Test Environment
```bash
# Terminal 1 - Start Rails test server (cleans and seeds test DB)
cd shot-server && rails test:server

# Terminal 2 - Start Next.js test server
cd shot-client-next && npm run test

# Terminal 3 - Run E2E tests (uses ports 3004/3005)
cd test-scripts && node test-invitation-simple.js
```

**Benefits:**
- Keep development servers running while testing
- Isolated test database with proper seed data
- E2E tests use dedicated test ports (3004/3005)
- No interference between development and testing workflows

## High-Level Architecture

### Backend Architecture
The Rails API follows a service-oriented pattern with:
- **Controllers** in `app/controllers/api/v1/` and `api/v2/` - Handle HTTP requests
- **Models** in `app/models/` - Active Record models with UUID primary keys
- **Serializers** in `app/serializers/` - Format JSON responses  
- **Services** in `app/services/` - Complex business logic
- **Jobs** in `app/jobs/` - Background processing with Sidekiq
- **Channels** in `app/channels/` - WebSocket connections via Action Cable

Key services:
- `AiService` - Character generation using AI
- `NotionService` - Sync characters to Notion
- `DiscordBot` - Discord integration for game management
- `CharacterDuplicatorService` - Clone characters
- `DiceRoller` - Dice rolling logic

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
1. Frontend authenticates via Devise JWT tokens stored in localStorage
2. API requests use Axios with token in Authorization header
3. Real-time updates via Action Cable WebSocket connections
4. CORS configured for cross-origin requests

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

### V1 API (Legacy)
- `/api/v1/characters` - Character CRUD
- `/api/v1/fights` - Fight management
- `/api/v1/campaigns` - Campaign operations

### V2 API (Current)
Uses consistent RESTful patterns:
- `GET /api/v2/{resource}` - List with pagination
- `GET /api/v2/{resource}/{id}` - Show single resource
- `POST /api/v2/{resource}` - Create
- `PATCH /api/v2/{resource}/{id}` - Update
- `DELETE /api/v2/{resource}/{id}` - Delete

Resources: campaigns, characters, vehicles, fights, schticks, weapons, sites, parties, factions, junctures, users

## Testing Approach

### Backend Testing
```bash
bundle exec rspec                          # Run all tests
bundle exec rspec spec/models/character_spec.rb  # Run specific test file
bundle exec rspec --tag focus              # Run focused tests
```

Test database setup:
```bash
rails db:test:prepare
```

### End-to-End Testing with Playwright

**Test Environment Setup:**
The Chi War application uses Playwright for end-to-end testing with a comprehensive test suite in `test-scripts/`.

**Reliable Test Environment Startup:**
```bash
# Kill any existing processes first
pkill -f "rails server" ; pkill -f "puma" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Set up test database with proper seed data
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
RAILS_ENV=test rails db:create db:migrate db:seed

# Start Rails test server in background
RAILS_ENV=test rails server -p 3000 &

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

**Starting Rails Server in TEST Environment:**
```bash
# From shot-server directory:
# 1. Kill any existing processes
pkill -f "rails server" ; pkill -f "puma" ; sleep 2

# 2. Start Rails test server
source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails db:prepare && RAILS_ENV=test rails server -p 3000
```

**Starting Next.js Development Server:**
```bash
# From shot-client-next directory:
# 1. Kill any existing processes
pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 2

# 2. Start Next.js server
npm run dev
```

**Complete Test Environment Setup:**
```bash
# Kill all existing servers
pkill -f "rails server" ; pkill -f "puma" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Rails test server in background
bash -c 'source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails server -p 3000' &

# Start Next.js server in background
cd /path/to/shot-client-next && npm run dev &

# Wait for servers to start
sleep 10

# Verify servers are running
curl -s http://localhost:3000/api/v2/users/current | head -1  # Should return auth error
curl -s http://localhost:3001 | head -1                      # Should return redirect
```

**Notes:**
- Rails test server takes ~8-10 seconds to fully start
- Next.js server is usually ready in ~5-8 seconds
- Both servers will show proper error responses when running correctly
- Rails test environment uses separate database from development

## Database Management

PostgreSQL with UUID primary keys:
```bash
rails db:create                   # Create database
rails db:migrate                  # Run migrations
rails db:rollback                 # Rollback last migration
rails db:seed                     # Load seed data
rails generate migration AddFieldToModel field:type  # Generate migration
```

## Background Jobs

Sidekiq processes these job types:
- AI character/image generation
- Notion synchronization  
- Discord notifications
- Campaign/fight broadcasts

Monitor jobs:
```bash
bundle exec sidekiq
# Visit http://localhost:3000/sidekiq for web UI
```

## Real-time Features

Action Cable channels:
- `CampaignChannel` - Campaign-wide updates
- `FightChannel` - Fight-specific updates (shot changes, character actions)

Frontend subscribes via `@rails/actioncable` package.

## Environment Variables

Backend requires:
- Database credentials
- Redis URL
- JWT secret
- Discord bot token
- Notion API key
- ImageKit credentials
- AWS S3 credentials

Frontend requires:
- API base URL
- WebSocket URL

## Deployment

Backend deployed to Fly.io:
```bash
fly deploy
fly logs
fly ssh console
```

## Code Generation

Frontend component generation:
```bash
npm run generate:component
# Follow prompts to create component with test, styles, and index
```

Templates in `plop-templates/` define component structure.

## Important Patterns

1. **Authorization**: Gamemaster-only actions check `current_user.gamemaster?`
2. **Soft deletes**: Use `active` boolean instead of destroying records
3. **Campaign context**: Most operations scoped to `current_campaign`
4. **Serializer selection**: Different serializers for index vs show actions
5. **WebSocket broadcasts**: Trigger after state changes for real-time updates
- run "nr fl" to lint and format

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
- use full paths to navigate to the root, server, and client directories
- when i say make a new branch, make a new branch in root, server, and client directories
- when writing tests, use the login-helper.js
- always use @agent-test-environment-manager to run tests
- in chi-war/CLAUDE.md describe the directory structure, where shot-server and shot-client-next are gitignored, each their own repo
- When developing new features, follow the development guide in chi-war/DEVELOPMENT_GUIDE.md. 
Always start with Phase 0 (issue/specs review) before any code exploration.