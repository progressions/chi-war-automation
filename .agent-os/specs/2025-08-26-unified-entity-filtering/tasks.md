# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-26-unified-entity-filtering/spec.md

> Created: 2025-08-26
> Status: Ready for Implementation

## Tasks

- [ ] 1. Create Unified Filter Accordion Component
  - [ ] 1.1 Write tests for FilterAccordion component
  - [ ] 1.2 Create FilterAccordion component with Material-UI Accordion
  - [ ] 1.3 Implement collapsed state with active filter chips display
  - [ ] 1.4 Implement expanded state with filter controls layout
  - [ ] 1.5 Add filter count badge to accordion header
  - [ ] 1.6 Implement clear all filters functionality
  - [ ] 1.7 Verify all tests pass

- [ ] 2. Migrate GenericFilter into FilterAccordion
  - [ ] 2.1 Write tests for GenericFilter integration
  - [ ] 2.2 Move search input into accordion structure
  - [ ] 2.3 Integrate existing dropdown filters into accordion
  - [ ] 2.4 Preserve all filter props and callbacks
  - [ ] 2.5 Maintain URL parameter synchronization
  - [ ] 2.6 Verify all tests pass

- [ ] 3. Update Character Entity Views
  - [ ] 3.1 Write tests for characters/View.tsx modifications
  - [ ] 3.2 Replace filter bar with FilterAccordion in characters/View.tsx
  - [ ] 3.3 Update characters/Table.tsx to use new accordion
  - [ ] 3.4 Update characters/Grid.tsx for mobile responsiveness
  - [ ] 3.5 Test filter persistence and URL updates
  - [ ] 3.6 Verify all tests pass

- [ ] 4. Update Remaining Entity Views
  - [ ] 4.1 Update fights/View.tsx with FilterAccordion
  - [ ] 4.2 Update vehicles/View.tsx with FilterAccordion
  - [ ] 4.3 Update weapons/View.tsx with FilterAccordion
  - [ ] 4.4 Update sites, parties, factions View.tsx files
  - [ ] 4.5 Update schticks, campaigns, users, junctures View.tsx files
  - [ ] 4.6 Ensure consistent behavior across all entities
  - [ ] 4.7 Verify all entity filter tests pass

- [ ] 5. Polish and Responsive Testing
  - [ ] 5.1 Write responsive layout tests
  - [ ] 5.2 Test mobile Grid view interactions
  - [ ] 5.3 Verify tablet layout behavior
  - [ ] 5.4 Ensure accessibility standards (ARIA labels, keyboard navigation)
  - [ ] 5.5 Performance testing for accordion state changes
  - [ ] 5.6 Cross-browser compatibility testing
  - [ ] 5.7 Final regression testing of all entity filters
  - [ ] 5.8 Verify all tests pass