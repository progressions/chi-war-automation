# Repository Guidelines

## Project Structure & Module Organization
The monorepo hosts multiple runtimes. `shot-client-next/` contains the Next.js TypeScript app under `src/` with colocated tests in `src/**/__tests__/`. Rails API code lives in `shot-server/` (`app/`, `spec/`, `db/migrate/`). Shared specs, archived assets, and research notes sit in top-level folders such as `specs/`, `blogs/`, and `legacy-client/`; treat those as reference-only unless a task explicitly targets them. Frontend Playwright configuration is rooted beside this guide (`playwright.config.ts`).

## Build, Test, and Development Commands
Install frontend dependencies with `cd shot-client-next && npm install`. Run the dev server on port 3001 using `npm run dev`, or build for production via `npm run build && npm start`. Execute Jest suites with `npm test`. Launch Playwright smoke tests from the repo root using `npm test` or run the full UI harness through `shot-client-next/npm run e2e[:ui]`. For the Rails API, prepare dependencies with `cd shot-server && bundle install` and seed databases using `bin/rails db:setup`. Start the server through `bin/rails s`; exercise specs via `bundle exec rspec`.

## Coding Style & Naming Conventions
Use 2-space indentation across TypeScript and Ruby. React components and hooks live in `PascalCase.tsx` and `camelCase.ts` respectively; keep services in `PascalCase.ts`. Favor functional components with explicit prop types. Format and lint frontend code using `npm run format` and `npm run lint`. Follow idiomatic Rails naming for models, controllers, and background jobs.

## Testing Guidelines
Frontend unit tests rely on Jest and Testing Library; mirror source structure and name files `*.test.ts(x)` inside `__tests__/`. Playwright drives regression coverage—document notable scenarios whenever you touch critical flows. Rails specs use RSpec with factories; reset state through fixtures or factories to keep runs deterministic. Strive for targeted coverage rather than exhaustive snapshots.

## Commit & Pull Request Guidelines
Commit messages should be imperative and descriptive (`chore: update documentation and add test script (#37)`); include scope prefixes when helpful. PRs need linked issues, reproduction or setup steps, executed test notes, and UI captures for visual changes. Flag migrations or data backfills early so release owners can plan deployments.

## Security & Configuration Tips
Keep secrets in `shot-client-next/.env.*` or Rails credentials; never commit raw keys. Review `API_PATTERNS.md` and `TESTING.md` before modifying API integrations to align with authentication and error-handling expectations.
