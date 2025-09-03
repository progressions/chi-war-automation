# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-01-vehicle-chase-system/spec.md

> Created: 2025-09-03
> Status: Ready for Implementation

## Tasks

- [ ] 1. Backend API for Chase State Persistence
  - [ ] 1.1 Write RSpec tests for vehicle chase state updates
  - [ ] 1.2 Add update_chase_state endpoint to VehiclesController (PATCH /api/v2/vehicles/:id/chase_state)
  - [ ] 1.3 Create assign_driver endpoint for Shot relationships (POST /api/v2/shots/:id/assign_driver)
  - [ ] 1.4 Add remove_driver endpoint for Shot relationships (DELETE /api/v2/shots/:id/remove_driver)
  - [ ] 1.5 Update vehicle serializer to include chase-relevant fields when in fights
  - [ ] 1.6 Add FightChannel broadcasting for chase state changes
  - [ ] 1.7 Add validation for chase state updates (position values, point limits)
  - [ ] 1.8 Verify all backend tests pass

- [ ] 2. ChasePanel Component Implementation
  - [ ] 2.1 Write component tests for ChasePanel using React Testing Library
  - [ ] 2.2 Create ChasePanel component following AttackPanel structure
  - [ ] 2.3 Integrate with existing ChaseReducerService for action resolution
  - [ ] 2.4 Build driver selection UI using Shot model relationships
  - [ ] 2.5 Implement target vehicle selection with position-based filtering
  - [ ] 2.6 Add action method selection (Ram/Sideswipe, Narrow Gap, Widen Gap, Evade)
  - [ ] 2.7 Create resolution display using ChaseReducerService results
  - [ ] 2.8 Verify all ChasePanel component tests pass

- [ ] 3. Frontend Integration with ChaseReducerService
  - [ ] 3.1 Write tests for chase state integration in EncounterContext
  - [ ] 3.2 Add chase state tracking to EncounterContext (active vehicles, positions)
  - [ ] 3.3 Create useChase hook to access ChaseReducerService from components
  - [ ] 3.4 Build API integration for persisting chase state changes
  - [ ] 3.5 Add WebSocket handlers in FightChannel for chase updates
  - [ ] 3.6 Implement optimistic updates with rollback on API failure
  - [ ] 3.7 Add TypeScript interfaces for chase API responses
  - [ ] 3.8 Verify all frontend integration tests pass

- [ ] 4. Driver Assignment and Chase Visualization
  - [ ] 4.1 Write tests for driver assignment and visualization components
  - [ ] 4.2 Create DriverAssignment modal for managing vehicle drivers
  - [ ] 4.3 Build ChaseTracker showing all vehicles' chase/condition points
  - [ ] 4.4 Implement position indicators (near/far) between vehicle pairs
  - [ ] 4.5 Add chase point progress bars with thresholds (35/50)
  - [ ] 4.6 Create role badges (Pursuer/Evader) for each vehicle
  - [ ] 4.7 Add impairment display based on chase point ranges
  - [ ] 4.8 Verify all visualization component tests pass

- [ ] 5. Integration Testing and Polish
  - [ ] 5.1 Write Playwright E2E tests for complete chase scenarios
  - [ ] 5.2 Test ChaseReducerService integration with UI components
  - [ ] 5.3 Verify driver assignment workflow with Shot relationships
  - [ ] 5.4 Test position-based action restrictions (sideswipe near only)
  - [ ] 5.5 Validate real-time updates across multiple clients
  - [ ] 5.6 Add toast notifications for chase actions and outcomes
  - [ ] 5.7 Implement accessibility features (ARIA labels, keyboard nav)
  - [ ] 5.8 Verify complete system integration and all tests pass