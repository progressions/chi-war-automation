# Migrate Legacy Service Tests to Jest Framework

**Date**: 2025-08-22
**Priority**: High
**Category**: Testing Migration

## Overview

Migrate existing comprehensive test suites for CharacterService, VehicleService, and SharedService from the legacy shot-counter project to the current shot-client-next Jest framework. This migration will preserve proven testing patterns while adapting them to the modern testing infrastructure.

## Source Analysis

### Legacy Test Infrastructure (`~/Old/tech/shot-counter/shot-client/__tests__/`)

**Test Files to Migrate:**
- `services/CharacterService.spec.ts` (942 lines) - Core character mechanics
- `services/VehicleService.spec.ts` (665 lines) - Vehicle combat system
- `services/SharedService.Character.spec.ts` (1,167 lines) - Shared character logic
- `services/SharedService.Vehicle.spec.ts` (1,167 lines) - Shared vehicle logic
- `services/AttackIntegration.spec.ts` - Combat integration tests
- `services/ChaseIntegration.spec.ts` - Chase mechanics integration

**Supporting Infrastructure:**
- `factories/Characters.ts` - Character archetype factories
- `factories/Vehicles.ts` - Vehicle type factories
- `factories/Weapons.ts` - Weapon definition factories
- `helpers/Helpers.ts` - Basic test utilities (dice mocking)
- `helpers/AttackHelpers.ts` - Combat scenario helpers
- `helpers/ChaseHelpers.ts` - Chase mechanics helpers

## Migration Strategy

### Phase 1: Infrastructure Setup

#### 1.1 Factory Migration (`src/__tests__/factories/`)
**Target Structure:**
```
src/__tests__/
├── factories/
│   ├── Characters.ts       # Character archetype definitions
│   ├── Vehicles.ts         # Vehicle type definitions
│   ├── Weapons.ts          # Weapon specifications
│   └── index.ts           # Unified factory exports
```

**Key Adaptations:**
- Update import paths for current project structure
- Adapt TypeScript types to match current type definitions
- Ensure compatibility with Jest framework
- Maintain existing factory patterns and data structures

#### 1.2 Helper Function Migration (`src/__tests__/helpers/`)
**Target Structure:**
```
src/__tests__/
├── helpers/
│   ├── Helpers.ts          # Basic test utilities
│   ├── AttackHelpers.ts    # Combat testing helpers
│   ├── ChaseHelpers.ts     # Chase mechanics helpers
│   └── index.ts           # Helper function exports
```

**Key Features to Preserve:**
- `roll()` function for deterministic dice mocking
- `expectAttack()` for automated combat validation
- `expectPursuitAttack()` for chase scenario testing
- State validation helper functions

### Phase 2: Test Suite Migration

#### 2.1 CharacterService Tests
**Migration Scope:**
- Core property accessors (`skill()`, `mainAttack()`, `defense()`, etc.)
- Combat calculations with impairment modifiers
- Wound/damage system (`takeSmackdown()`, `healWounds()`)
- Character type validation (`isMook()`, `isPC()`, `isBoss()`)
- State management and initiative system
- Functional composition patterns (`chain()` operations)

**Critical Test Scenarios:**
- Impairment thresholds (PC: 25/30, Boss: 40/45, UberBoss: 50/55)
- Mook special rules (ignores toughness, count-based)
- Full healing mechanics
- Boundary value testing for damage calculations

#### 2.2 VehicleService Tests
**Migration Scope:**
- Driver-based calculations (Driving skill integration)
- Vehicle statistics (`speed()`, `handling()`, `frame()`)
- Chase mechanics (`takeChasePoints()`, `takeConditionPoints()`)
- Position management (`isNear()`, `isFar()`)
- Chase actions (`evade()`, `ramSideswipe()`, etc.)

**Key Patterns:**
- Combined driver + vehicle impairments
- Position-aware testing (near/far mechanics)
- Asymmetric damage calculations

#### 2.3 SharedService Tests
**Migration Scope:**
- Cross-entity type checking
- Common impairment calculation logic
- Initiative and shot management
- Action value management (raw vs modified)

### Phase 3: Integration Testing

#### 3.1 Combat Integration
- Complete attack scenarios using `expectAttack()` helper
- Multi-character combat testing
- Stunt modifier validation
- Success and failure case coverage

#### 3.2 Chase Integration
- Vehicle pursuit scenarios
- Position-based damage calculations
- Method-specific mechanics (handling vs frame damage)

## Technical Adaptations Required

### 3.1 Import Path Updates
```typescript
// Legacy
import { CharacterService as CS } from '../services/CharacterService'

// New
import { CharacterService as CS } from '@/services/CharacterService'
```

### 3.2 Type Definition Alignment
- Map legacy Character/Vehicle interfaces to current types
- Update action value property names if changed
- Ensure factory objects match current entity structures

### 3.3 Jest Framework Integration
- Convert legacy test syntax to Jest patterns
- Update mock implementations for Jest
- Integrate with existing jest.setup.js configuration
- Ensure compatibility with current test utilities

### 3.4 Service API Alignment
- Verify method signatures match current implementations
- Update function calls if APIs have changed
- Handle any deprecated or renamed methods

## Expected Outcomes

### Test Coverage Metrics
- **CharacterService**: ~95 comprehensive tests
- **VehicleService**: ~70 comprehensive tests  
- **SharedService**: ~120 comprehensive tests
- **Integration Tests**: ~40 scenario tests
- **Total**: ~325 additional tests

### Quality Improvements
- **Proven Test Patterns**: Battle-tested approaches for complex game logic
- **Comprehensive Coverage**: Boundary conditions, edge cases, integration scenarios
- **Deterministic Testing**: Reliable dice mocking and state validation
- **Documentation Value**: Tests serve as executable specifications

### Development Benefits
- **Regression Prevention**: Catch breaking changes in core game mechanics
- **Refactoring Safety**: Confident code modifications with test coverage
- **Bug Prevention**: Early detection of mathematical errors and edge cases
- **Team Knowledge**: Preserve institutional knowledge of game rules

## Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Migrate factory files and adapt to current types
- [ ] Port helper functions and update for Jest
- [ ] Set up test directory structure
- [ ] Validate basic infrastructure works

### Phase 2: Core Service Tests (Days 3-5)
- [ ] Migrate CharacterService tests
- [ ] Migrate VehicleService tests
- [ ] Migrate SharedService tests
- [ ] Fix any API compatibility issues

### Phase 3: Integration & Validation (Days 6-7)
- [ ] Port integration test suites
- [ ] Validate all tests pass
- [ ] Performance optimization if needed
- [ ] Documentation updates

## Risk Mitigation

### Potential Challenges
- **API Drift**: Current services may have different method signatures
- **Type Mismatches**: Entity structures may have evolved
- **Framework Differences**: Jest vs legacy testing framework differences

### Mitigation Strategies
- **Incremental Migration**: Port one service at a time
- **API Verification**: Compare legacy and current service interfaces
- **Type Mapping**: Create adapter functions if needed
- **Validation Testing**: Ensure migrated tests actually validate current behavior

## Success Criteria

- [ ] All legacy test files successfully migrated to Jest
- [ ] Factory patterns working with current entity types
- [ ] Helper functions integrated with Jest framework
- [ ] All migrated tests passing
- [ ] Test coverage expanded from 82 to ~400+ tests
- [ ] No regression in existing test functionality
- [ ] Documentation updated with new test patterns

## Documentation Updates

- Update Jest README with factory and helper usage
- Document test data generation patterns
- Create examples for complex testing scenarios
- Update development workflow with comprehensive testing

This migration represents a significant expansion of test coverage while preserving proven testing methodologies and comprehensive game rule validation.