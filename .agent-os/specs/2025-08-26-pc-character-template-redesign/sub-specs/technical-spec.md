# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-pc-character-template-redesign/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Technical Requirements

### Frontend Components (Next.js App)

1. **PCTemplatePreviewCard Component**
   - Location: `shot-client-next/src/components/characters/PCTemplatePreviewCard.tsx`
   - Displays template information in card format matching GMCTemplatePreviewCard design
   - Props: `template`, `onClick`, `loading` (for creation state)
   - Shows: action values, skills, schticks, weapons, archetype, description excerpt

2. **Updated CreateCharacterPage**
   - Location: `shot-client-next/src/app/characters/create/page.tsx`
   - Replace carousel with improved layout (specific design TBD through iteration)
   - Add search and filter functionality
   - Implement direct creation workflow with loading states

3. **Search and Filter Components**
   - Search input for template names
   - Archetype dropdown filter
   - Feature checkboxes (has weapons, has schticks)
   - Result count display
   - Clear filters button

### Data Flow

1. **Template Data Source**
   - Fetch PC templates using: `client.getCharacters({ is_template: true, character_type: "PC" })`
   - Use existing API endpoint, no backend changes required
   - Client-side filtering and search on returned templates

2. **Character Creation Flow**
   - Direct API call to create character from template
   - Remove confirmation dialog step
   - Show loading overlay during creation
   - Redirect to edit page with success toast

### Styling Requirements

1. **Layout Design**
   - Clean, responsive layout to be determined through design iteration
   - Consistent spacing matching GMC interface
   - White card backgrounds with subtle borders matching GMC styling

2. **Card Design**
   - Match GMCTemplatePreviewCard visual hierarchy
   - Action values in small boxes
   - Skills as compact chips
   - Schticks as prominent colored chips
   - Weapon stats display
   - Archetype and description text

## Approach

### Phase 1: Component Development
1. Create PCTemplatePreviewCard component based on GMCTemplatePreviewCard
2. Implement improved layout design (iterate on best approach)
3. Add loading states for creation process

### Phase 2: Search and Filter Implementation
1. Add search input with real-time filtering
2. Implement archetype dropdown filter
3. Add feature checkboxes (weapons, schticks)
4. Display filtered result counts

### Phase 3: Integration and Testing
1. Replace carousel in create page with new layout design
2. Implement direct creation workflow
3. Test responsive behavior and loading states
4. Validate visual consistency with GMC interface

## External Dependencies

- Existing PC template data from API
- Toast notification system for success messages
- Character creation API endpoint (no changes needed)
- Next.js router for navigation to edit page