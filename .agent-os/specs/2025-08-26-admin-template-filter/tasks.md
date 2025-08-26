# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-26-admin-template-filter/spec.md

> Created: 2025-08-26
> Status: Ready for Implementation

## Tasks

- [ ] 1. Backend API Template Filter Implementation
  - [ ] 1.1 Write RSpec tests for template_filter parameter in characters_controller_spec.rb
  - [ ] 1.2 Update CharactersController#index to parse template_filter parameter
  - [ ] 1.3 Implement query logic for all/templates/non-templates filtering
  - [ ] 1.4 Add security check to enforce non-templates for non-admin users
  - [ ] 1.5 Add parameter validation with default to "non-templates"
  - [ ] 1.6 Verify all backend tests pass

- [ ] 2. Frontend Filter Component Enhancement
  - [ ] 2.1 Write Playwright E2E tests for admin template filter dropdown
  - [ ] 2.2 Update EntityFilters.tsx to support dropdown filter type
  - [ ] 2.3 Add template filter dropdown component with MUI Select
  - [ ] 2.4 Implement conditional rendering based on user admin status
  - [ ] 2.5 Style dropdown to match existing filter components
  - [ ] 2.6 Verify component renders correctly for admin users only

- [ ] 3. URL Parameter Synchronization
  - [ ] 3.1 Write tests for URL parameter persistence
  - [ ] 3.2 Update useEntityFilters hook to handle dropdown values
  - [ ] 3.3 Implement template_filter parameter in URL updates
  - [ ] 3.4 Add parsing logic in characters/page.tsx for template_filter
  - [ ] 3.5 Ensure filter state persists on page refresh
  - [ ] 3.6 Verify URL synchronization tests pass

- [ ] 4. Security and Access Control
  - [ ] 4.1 Write security tests for non-admin template hiding
  - [ ] 4.2 Update AuthContext usage in character components
  - [ ] 4.3 Implement frontend security to hide filter from non-admins
  - [ ] 4.4 Add backend validation to reject template access for non-admins
  - [ ] 4.5 Test URL manipulation prevention for non-admin users
  - [ ] 4.6 Verify all security tests pass

- [ ] 5. Integration Testing and Documentation
  - [ ] 5.1 Write comprehensive E2E test covering full workflow
  - [ ] 5.2 Test admin user filtering through all three options
  - [ ] 5.3 Test non-admin user experience and security
  - [ ] 5.4 Update CLAUDE.md with new filter documentation
  - [ ] 5.5 Run full test suite (backend and frontend)
  - [ ] 5.6 Verify all integration tests pass