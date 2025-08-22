# Configure Jest Unit Testing Framework for Frontend

**Date**: 2025-08-22
**Priority**: Medium
**Category**: Testing

## Description

The shot-client-next frontend project has unit test files but lacks Jest configuration and testing dependencies, preventing tests from running.

## Current Situation

- Unit test files exist in `src/components/ui/__tests__/` and `src/components/users/profile/__tests__/`
- Tests use `@testing-library/react` and Jest syntax
- No `test` script in package.json
- Jest and testing libraries not installed as dependencies

## Steps to Reproduce

1. Try to run `npm test` in shot-client-next
2. Get error: "Missing script: test"
3. Existing test files cannot be executed

## Expected Behavior

- `npm test` should run all unit tests
- Jest should be configured for Next.js environment
- Tests should run successfully with proper setup

## Actual Behavior

- No test runner available
- Cannot execute existing unit tests
- Missing testing dependencies

## Required Changes

### 1. Install Testing Dependencies

Add to package.json devDependencies:
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.0.0",
  "@testing-library/user-event": "^14.0.0",
  "jest": "^29.0.0",
  "jest-environment-jsdom": "^29.0.0"
}
```

### 2. Add Test Script

Add to package.json scripts:
```json
{
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### 3. Jest Configuration

Create `jest.config.js`:
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### 4. Jest Setup File

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom'
```

## Related Files

- `src/components/ui/__tests__/EmailChangeConfirmation.test.tsx`
- `src/components/users/profile/__tests__/ProfilePageClient.test.tsx`
- `package.json`

## Investigation Notes

- Tests are already written and follow proper testing patterns
- Missing only the Jest configuration and dependencies
- Next.js has built-in Jest support that should be leveraged

## Acceptance Criteria

- [ ] Jest and testing libraries installed
- [ ] `npm test` runs all unit tests successfully
- [ ] Existing test files execute without errors
- [ ] Test coverage reporting available
- [ ] CI-friendly test configuration

## Implementation Priority

Medium - Unit tests are valuable for development confidence but E2E tests provide more comprehensive coverage for this application.