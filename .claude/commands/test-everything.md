---
description: Run tests - execute commands only, no analysis or modifications
---

test-everything: Execute these exact commands in sequence. Do not read files, analyze configurations, modify environment files, or debug issues. Just run commands and report results.

STEP 1: Reset database
```bash
cd . && [ -f Gemfile ] || cd backend || cd api || cd server
RAILS_ENV=test rails test_db:reset
```

STEP 2: Run Rails tests
```bash
RAILS_ENV=test bundle exec rspec
```

STEP 3: Run JavaScript tests  
```bash
npm test -- --detectOpenHandles --forceExit --testTimeout=10000
```

STEP 4: Run additional tests (optional)
```bash
npm run test:integration
npm run test:e2e
npm run lint
npm run type-check
npx playwright test
```

FORBIDDEN ACTIONS:
- Do not read .env files or any configuration files
- Do not modify any files whatsoever
- Do not kill processes or manage servers
- Do not analyze logs or debug authentication
- Do not check what's running on ports
- Do not create or modify environment variables

ONLY execute the commands above. If a command fails, try the quick fixes below ONCE, then move on:
- Add `bundle exec` prefix
- Add `--forceExit` to Jest commands

Report: "Tests passed" or "Tests failed" and stop.