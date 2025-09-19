# Repository Guidelines

## Project Structure & Module Organization
- `shot-client-next/`: Next.js TypeScript client; app source under `src/`, unit tests in `src/**/__tests__/`, Playwright config in `playwright.config.ts`.
- `shot-server/`: Ruby on Rails API; core code in `app/`, specs in `spec/`, migrations in `db/migrate/`.
- Legacy and reference materials live in `legacy-client/`, `issues/`, `specs/`, `blogs/`, and `test-scripts/`; avoid new work in archived areas unless explicitly tasked.

## Build, Test, and Development Commands
- Client setup: `cd shot-client-next && npm install` to install dependencies.
- Client dev server: `npm run dev` (port 3001); production: `npm run build && npm start`.
- Client tests: `npm test` (Jest), `npm run e2e` / `npm run e2e:ui` (Playwright).
- Server setup: `cd shot-server && bundle install`, then `bin/rails db:setup` for DB prep.
- Server runtime: `bin/rails s`; specs: `bundle exec rspec`.
- Root quick flow: run `npm test` for headless Playwright regression.

## Coding Style & Naming Conventions
- TypeScript/React uses 2-space indent, components in `PascalCase.tsx`, services in `PascalCase.ts`.
- Ruby follows idiomatic Rails with 2-space indent; prefer POROs/services for domain logic.
- Enforce formatting with `npm run format`, `npm run lint`, or `./fix-lint.sh` (client).

## Testing Guidelines
- Client unit tests use Jest + Testing Library; name files `*.test.ts(x)` under `__tests__/`.
- Server tests rely on RSpec; keep specs deterministic and leverage factories.
- CI expectations: `npm run test:ci` for client, `bundle exec rspec` for server; add coverage or e2e notes when applicable.

## Commit & Pull Request Guidelines
- Commits use imperative, scoped prefixes (e.g., `client: add form validation`, `server: add index on shots`).
- PRs should link issues, outline reproduction/setup, include screenshots for UI, and note migrations/backfills.
- Document test evidence in PR descriptions (`npm test`, `bundle exec rspec`, or Playwright runs) to streamline review.

## Security & Configuration Tips
- Keep client environment secrets in `shot-client-next/.env.*`; never commit sensitive values.
- Manage server credentials via Rails environments; rotate keys regularly and avoid dumping secrets into version control.
