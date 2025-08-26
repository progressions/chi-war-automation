# Spec Tasks

## Tasks

- [ ] 1. Enhance SpeedDial Menu with Template Creation Option
  - [ ] 1.1 Write tests for SpeedDial template option integration
  - [ ] 1.2 Add "Create from Template" action to existing SpeedDial menu on characters list page
  - [ ] 1.3 Position template option alongside existing "Create (PC)", "Import (from PDF)", "Generate (by AI)" options
  - [ ] 1.4 Implement navigation to template selection page on option click
  - [ ] 1.5 Verify SpeedDial menu displays correctly with new template option
  - [ ] 1.6 Verify all tests pass

- [ ] 2. Create Template Preview Card Component
  - [ ] 2.1 Write tests for TemplatePreviewCard component rendering and interaction
  - [ ] 2.2 Create TemplatePreviewCard component in src/components/Characters/
  - [ ] 2.3 Implement template name display with prominent typography
  - [ ] 2.4 Add character Type badge (Featured Foe, Boss, etc.) with appropriate styling
  - [ ] 2.5 Display key Action Values in scannable format (Martial Arts, Guns, Sorcery, Defense, Toughness, Speed)
  - [ ] 2.6 Add click handler for template selection with onSelect prop
  - [ ] 2.7 Apply minimal visual design focused on readability
  - [ ] 2.8 Verify all tests pass

- [ ] 3. Build NPC Template Selection Page
  - [ ] 3.1 Write tests for template selection page functionality and navigation
  - [ ] 3.2 Create template selection page at src/app/characters/templates/page.tsx
  - [ ] 3.3 Define NPC_TYPES constant with Ally, Mook, Featured Foe, Boss, Uber-Boss types
  - [ ] 3.4 Implement character type filtering with tabs or dropdown interface
  - [ ] 3.5 Display template preview cards organized by selected character type
  - [ ] 3.6 Add loading states during template fetching
  - [ ] 3.7 Handle empty states when no templates exist for selected type
  - [ ] 3.8 Verify all tests pass

- [ ] 4. Implement Template API Client Integration
  - [ ] 4.1 Write tests for template fetching API methods
  - [ ] 4.2 Update existing API client to support template filtering by character_type parameter
  - [ ] 4.3 Add getTemplatesByType method using existing /api/v2/characters endpoint
  - [ ] 4.4 Implement query parameters: is_template=true and character_type for filtering
  - [ ] 4.5 Add error handling for template fetch failures
  - [ ] 4.6 Implement caching strategy for template lists to improve performance
  - [ ] 4.7 Verify all tests pass

- [ ] 5. Create Character from Template Flow
  - [ ] 5.1 Write tests for template-based character creation process
  - [ ] 5.2 Implement template selection handler that navigates to character creation
  - [ ] 5.3 Create utility function to copy template data for new character creation
  - [ ] 5.4 Set is_template: false for characters created from templates
  - [ ] 5.5 Allow user customization of name and description before saving
  - [ ] 5.6 Integrate with existing character creation form and validation
  - [ ] 5.7 Add success/error toast notifications for template-based character creation
  - [ ] 5.8 Verify all tests pass