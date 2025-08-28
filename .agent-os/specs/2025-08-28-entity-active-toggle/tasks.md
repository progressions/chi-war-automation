# Spec Tasks

## Tasks

- [ ] 1. Create EntityActiveToggle Component
  - [ ] 1.1 Write tests for EntityActiveToggle component permissions and rendering
  - [ ] 1.2 Create EntityActiveToggle component with Switch UI and permission logic
  - [ ] 1.3 Implement handleChangeAndSave integration with optimistic updates
  - [ ] 1.4 Add error handling with toast notifications and toggle revert
  - [ ] 1.5 Verify all component tests pass

- [ ] 2. Integrate Toggle into Character Show Page
  - [ ] 2.1 Write tests for Character Show page active toggle integration
  - [ ] 2.2 Add EntityActiveToggle to Characters/Show.tsx near name field
  - [ ] 2.3 Connect toggle to character data and handleChangeAndSave
  - [ ] 2.4 Test permission visibility (admin/gamemaster only)
  - [ ] 2.5 Verify character toggle tests pass

- [ ] 3. Integrate Toggle into Remaining Entity Show Pages
  - [ ] 3.1 Add EntityActiveToggle to Campaigns/Show.tsx
  - [ ] 3.2 Add EntityActiveToggle to Sites/Show.tsx
  - [ ] 3.3 Add EntityActiveToggle to Parties/Show.tsx
  - [ ] 3.4 Add EntityActiveToggle to Fights/Show.tsx
  - [ ] 3.5 Add EntityActiveToggle to Vehicles/Show.tsx
  - [ ] 3.6 Add EntityActiveToggle to Weapons/Show.tsx
  - [ ] 3.7 Add EntityActiveToggle to Schticks/Show.tsx
  - [ ] 3.8 Verify toggle works on all entity types

- [ ] 4. End-to-End Testing and Polish
  - [ ] 4.1 Write E2E test for admin user toggling entity active states
  - [ ] 4.2 Write E2E test for gamemaster permissions and toggle visibility
  - [ ] 4.3 Test error scenarios and rollback behavior
  - [ ] 4.4 Iterate on visual design and placement near entity names
  - [ ] 4.5 Verify all tests pass and feature works as specified