# Jest Unit Testing Framework Implementation

**Date**: 2025-08-22  
**Author**: Claude Code  
**Priority**: Medium  
**Category**: Testing Infrastructure  

## Overview

Implement Jest unit testing framework for the shot-client-next frontend to enable unit testing of critical components, hooks, and utilities. This will complement the existing Playwright E2E testing infrastructure.

## Current State

- **Existing**: Two test files using @testing-library/react and Jest syntax
  - `src/components/ui/__tests__/EmailChangeConfirmation.test.tsx`
  - `src/components/users/profile/__tests__/ProfilePageClient.test.tsx`
- **Missing**: Jest configuration, testing dependencies, test runner scripts
- **Issue**: Cannot execute `npm test` - no test script configured

## Goals

1. **Enable unit testing** - Add Jest framework with Next.js integration
2. **Test critical components** - Focus on high-value, reusable parts of the codebase
3. **Establish patterns** - Create testing utilities and standards for future development
4. **Complement E2E tests** - Unit tests for logic, E2E for user flows

## Implementation Plan

### Phase 1: Infrastructure Setup

#### 1.1 Dependencies Installation
Add to `package.json` devDependencies:
```json
{
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.6.4", 
  "@testing-library/user-event": "^14.5.2",
  "@types/jest": "^29.5.14",
  "jest": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "jest-mock-extended": "^4.0.0-beta7"
}
```

#### 1.2 Configuration Files

**jest.config.js**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
}

module.exports = createJestConfig(customJestConfig)
```

**jest.setup.js**
```javascript
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:3004'
process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3004'
process.env.NEXT_PUBLIC_WEBSOCKET_URL = 'http://localhost:3004'

// Mock window.matchMedia for Material-UI
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    searchParams: new URLSearchParams(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock js-cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}))

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  })),
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}))
```

#### 1.3 Test Utilities

**src/test-utils.tsx**
```typescript
import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { AppProvider, ToastProvider } from '@/contexts'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'

const theme = createTheme()

interface TestProvidersProps {
  children: React.ReactNode
}

const TestProviders = ({ children }: TestProvidersProps) => (
  <ThemeProvider theme={theme}>
    <AppProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AppProvider>
  </ThemeProvider>
)

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
```

#### 1.4 Package.json Scripts
Add to scripts section:
```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --watchAll=false"
}
```

### Phase 2: Priority Test Implementation

#### 2.1 FormState Reducer Tests
**File**: `src/reducers/__tests__/formState.test.ts`

**Test Coverage**:
- All FormActions enum values (EDIT, SUBMIT, ERROR, etc.)
- State immutability verification
- Nested object updates
- Error state management
- Loading state transitions
- Form reset functionality

**Key Test Cases**:
```typescript
describe('formReducer', () => {
  test('EDIT action updates nested data correctly')
  test('ERROR action sets error message and clears loading')
  test('LOADING action manages loading state')
  test('RESET action returns to initial state')
  test('maintains state immutability on all actions')
})
```

#### 2.2 Autocomplete Component Tests
**File**: `src/components/ui/__tests__/Autocomplete.test.tsx`

**Test Coverage**:
- Async option fetching with loading states
- User input and selection behavior
- Exclude list filtering functionality
- "None" option handling (allowNone prop)
- Debounced search functionality
- Error state handling
- Accessibility attributes

**Key Test Cases**:
```typescript
describe('Autocomplete', () => {
  test('fetches and displays options on input')
  test('calls onChange when option is selected')
  test('excludes specified options from results')
  test('shows "None" option when allowNone=true')
  test('handles loading and error states')
  test('debounces search input')
})
```

#### 2.3 useEntity Hook Tests
**File**: `src/hooks/__tests__/useEntity.test.ts`

**Test Coverage**:
- CRUD operations (create, read, update, delete)
- Success and error handling for each operation
- Loading state management
- Toast notification triggers
- Form state integration
- Router navigation on success/error

**Key Test Cases**:
```typescript
describe('useEntity', () => {
  test('getEntities handles success and error cases')
  test('updateEntity processes FormData correctly')
  test('deleteEntity shows confirmation and handles response')
  test('createEntity redirects on success')
  test('shows appropriate toast notifications')
})
```

### Phase 3: Test Infrastructure Enhancements

#### 3.1 Mock Factories
Create reusable mock factories for common entities:
- User fixtures with different roles (gamemaster, player)
- Campaign fixtures with various states
- Character fixtures with different types
- API response fixtures

#### 3.2 Custom Jest Matchers
Add custom matchers for common test patterns:
- Material-UI component state assertions
- Form state validation
- API call verification

#### 3.3 Test Documentation
- Testing patterns guide
- Mock usage examples
- Component testing strategies

## Benefits

### Immediate Value
- **Confidence in core logic** - Test critical components before deployment
- **Faster debugging** - Unit tests isolate issues faster than E2E tests
- **Refactoring safety** - Tests catch breaking changes during refactors

### Long-term Value
- **Development velocity** - Faster feedback loop than E2E tests
- **Code quality** - Encourages testable, modular code design
- **Team productivity** - Clear testing patterns for future development

### Complementary to E2E Testing
- **Unit tests**: Component logic, hooks, utilities, state management
- **E2E tests**: User flows, integration points, full application behavior

## Success Criteria

- [ ] Jest configuration installed and running
- [ ] All existing tests pass with new setup
- [ ] FormState reducer has 90%+ test coverage
- [ ] Autocomplete component has comprehensive test suite
- [ ] useEntity hook has full CRUD operation coverage
- [ ] Test utilities support common testing patterns
- [ ] Documentation for testing approach created
- [ ] CI-ready test configuration

## Migration Notes

- Existing test files require no changes - they use compatible patterns
- E2E tests remain primary testing strategy for user flows
- Unit tests focus on isolated component and utility logic
- No impact on current development or deployment processes

## Future Extensions

1. **Expand coverage** - Add tests for more components and hooks
2. **Visual regression** - Consider Storybook + Chromatic for UI testing
3. **Integration tests** - Test component combinations and workflows
4. **Performance tests** - Add benchmarks for critical operations