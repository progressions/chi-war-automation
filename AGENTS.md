# Repository Guidelines

## Project Structure & Module Organization
- `shot-client-next/`: Next.js TypeScript client. App code lives in `src/`; colocated unit tests sit in `src/**/__tests__/`. Playwright config and scripts reside at the root (`playwright.config.ts`).
- `shot-server/`: Ruby on Rails API with domain logic under `app/`, specs in `spec/`, and database migrations in `db/migrate/`.
- Archive and reference materials (`legacy-client/`, `issues/`, `specs/`, `blogs/`, `test-scripts/`) are read-only unless explicitly tasked.

## Build, Test, and Development Commands
- Client setup: `cd shot-client-next && npm install` installs dependencies.
- Client dev: `npm run dev` (port 3001) for live reload; production via `npm run build && npm start`.
- Client tests: `npm test` for Jest suites; `npm run e2e` or `npm run e2e:ui` for Playwright.
- Server setup: `cd shot-server && bundle install`, then `bin/rails db:setup` to provision the database.
- Server runtime: `bin/rails s` launches the API; `bundle exec rspec` runs the spec suite.
- Root quick regression: `npm test` executes the headless Playwright smoke run.

## Coding Style & Naming Conventions
- TypeScript/React: 2-space indent, components in `PascalCase.tsx`, services in `PascalCase.ts`. Format with `npm run format` or `npm run lint`.
- Ruby: idiomatic Rails conventions with 2-space indent. Prefer POROs/services for complex domain behavior.
- Keep secrets in `shot-client-next/.env.*` and Rails credentials; do not commit sensitive values.

## Testing Guidelines
- Jest + Testing Library for client unit tests; name files `*.test.ts(x)` inside `__tests__/` folders.
- Playwright handles regression and UI verification via `npm run e2e` (headless) or `npm run e2e:ui` (interactive).
- Server specs rely on RSpec factories; ensure tests remain deterministic and reset state via fixtures or factories.
- Aim to document coverage or e2e notes when updating critical flows.

## Commit & Pull Request Guidelines
- Use comprehensive, detailed commit messages with examples and outlines of files changed
- PRs should link relevant issues, explain reproduction/setup, list executed tests, and include UI screenshots when applicable.
- Flag migrations or backfills in the PR description and coordinate deployments when schema changes ship.
