# Testing Gap Investigation Report
**shot-client-next Jest Unit Testing Enhancement**

**Date**: 2025-01-27  
**Current Test Status**: 344 passing tests  
**Investigation Goal**: Identify additional testing opportunities and edge cases

---

## Executive Summary

This comprehensive investigation analyzed the shot-client-next codebase to identify critical testing gaps beyond the existing 344 Jest unit tests. The analysis revealed significant untested areas in React components, custom hooks, API clients, and context providers that represent high business risk and regression potential.

**Key Findings:**
- **50+ high-priority components/functions** identified requiring Jest coverage
- **20+ critical edge cases** missing from existing test suites
- **Zero test coverage** for context providers (authentication, real-time features)
- **Zero test coverage** for API client layer (network communication)
- **Zero test coverage** for custom React hooks (data management)
- **Path to 500+ total tests** with comprehensive coverage plan

---

## Current Testing State Analysis

### ✅ Well-Tested Areas (344 tests)
- **Core Services**: CharacterService, VehicleService, SharedService, DiceService
- **Utility Functions**: parseToNumber, queryParams, filterConfigs, errorHandler, paginateArray
- **State Management**: formState, userState reducers
- **Select Components**: Autocomplete, EmailChangeConfirmation, ProfilePageClient
- **Hook Testing**: useEntity (comprehensive 350-line test suite)

### ❌ Critical Testing Gaps
- **0 tests** for React Context providers (authentication, real-time updates)
- **0 tests** for API client layer (network communication)
- **0 tests** for 8 out of 9 custom React hooks
- **0 tests** for complex React components (forms, lists, modals)
- **Limited edge case coverage** in existing service tests

---

# Phase 1: React Components Analysis

## Critical Components Requiring Tests (High Priority)

### Form Components
**Risk Level**: CRITICAL - Data validation and submission failures directly impact users

1. **Character Form Components** (`src/components/characters/`)
   - Complex validation logic for RPG character stats
   - File upload handling for character images/PDFs
   - Multi-step form workflows with state persistence

2. **Campaign Management Forms** (`src/components/campaigns/`)
   - Invitation creation and redemption flows
   - User permission management
   - Campaign setting validation

3. **Authentication Forms** (`src/app/auth/`)
   - Login/signup validation
   - Password reset workflows
   - Email confirmation handling

### List/Table Components
**Risk Level**: HIGH - Data display and filtering affects user experience

4. **Resource List Components** (`src/components/*/List.tsx`)
   - Pagination and sorting logic
   - Filter application and clearing
   - Bulk action handling

5. **Data Table Components** (`src/components/*/Table.tsx`)
   - Column sorting and ordering
   - Row selection and bulk operations
   - Responsive mobile layouts

### Modal/Dialog Components
**Risk Level**: HIGH - Modal state management affects user workflows

6. **Confirmation Dialogs**
   - Delete confirmation workflows
   - Unsaved changes warnings
   - Action confirmation modals

### Navigation Components
**Risk Level**: MEDIUM - Navigation failures affect app usability

7. **Breadcrumb Components**
   - Route-based breadcrumb generation
   - Deep navigation state management

---

# Phase 2: Custom React Hooks Analysis

## Critical Hooks Requiring Tests (All Currently Untested)

### CRITICAL PRIORITY

**1. useImageGeneration** (`src/hooks/useImageGeneration.ts`)
- **Complexity**: HIGH - WebSocket subscriptions, async operations
- **Risk**: CRITICAL - AI image generation with real-time updates
- **Missing Tests**: WebSocket lifecycle, memory leak prevention, error handling

**2. useForm** (`src/reducers/formState.ts`)
- **Complexity**: HIGH - Complex reducer with 10+ action types
- **Risk**: CRITICAL - Core form functionality across entire app
- **Missing Tests**: All reducer state transitions, validation states

**3. useApp** (`src/contexts/AppContext.tsx`)
- **Complexity**: VERY HIGH - Authentication, campaign management, caching
- **Risk**: CRITICAL - Core app state, JWT handling, localStorage cache
- **Missing Tests**: JWT token lifecycle, cache invalidation, authentication flows

### HIGH PRIORITY

**4. useCampaign** (`src/contexts/AppContext.tsx`)
- **Complexity**: HIGH - WebSocket subscriptions, entity callbacks
- **Risk**: HIGH - Real-time campaign updates
- **Missing Tests**: WebSocket subscription lifecycle, callback management

**5. useEncounter** (`src/contexts/EncounterContext.tsx`)
- **Complexity**: VERY HIGH - Complex context with async operations
- **Risk**: HIGH - Combat system, batch API calls
- **Missing Tests**: Real-time updates, batch loading, shot spending

**6. useClient** (`src/contexts/AppContext.tsx`)
- **Complexity**: MEDIUM - Client instance management, JWT integration
- **Risk**: HIGH - API communication layer
- **Missing Tests**: Client memoization, JWT token updates

---

# Phase 3: API Client Layer Analysis

## Critical API Functions Requiring Tests (All Currently Untested)

### CRITICAL PRIORITY

**1. baseClient.ts** - Foundation HTTP methods
- **Missing Tests**: JWT authentication, cache headers, FormData uploads, error handling
- **Edge Cases**: Network timeouts, token expiration, malformed responses

**2. authClient.ts** - Authentication flows
- **Missing Tests**: User registration, password reset, email confirmation, JWT management
- **Edge Cases**: Token expiration during requests, authentication failures

**3. characterClient.ts** - Core domain operations  
- **Missing Tests**: PDF generation, character duplication, shot spending, Notion sync
- **Edge Cases**: Large file uploads, binary response handling, concurrent operations

**4. campaignClient.ts** - Campaign and invitation management
- **Missing Tests**: Campaign switching, invitation workflows, membership management
- **Edge Cases**: Campaign state synchronization, invitation expiration

### HIGH PRIORITY

**5. Client.tsx** - Main aggregation and token management
- **Missing Tests**: JWT resolution (params > localStorage > cookies), WebSocket consumer creation
- **Edge Cases**: Token fallback behavior, missing storage scenarios

**6. Api.ts / ApiV2.ts** - URL generation
- **Missing Tests**: Environment variable dependency, endpoint construction
- **Edge Cases**: Missing environment variables, malformed URLs

**7. fightClient.ts** - Real-time game state
- **Missing Tests**: Shot spending, encounter caching, event history
- **Edge Cases**: Real-time update conflicts, initiative system edge cases

---

# Phase 4: Context Providers Analysis

## All Context Providers Lack Test Coverage (ZERO COVERAGE)

### CRITICAL PRIORITY

**1. AppContext.tsx** - Global application state
- **Complexity**: VERY HIGH - Most complex component in codebase
- **Missing Tests**: JWT lifecycle, user caching, campaign switching, WebSocket subscriptions
- **Edge Cases**: Cache corruption, authentication race conditions, localStorage failures

**2. EncounterContext.tsx** - Real-time game encounters
- **Complexity**: HIGH - Real-time updates, batch operations
- **Missing Tests**: Real-time encounter synchronization, optimistic updates, batch data loading
- **Edge Cases**: WebSocket message ordering, update conflicts, memory leaks

### MEDIUM PRIORITY

**3. LocalStorageContext.tsx** - Browser storage utilities
- **Missing Tests**: SSR safety, JSON serialization errors, storage quota handling
- **Edge Cases**: localStorage unavailability, data corruption

**4. ToastContext.tsx** - Notification system
- **Missing Tests**: Toast state management, queueing, auto-close functionality
- **Edge Cases**: Multiple toast scenarios, cleanup timing

---

# Phase 5: Edge Cases in Existing Tests

## Missing Edge Cases in Current Test Suites

### CharacterService Tests (11 existing tests)
**Missing Edge Cases:**
- Negative wound values and integer overflow
- Division by zero in impairment calculations  
- Invalid character type transitions
- Concurrent state modifications
- Memory leak prevention in chain operations
- Performance with large character datasets

### VehicleService Tests (85 existing tests)
**Missing Edge Cases:**
- Vehicle-to-character conversion boundary conditions
- Driver/passenger relationship validation in edge cases
- Speed calculation with extreme values
- Crash scenarios and vehicle state recovery

### DiceService Tests (17 existing tests)
**Missing Edge Cases:**
- Extreme explosion scenarios (1000+ consecutive 6s)
- Performance testing with very large dice pools
- Memory usage with massive calculations
- Floating point precision edge cases
- Statistical distribution validation over large samples

### Utility Function Tests (95 existing tests)
**Missing Edge Cases:**
- parseToNumber with scientific notation, very large numbers, BigInt values
- queryParams with circular references, deeply nested objects, function values
- filterConfigs with malformed configuration data, circular dependencies
- Performance testing with large datasets

---

# Risk Assessment & Business Impact

## CRITICAL RISK (Business Impact: HIGH, Likelihood: HIGH)

**Authentication System Failures (useApp, authClient)**
- **Impact**: Complete application inaccessibility
- **Likelihood**: High due to complex JWT/cache logic without tests
- **Mitigation**: Immediate comprehensive testing required

**Real-time Features (Contexts, WebSocket clients)**
- **Impact**: Game session failures, data loss
- **Likelihood**: High due to complex async logic without tests
- **Mitigation**: WebSocket lifecycle and error handling tests

**Data Persistence (API clients, form handling)**
- **Impact**: User data loss, form submission failures
- **Likelihood**: Medium-High due to network complexity
- **Mitigation**: API client testing with network scenario simulation

## HIGH RISK (Business Impact: MEDIUM-HIGH, Likelihood: MEDIUM)

**UI Component Failures (Forms, Lists, Modals)**
- **Impact**: User workflow interruption, accessibility issues
- **Likelihood**: Medium due to complex state management
- **Mitigation**: Component integration testing

**Edge Case Handling (Service calculations)**
- **Impact**: Game logic errors, incorrect calculations
- **Likelihood**: Low-Medium but critical for game balance
- **Mitigation**: Boundary condition testing

---

# Implementation Plan

## Phase 1: Critical Infrastructure (Weeks 1-2)
**Target: 50-75 new tests**

### Week 1: Authentication & Core State
- AppContext comprehensive testing (JWT, caching, campaign management)
- authClient authentication flows
- useApp, useClient, useCampaign hook testing
- **Estimated Effort**: 15-20 tests

### Week 2: API Foundation
- baseClient HTTP methods and authentication
- Client.tsx aggregation and token management
- Api/ApiV2 URL generation
- **Estimated Effort**: 20-25 tests

## Phase 2: Business Logic (Weeks 3-4)  
**Target: 75-100 new tests**

### Week 3: Domain Operations
- characterClient CRUD and PDF operations
- campaignClient invitation workflows
- fightClient real-time operations
- **Estimated Effort**: 25-30 tests

### Week 4: Real-time & Complex Features
- EncounterContext real-time synchronization
- useImageGeneration WebSocket testing
- useEncounter batch operations
- **Estimated Effort**: 25-35 tests

## Phase 3: Component Integration (Weeks 5-6)
**Target: 50-75 new tests**

### Week 5: Form Components
- Authentication form testing
- Character/Campaign form validation
- File upload handling
- **Estimated Effort**: 20-25 tests

### Week 6: List/Table Components
- Data filtering and pagination
- Sorting and bulk operations
- Mobile responsive behavior
- **Estimated Effort**: 20-25 tests

## Phase 4: Edge Cases & Polish (Week 7)
**Target: 25-50 new tests**

### Week 7: Edge Cases
- Service boundary condition testing
- Error handling scenario completion
- Performance and memory leak testing
- **Estimated Effort**: 25-50 tests

---

# Mock Infrastructure Requirements

## WebSocket & Real-time
```typescript
jest.mock('@rails/actioncable')
jest.mock('@/lib/websocketClient')
```

## API & HTTP
```typescript  
jest.mock('axios')
jest.mock('@/lib/client/baseClient')
```

## Browser APIs
```typescript
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })
jest.mock('js-cookie')
```

## React Testing
```typescript
// Enhanced test-utils with all providers
const renderWithAllProviders = (ui, options) => { ... }
```

---

# Success Metrics

## Quantitative Goals
- **Total Tests**: Expand from 344 to 500+ (45% increase)
- **Coverage Areas**: Add 4 major untested areas (contexts, hooks, API clients, components)
- **Edge Cases**: Add 20+ specific edge case scenarios
- **Risk Mitigation**: Test all critical authentication and real-time features

## Qualitative Goals  
- **Development Confidence**: Safe refactoring of core features
- **Regression Prevention**: Early detection of breaking changes
- **Documentation**: Tests as executable specifications for complex logic
- **Code Quality**: Improved reliability through comprehensive validation

---

# Recommended Next Steps

## Immediate Actions (This Week)
1. **Set up enhanced mock infrastructure** for WebSocket, API, and browser testing
2. **Begin AppContext testing** - highest risk, highest impact
3. **Create custom render utilities** for provider-based testing

## Short-term Goals (Next 2 Weeks)
1. Complete authentication and state management testing
2. Implement API client testing foundation  
3. Add real-time feature testing (WebSocket, contexts)

## Medium-term Goals (Next 4-6 Weeks)
1. Comprehensive component integration testing
2. Edge case completion for existing test suites
3. Performance and memory leak testing

## Long-term Maintenance
1. Establish testing guidelines for new features
2. Regular edge case reviews and additions
3. Performance regression testing integration

---

## Conclusion

This investigation reveals that despite having 344 tests, the shot-client-next application has significant testing gaps in its most critical areas: authentication, real-time features, API communication, and user interface components. The recommended implementation plan would expand testing coverage to 500+ tests while addressing the highest-risk areas first.

**Priority Focus**: Authentication system, real-time features, and API layer represent the highest business risk and should be addressed immediately to prevent production issues and enable confident development of new features.