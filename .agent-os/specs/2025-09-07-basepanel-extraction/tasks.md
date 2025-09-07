# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-07-basepanel-extraction/spec.md

## Tasks

- [ ] 1. Create BasePanel Component
  - [ ] 1.1 Write tests for BasePanel component
  - [ ] 1.2 Create BasePanel.tsx with Paper structure and border styling
  - [ ] 1.3 Implement header section with icon and title props
  - [ ] 1.4 Add TypeScript interface for BasePanelProps
  - [ ] 1.5 Support sx prop for style overrides
  - [ ] 1.6 Export BasePanel from encounters index
  - [ ] 1.7 Verify all tests pass

- [ ] 2. Migrate CheeseItPanel to use BasePanel
  - [ ] 2.1 Write tests to ensure CheeseItPanel functionality is preserved
  - [ ] 2.2 Import BasePanel into CheeseItPanel
  - [ ] 2.3 Replace Paper wrapper with BasePanel component
  - [ ] 2.4 Pass title="Cheese It" and icon props to BasePanel
  - [ ] 2.5 Set borderColor="warning.main" on BasePanel
  - [ ] 2.6 Move panel content into BasePanel children
  - [ ] 2.7 Verify all tests pass

- [ ] 3. Migrate SpeedCheckPanel to use BasePanel
  - [ ] 3.1 Write tests to ensure SpeedCheckPanel functionality is preserved
  - [ ] 3.2 Import BasePanel into SpeedCheckPanel
  - [ ] 3.3 Replace Paper wrapper with BasePanel component
  - [ ] 3.4 Pass appropriate title and icon props to BasePanel
  - [ ] 3.5 Handle conditional borderColor (warning.main/info.main)
  - [ ] 3.6 Move panel content into BasePanel children
  - [ ] 3.7 Verify all tests pass

- [ ] 4. Complete Testing and Validation
  - [ ] 4.1 Run existing E2E tests for escape mechanics
  - [ ] 4.2 Run existing E2E tests for speed check mechanics
  - [ ] 4.3 Verify no visual regressions in panel appearance
  - [ ] 4.4 Test panel functionality in actual encounter flow
  - [ ] 4.5 Validate TypeScript types compile without errors
  - [ ] 4.6 Verify all tests pass