# Implementation Specification: 12 Priority Tests for Legacy Client

**Project**: shot-client (legacy) Test Coverage Expansion
**Date**: 2025-08-24
**Priority**: High
**Branch**: feature/expand-test-coverage-12-tests

## Overview

Implement 12 high-priority tests targeting critical areas with zero coverage. These tests address the highest business risks identified in the testing gap investigation.

## Implementation Order

### Sprint 1: Critical Infrastructure (4 tests)

#### 1. LocalStorageContext Test
**File**: `__tests__/contexts/LocalStorageContext.spec.tsx`
**Priority**: CRITICAL
**Test Cases**:
- Context provider initialization
- setValue and getValue operations
- removeValue functionality
- Storage event synchronization between tabs
- Error handling for quota exceeded
- Mock localStorage for all operations

#### 2. ToastContext Test
**File**: `__tests__/contexts/ToastContext.spec.tsx`
**Priority**: HIGH
**Test Cases**:
- Toast provider initialization
- Success, error, info, warning toast methods
- Auto-hide timer functionality
- Manual close functionality
- Queue management (single toast at a time)
- Toast state updates and re-renders

#### 3. Api Utility Test
**File**: `__tests__/utils/Api.extended.spec.ts`
**Priority**: CRITICAL
**Test Cases**:
- URL building for all resource types
- Nested resource URL construction
- Query parameter handling
- WebSocket URL generation
- Environment variable usage
- Edge cases: empty IDs, special characters

#### 4. Client Error Handling Test
**File**: `__tests__/utils/Client.extended.spec.ts`
**Priority**: HIGH
**Test Cases**:
- Network error recovery
- 401 unauthorized handling
- 403 forbidden handling
- 404 not found handling
- 500 server error handling
- Timeout scenarios
- Token refresh on 401

### Sprint 2: Component Integration (4 tests)

#### 5. RollInitiative Component Test
**File**: `__tests__/components/fights/RollInitiative.extended.spec.tsx`
**Priority**: HIGH
**Test Cases**:
- Component renders with fight data
- Initiative roll button click
- Dice rolling animation
- State updates after roll
- Error handling for failed rolls
- Loading states during roll
- Multiple character handling

#### 6. CharacterFilters Component Test
**File**: `__tests__/components/characters/CharacterFilters.spec.tsx`
**Priority**: MEDIUM
**Test Cases**:
- Filter panel rendering
- Type filter (PC, NPC, Boss, etc.)
- Faction filter
- Juncture filter
- Search by name
- Clear filters functionality
- Filter state persistence

#### 7. ActionModal Component Test
**File**: `__tests__/components/characters/ActionModal.spec.tsx`
**Priority**: HIGH
**Test Cases**:
- Modal open/close behavior
- Action form rendering
- Skill selection
- Dice roll integration
- Success/failure handling
- Character state updates
- Validation errors

#### 8. CreateCharacter Component Test
**File**: `__tests__/components/characters/CreateCharacter.extended.spec.tsx`
**Priority**: HIGH
**Test Cases**:
- Form initialization
- Field validation
- Archetype selection
- Action value calculations
- Save functionality
- Error handling
- Campaign association
- Success redirect

### Sprint 3: Services & Edge Cases (4 tests)

#### 9. FightEventService Test
**File**: `__tests__/services/FightEventService.spec.ts`
**Priority**: MEDIUM
**Test Cases**:
- Event creation
- Event types validation
- Event ordering
- Event details formatting
- Character action events
- Shot advancement events
- Combat resolution events

#### 10. WeaponService Test
**File**: `__tests__/services/WeaponService.spec.ts`
**Priority**: MEDIUM
**Test Cases**:
- Damage calculation
- Concealment values
- Reload mechanics
- Weapon categories
- Juncture-specific weapons
- Special weapon properties
- Edge cases: negative damage, overflow

#### 11. PartyService Extended Test
**File**: `__tests__/services/PartyService.extended.spec.ts`
**Priority**: LOW
**Test Cases**:
- Adding duplicate members
- Removing non-existent members
- Party size limits
- Mixed character/vehicle parties
- Faction conflicts
- Secret party visibility
- Party dissolution

#### 12. DiceService Extended Test
**File**: `__tests__/services/DiceService.extended.spec.ts`
**Priority**: MEDIUM
**Test Cases**:
- Extreme explosion chains (100+ consecutive 6s)
- Performance with 1000+ dice pools
- Memory usage monitoring
- Statistical distribution validation
- Floating point precision
- Random seed consistency
- Edge case: all 1s rolled

## Test Implementation Guidelines

### Setup Requirements

```typescript
// Common test setup for all files
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, createTheme } from '@mui/material'
import { createMockCharacter, createMockFight, createMockWeapon } from '@/__tests__/factories/MockFactories'

const theme = createTheme()

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}
```

### Mock Patterns

```typescript
// LocalStorage mock
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}
global.localStorage = localStorageMock as Storage

// Network request mock
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Timer mocks
jest.useFakeTimers()
```

### Test Structure

```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      // Arrange
      // Act
      // Assert
    })
  })

  describe('user interactions', () => {
    it('should handle user action', async () => {
      // Arrange
      // Act
      // Assert
    })
  })

  describe('error scenarios', () => {
    it('should handle error gracefully', () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

## Success Criteria

### Per Test File
- Minimum 5 test cases
- 80%+ code coverage for target file
- All tests passing
- Proper mocks configured
- No console errors/warnings

### Overall
- All 12 test files implemented
- No regression in existing tests
- Test execution time < 30 seconds
- Documentation updated
- Code review completed

## Verification Commands

```bash
# Run all new tests
npm test -- --testPathPattern="(LocalStorageContext|ToastContext|Api.extended|Client.extended|RollInitiative.extended|CharacterFilters|ActionModal|CreateCharacter.extended|FightEventService|WeaponService|PartyService.extended|DiceService.extended)"

# Check coverage
npm test -- --coverage --collectCoverageFrom="src/**/*.{ts,tsx}"

# Run full test suite
npm test
```

## Risk Mitigation

### Potential Issues
1. **Mock conflicts**: Use jest.isolateModules for test isolation
2. **Async timing**: Use waitFor and act for async operations
3. **Memory leaks**: Cleanup in afterEach hooks
4. **Type errors**: Ensure MockFactories match actual types

### Rollback Plan
- Tests are additive only
- No production code changes
- Can disable individual test files if needed
- Branch can be abandoned without impact

## Next Steps After Completion

1. Update test_strategy.yml with new test count
2. Document any new mock patterns discovered
3. Create follow-up issue for next 12 tests
4. Consider E2E tests for critical user flows
5. Update coverage reports

## References

- Original investigation: `/issues/2025-01-27-investigate-additional-testing-opportunities.md`
- Test strategy: `/test_strategy.yml`
- Mock factories: `/__tests__/factories/MockFactories.ts`
- Existing patterns: Review existing test files for consistency