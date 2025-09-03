# Spec Tasks

These are the tasks to be completed for the spec detailed in @specs/vehicle-chase-panel/spec.md

> Created: 2025-09-03
> Status: Ready for Implementation

## Tasks

- [ ] 1. Backend Infrastructure - Database and Models
  - [ ] 1.1 Write tests for chase models and migrations
  - [ ] 1.2 Create database migrations for chases, chase_participants, and chase_gaps tables
  - [ ] 1.3 Implement Chase, ChaseParticipant, and ChaseGap models with associations
  - [ ] 1.4 Add chase-related columns to vehicles and shots tables
  - [ ] 1.5 Create chase serializers for API responses
  - [ ] 1.6 Verify all model tests pass

- [ ] 2. Backend API - Controllers and Services
  - [ ] 2.1 Write tests for ChaseController and chase services
  - [ ] 2.2 Implement ChaseController with CRUD operations
  - [ ] 2.3 Create DrivingCheckService for action resolution
  - [ ] 2.4 Implement SideSwipeService for combat mechanics
  - [ ] 2.5 Add WebSocket broadcasting for chase events
  - [ ] 2.6 Integrate with existing encounter system
  - [ ] 2.7 Verify all API tests pass

- [ ] 3. Frontend Core Components - ChasePanel Architecture
  - [ ] 3.1 Write tests for ChasePanel and sub-components
  - [ ] 3.2 Create ChasePanel.tsx following AttackPanel structure with useForm hook
  - [ ] 3.3 Implement ParticipantSection.tsx for vehicle/driver selection
  - [ ] 3.4 Create ChaseActionSection.tsx for driving actions
  - [ ] 3.5 Build ChaseResolution.tsx for action resolution
  - [ ] 3.6 Implement ChaseResults.tsx for outcome display
  - [ ] 3.7 Create supporting utilities (chaseCalculations.ts, chaseHandlers.ts)
  - [ ] 3.8 Verify all component tests pass

- [ ] 4. Frontend State Management and Integration
  - [ ] 4.1 Write tests for ChaseContext and state management
  - [ ] 4.2 Create ChaseContext.tsx for chase state management
  - [ ] 4.3 Implement ChaseTracker.tsx for visual progress display
  - [ ] 4.4 Build DriverAssignment.tsx modal for driver changes
  - [ ] 4.5 Integrate ChasePanel with EncounterContext
  - [ ] 4.6 Add ChasePanel to MenuBar with toggle functionality
  - [ ] 4.7 Implement WebSocket subscriptions for real-time updates
  - [ ] 4.8 Verify all integration tests pass

- [ ] 5. End-to-End Testing and Polish
  - [ ] 5.1 Write Playwright E2E tests for complete chase scenarios
  - [ ] 5.2 Implement mobile-responsive layouts
  - [ ] 5.3 Add loading states and error handling
  - [ ] 5.4 Create toast notifications for chase events
  - [ ] 5.5 Optimize performance for chase calculations
  - [ ] 5.6 Add accessibility features (ARIA labels, keyboard navigation)
  - [ ] 5.7 Document chase system usage in CLAUDE.md
  - [ ] 5.8 Verify all E2E tests pass