# Repository Guidelines

## Project Structure & Module Organization
- `shot-client-next/`: Next.js (TypeScript) web client. Source in `src/`; tests in `src/**/__tests__/`; Playwright config in `playwright.config.ts`.
- `shot-server/`: Ruby on Rails API. App code in `app/`; tests in `spec/` (RSpec); migrations in `db/migrate/`.
- `legacy-client/`: Archived client; avoid new work here.
- Root testing helpers: Playwright script(s) and runner in `/` with `package.json` for quick e2e.
- Other: `issues/` (work notes), `specs/` (requirements), `blogs/`, `test-scripts/`.

## Build, Test, and Development Commands
- Client (from `shot-client-next/`):
  - `npm install` — install deps.
  - `npm run dev` — start Next.js dev server on port 3001.
  - `npm run build && npm start` — production build and start.
  - `npm test` / `npm run test:watch` / `npm run test:coverage` — unit tests (Jest).
  - `npm run e2e` / `npm run e2e:ui` — Playwright e2e.
- Server (from `shot-server/`):
  - `bundle install` — install gems.
  - `bin/rails db:setup` — create, migrate, seed.
  - `bin/rails s` — start API server.
  - `bundle exec rspec` — run RSpec suite.
- Root quick test (from repo root): `npm test` or `npm run test:headless` — runs Playwright flow in headless mode.

## Coding Style & Naming Conventions
- Client: TypeScript, 2‑space indent. Use Prettier and ESLint:
  - `npm run format`, `npm run lint`, or `./fix-lint.sh`.
  - Components: `PascalCase.tsx`; services: `PascalCase.ts` (e.g., `src/services/VehicleService.ts`).
- Server: Ruby, 2‑space indent, idiomatic Rails structure. Prefer service/poros for domain logic when appropriate.

## Testing Guidelines
- Client: Jest + Testing Library; files in `__tests__` with `*.test.ts(x)`. Aim for meaningful unit coverage; add Playwright e2e for user flows.
- Server: RSpec; specs in `spec/**/*_spec.rb`. Use factories/fixtures as needed; keep specs fast and deterministic.
- CI: Prefer `npm run test:ci` (client) and `bundle exec rspec` (server) in pipelines.

## Commit & Pull Request Guidelines
- Commits: Imperative present tense; scope prefix recommended, e.g. `client: fix dice roll lag`, `server: add index on shots`.
- PRs: Clear description, linked issue, screenshots for UI, reproduction steps, and test notes. Include migration/backfill details when touching `db/migrate/`.

## Security & Configuration Tips
- Client env: `.env.local`, `.env.test`, `.env.production` in `shot-client-next/` (do not commit secrets).
- Server env: manage via Rails env/credentials; rotate keys and avoid committing dumps.
