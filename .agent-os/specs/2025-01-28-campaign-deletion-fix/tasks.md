# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-01-28-campaign-deletion-fix/spec.md

> Created: 2025-01-28
> Updated: 2025-08-28 (Reorganized into 5 major tasks - unified deletion system)
> Status: Ready for Implementation - Comprehensive Entity Deletion System

## Tasks

### Task 1: Backend Unified Response Implementation
**Priority:** Critical
**Component:** Backend Services and Controllers
**Files:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server/app/services/`, `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server/app/controllers/api/v2/`

**Implementation Steps (TDD Approach):**

1. **Write Base Service Tests:**
   - Create `spec/services/entity_deletion_service_spec.rb` with test cases for:
     - Constraint checking framework behavior
     - Universal error response structure validation
     - Force parameter handling across different scenarios
     - Standardized success response format

2. **Implement Base Service:**
   - Create `EntityDeletionService` base class with:
     - Standard interface for constraint checking
     - Universal JSON error response structure
     - Force parameter handling framework
     - Efficient count-based constraint checking
     - Entity-specific suggestion generation

3. **Write Entity-Specific Service Tests:**
   - Create comprehensive test suites for each deletion service:
     - `CampaignDeletionService` (characters, vehicles, fights, sites, parties, factions, junctures)
     - `CharacterDeletionService` (schticks, weapons, active fight participation)
     - `VehicleDeletionService` (weapons, active fight participation)
     - `FightDeletionService` (shots, combat status validation)
     - All other entity deletion services

4. **Implement Entity-Specific Services:**
   - Create all deletion services inheriting from base class
   - Implement entity-specific constraint checking methods
   - Define appropriate cascade deletion behavior
   - Add entity-specific error messages and suggestions

5. **Update Controller Tests:**
   - Update all entity controller specs for standardized deletion behavior
   - Test force parameter handling and constraint error responses
   - Verify authorization and permissions remain intact

6. **Update Controllers:**
   - Integrate all entity controllers with respective deletion services
   - Implement standardized error response handling
   - Add consistent force parameter support

**Expected Outcome:** Unified backend response system with consistent deletion behavior across all entities

---

### Task 2: Frontend Unified Error Handler
**Priority:** High
**Component:** Frontend Error Handling System
**Files:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/shared/`, `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/hooks/`

**Implementation Steps (TDD Approach):**

1. **Write Universal Deletion Hook Tests:**
   - Create test suite for `useEntityDeletion` hook covering:
     - Force parameter handling for all entity types
     - Constraint checking and error parsing
     - Standard loading states and error handling
     - Support for configurable behavior per entity type

2. **Implement Universal Deletion Hook:**
   - Create `useEntityDeletion` hook for consistent deletion logic
   - Handle force parameter, constraint checking, error parsing
   - Provide standard loading states and error handling
   - Support all entity types with configurable behavior

3. **Write Confirmation Dialog Tests:**
   - Create comprehensive test suite for `EntityDeletionDialog` component:
     - Constraint details display with progressive disclosure
     - Force deletion impact visualization
     - Accessibility features validation
     - Support for all entity types

4. **Implement Universal Confirmation Dialog:**
   - Create `EntityDeletionDialog` component supporting all entity types
   - Display constraint details with progressive disclosure
   - Show comprehensive impact for force deletion
   - Implement proper accessibility features

5. **Write Constraint Display Tests:**
   - Create test suite for `ConstraintDetails` component:
     - All entity constraint types (characters, weapons, fights, etc.)
     - Expandable detail views functionality
     - Actionable suggestions from API responses

6. **Implement Constraint Display Component:**
   - Create `ConstraintDetails` component for association information
   - Support all entity constraint types
   - Provide expandable detail views
   - Include actionable suggestions from API responses

**Expected Outcome:** Reusable frontend deletion system with consistent user experience across all entity types

---

### Task 3: Entity-Specific API Client Updates
**Priority:** High
**Component:** Frontend API Client Integration
**Files:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/lib/ApiV2.ts`, `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/lib/client/`

**Implementation Steps (TDD Approach):**

1. **Write API Client Tests:**
   - Create comprehensive test suite for all deletion methods:
     - Force parameter support for `deleteCampaign`, `deleteCharacter`, `deleteVehicle`, etc.
     - Both `force: true` and `force: false` scenarios
     - Correct URL parameter construction verification
     - Backward compatibility with existing calls

2. **Update Main API Client:**
   - Modify all entity deletion methods in `ApiV2.ts` to accept optional `options` parameter
   - Add support for `force: true` query parameter across all entity types
   - Ensure backward compatibility with existing calls
   - Update error response handling for new standardized structure

3. **Write Entity Client Tests:**
   - Create test suites for individual entity clients:
     - `campaignClient.ts`, `characterClient.ts`, `vehicleClient.ts`
     - Test force parameter integration
     - Test standardized error response parsing
     - Verify proper error propagation to components

4. **Update Entity-Specific Clients:**
   - Update individual entity client files to use enhanced API methods
   - Integrate with standardized error response structure
   - Parse constraint details and suggestions consistently
   - Ensure proper error propagation to components

5. **Integration Testing:**
   - Write integration tests between API client and deletion services
   - Test end-to-end force parameter flow
   - Verify constraint error parsing across all entity types

**Expected Outcome:** All entity API clients support force parameter with standardized error handling and backward compatibility

---

### Task 4: UI Components for Deletion Confirmation
**Priority:** High
**Component:** Frontend Entity Management UI
**Files:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/`

**Implementation Steps (TDD Approach):**

1. **Write Entity Detail Component Tests:**
   - Create test suites for all entity detail components:
     - `CampaignDetail.tsx`, `CharacterDetail.tsx`, `VehicleDetail.tsx`
     - `FightDetail.tsx`, `WeaponDetail.tsx`, `SchtickDetail.tsx`
     - `SiteDetail.tsx`, `PartyDetail.tsx`, `FactionDetail.tsx`
     - Test deletion flows with constraint handling
     - Test force deletion confirmation flows
     - Test error scenarios and user feedback

2. **Update Campaign Management UI:**
   - Integrate `CampaignDetail.tsx` with universal deletion components
   - Implement confirmation dialogs with constraint information
   - Add proper error handling and user feedback
   - Ensure consistent loading states and navigation

3. **Update Character Management UI:**
   - Integrate `CharacterDetail.tsx` with universal deletion components
   - Handle character-specific constraints (schticks, weapons, fights)
   - Implement appropriate post-deletion navigation
   - Test deletion flows for all character types (PC, NPC, etc.)

4. **Update Vehicle Management UI:**
   - Integrate `VehicleDetail.tsx` with universal deletion components
   - Handle vehicle-specific constraints (weapons, fights)
   - Implement appropriate post-deletion navigation

5. **Update All Other Entity UIs:**
   - Update remaining entity detail components:
     - `FightDetail.tsx`, `WeaponDetail.tsx`, `SchtickDetail.tsx`
     - `SiteDetail.tsx`, `PartyDetail.tsx`, `FactionDetail.tsx`
   - Use universal deletion components across all entity types
   - Implement entity-specific customizations for constraint messaging
   - Handle entity-specific business logic requirements

6. **Cross-Entity Integration Testing:**
   - Test deletion flows for all entity types
   - Verify constraint handling and force deletion across entities
   - Test error scenarios and user feedback consistency
   - Ensure proper navigation and data cleanup

**Expected Outcome:** All entity management interfaces provide consistent, enhanced deletion experience with proper constraint handling

---

### Task 5: Comprehensive Testing
**Priority:** Medium
**Component:** End-to-End Testing and System Integration
**Files:** `/Users/isaacpriestley/tech/isaacpriestley/chi-war/test-scripts/`, System Integration

**Implementation Steps (TDD Approach):**

1. **Create Entity Deletion Test Scripts:**
   - Write `test-entity-deletion.js` covering all entity types:
     - Direct deletion scenarios (no associations)
     - Constrained deletion scenarios (with associations)  
     - Force deletion confirmation flows
     - Error handling and user feedback verification
   - Use `login-helper.js` for authentication
   - Test both gamemaster and player user scenarios

2. **Write Backend Integration Tests:**
   - Create comprehensive RSpec integration tests:
     - Test deletion service integration with controllers
     - Test WebSocket broadcasting for deletion events
     - Test authorization integration across all entity types
     - Test role-based access control (gamemaster vs player)

3. **Write Frontend Integration Tests:**
   - Create comprehensive frontend integration tests:
     - Test API client integration with backend services
     - Test universal deletion hook with all entity types
     - Test confirmation dialog integration
     - Test proper cleanup of WebSocket subscriptions

4. **Performance and Load Testing:**
   - Test constraint checking performance with large datasets
   - Verify efficient database queries across all entity types
   - Test memory usage during constraint validation
   - Test concurrent deletion scenarios

5. **System Integration Validation:**
   - Update Action Cable channels for all entity deletion events
   - Test real-time updates across all entity types
   - Verify deletion permissions for all entity types
   - Ensure proper authorization error handling
   - Test navigation and data cleanup across the application

6. **Documentation and Final Validation:**
   - Update API documentation for all enhanced deletion endpoints
   - Create user guides for new deletion functionality
   - Update developer documentation with new patterns
   - Run complete test suite to ensure no regressions
   - Validate all acceptance criteria from spec

**Expected Outcome:** Complete system integration with comprehensive test coverage ensuring deletion functionality works reliably across all entity types

---

## Implementation Priority

1. **Task 1** (Critical): Backend unified response system - foundational architecture
2. **Task 2** (High): Frontend unified error handler - consistent user experience foundation  
3. **Task 3** (High): API client updates - integration layer between frontend and backend
4. **Task 4** (High): UI component updates - user-facing functionality
5. **Task 5** (Medium): Comprehensive testing - quality assurance and validation

## Success Metrics

- All entity types have consistent deletion behavior with unified error responses
- Force parameter support implemented across all entities
- Single reusable frontend deletion system handling all entity types
- Comprehensive constraint information displayed to users
- 100% test coverage for deletion functionality across all entities
- Performance benchmarks met for constraint checking on large datasets