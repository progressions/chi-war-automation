# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo containing two applications for managing Feng Shui 2 RPG campaigns:
- **shot-server**: Ruby on Rails 8.0 API backend (port 3000)
- **shot-client-next**: Next.js 15.4 frontend (port 3001)

### Directory Structure

```
chi-war/                          # Root monorepo directory
├── shot-server/                  # Rails API backend
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
├── shot-client-next/             # Next.js frontend
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
├── issues/                       # Issue tracking (markdown files)
│   ├── TEMPLATE.md               # Issue template
│   └── *.md                      # Individual issue files
├── test-scripts/                 # Playwright automation scripts
│   ├── test-fight-creation.js    # E2E fight creation test
│   ├── test-login-redirect.js    # Login redirect test
│   └── test-results/             # Test screenshots and artifacts
└── CLAUDE.md                     # This file - overall documentation
```

**Key Points:**
- Each sub-application has its own git repository and CLAUDE.md
- Root directory coordinates both applications and contains shared testing infrastructure
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

### Frontend Testing
Currently no test framework configured. Consider adding Jest/React Testing Library.

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