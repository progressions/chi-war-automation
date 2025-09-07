# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Status: Ready for Implementation

## Tasks

- [ ] 1. Database and Backend Model Updates
  - [ ] 1.1 Write tests for Character model status field functionality
  - [ ] 1.2 Create and run migration to add status JSONB column to characters table
  - [ ] 1.3 Update Character model with status helper methods and scopes
  - [ ] 1.4 Update CharacterSerializer to include status field
  - [ ] 1.5 Write tests for Marks of Death increment in action_values
  - [ ] 1.6 Verify all model tests pass

- [ ] 2. Backend API and Service Implementation
  - [ ] 2.1 Write tests for UpCheckService business logic
  - [ ] 2.2 Create UpCheckService with calculation and status update logic
  - [ ] 2.3 Write tests for encounters controller combat_action endpoint with up_check type
  - [ ] 2.4 Update encounters controller to handle up_check combat actions
  - [ ] 2.5 Write tests for automatic Up Check triggering on wound updates
  - [ ] 2.6 Update characters controller to trigger Up Check requirements
  - [ ] 2.7 Add fight_events logging for Up Check attempts
  - [ ] 2.8 Verify all API tests pass

- [ ] 3. Frontend State Management and Services
  - [ ] 3.1 Write tests for character status utility functions
  - [ ] 3.2 Update Character TypeScript type to include status field
  - [ ] 3.3 Add hasUpCheckRequired() and isOutOfFight() helper functions to CharacterService
  - [ ] 3.4 Update wound damage calculations to detect Up Check requirements
  - [ ] 3.5 Add Fortune point deduction logic for Up Check panel
  - [ ] 3.6 Verify all frontend utility tests pass

- [ ] 4. Frontend UI Components
  - [ ] 4.1 Write tests for UpCheckPanel component
  - [ ] 4.2 Create UpCheckPanel component with Swerve and Fortune inputs
  - [ ] 4.3 Implement calculation preview matching Attack/Chase panel format
  - [ ] 4.4 Write tests for Action Bar Up Check button visibility
  - [ ] 4.5 Add Up Check button to Action Bar (conditional on selected character status)
  - [ ] 4.6 Add status badge to Shot Counter character details
  - [ ] 4.7 Update character cards to show out_of_fight visual state
  - [ ] 4.8 Verify all component tests pass

- [ ] 5. Integration and End-to-End Testing
  - [ ] 5.1 Write E2E test for complete Up Check workflow
  - [ ] 5.2 Test PC reaching wound threshold and triggering Up Check
  - [ ] 5.3 Test successful Up Check allowing continued combat
  - [ ] 5.4 Test failed Up Check marking character out_of_fight
  - [ ] 5.5 Test Fortune die usage with point deduction and Mark addition
  - [ ] 5.6 Test healing below threshold clearing up_check_required status
  - [ ] 5.7 Test GM manual status override in Edit Character dialog
  - [ ] 5.8 Verify all E2E tests pass and WebSocket updates work correctly