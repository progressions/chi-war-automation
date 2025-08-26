# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-26-pc-character-template-redesign/spec.md

> Created: 2025-08-26
> Status: Ready for Implementation

## Tasks

- [ ] 1. Create PCTemplatePreviewCard Component
  - [ ] 1.1 Write tests for PCTemplatePreviewCard component
  - [ ] 1.2 Create PCTemplatePreviewCard.tsx with template display (name, archetype, action values)
  - [ ] 1.3 Add skills display as compact chips
  - [ ] 1.4 Add schticks (powers) display as prominent chips
  - [ ] 1.5 Add weapons display with stats (damage/concealment/reload)
  - [ ] 1.6 Add truncated description/background text
  - [ ] 1.7 Style card to match GMC interface (white background, subtle borders)
  - [ ] 1.8 Verify all tests pass

- [ ] 2. Update Character Creation Page Layout
  - [ ] 2.1 Write tests for new layout behavior
  - [ ] 2.2 Remove carousel implementation from CreatePage.tsx
  - [ ] 2.3 Implement new layout for template display (design iteration)
  - [ ] 2.4 Add responsive behavior for mobile/tablet/desktop
  - [ ] 2.5 Remove confirmation dialog from template selection
  - [ ] 2.6 Add loading overlay during character creation
  - [ ] 2.7 Verify all tests pass

- [ ] 3. Implement Search and Filter Functionality
  - [ ] 3.1 Write tests for search and filter features
  - [ ] 3.2 Add search input field for template name search
  - [ ] 3.3 Create archetype dropdown filter
  - [ ] 3.4 Add feature checkboxes (has weapons, has schticks)
  - [ ] 3.5 Implement client-side filtering logic
  - [ ] 3.6 Add result count display ("Showing X of Y templates")
  - [ ] 3.7 Add clear filters button
  - [ ] 3.8 Verify all tests pass

- [ ] 4. Connect API and Data Flow
  - [ ] 4.1 Write tests for API integration
  - [ ] 4.2 Update data fetching to use client.getCharacters({ is_template: true, character_type: "PC" })
  - [ ] 4.3 Implement direct character creation from template click
  - [ ] 4.4 Add success toast notification after creation
  - [ ] 4.5 Implement redirect to character edit page
  - [ ] 4.6 Verify all tests pass

- [ ] 5. Final Integration and Polish
  - [ ] 5.1 Write end-to-end tests for complete PC creation flow
  - [ ] 5.2 Test layout on various screen sizes
  - [ ] 5.3 Verify visual consistency with GMC interface
  - [ ] 5.4 Test with all 36+ PC templates
  - [ ] 5.5 Optimize performance for template loading
  - [ ] 5.6 Clean up deprecated carousel components if unused elsewhere
  - [ ] 5.7 Update any related documentation
  - [ ] 5.8 Verify all tests pass