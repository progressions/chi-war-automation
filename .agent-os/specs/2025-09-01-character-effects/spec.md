# Character Effects System Specification

## Overview

The Character Effects system provides a way to apply temporary modifications to characters and vehicles during encounters. Effects can modify action values like Attack, Defense, Toughness, and Damage with either additive modifiers (+/-) or absolute values. They are visually displayed with color-coded severity levels and include descriptive information to help track combat conditions, buffs, debuffs, and other temporary states.

## Current Backend Implementation

### Data Model

The `CharacterEffect` model is fully implemented in the backend with the following structure:

**Database Table: `character_effects`**
- `id` (UUID) - Primary key
- `character_id` (UUID) - Reference to Character (nullable)
- `vehicle_id` (UUID) - Reference to Vehicle (nullable) 
- `shot_id` (UUID) - Reference to Shot (required)
- `name` (string) - Effect title/name
- `description` (string) - Detailed description
- `severity` (string) - Color coding: "error" (red), "warning" (yellow), "info" (blue), "success" (green)
- `action_value` (string) - Which attribute to modify (nullable)
- `change` (string) - Modifier value like "+2", "-1", or absolute value (nullable)
- `created_at` (datetime)
- `updated_at` (datetime)

**Key Relationships:**
- `belongs_to :character, optional: true`
- `belongs_to :vehicle, optional: true` 
- `belongs_to :shot, optional: true`
- Validates presence of either character_id or vehicle_id (not both)
- Validates shot_id is required
- Auto-assigns character_id or vehicle_id from shot if not provided

### Business Logic & Validations

**Action Value Validation:**
- If `action_value` is set, it must be a valid key from `Character::DEFAULT_ACTION_VALUES` or `Vehicle::DEFAULT_ACTION_VALUES`
- Character action values: "Guns", "Martial Arts", "Sorcery", "Defense", "Toughness", "Speed", etc.
- Vehicle action values: "Acceleration", "Handling", "Frame", "Crunch", etc.

**Change Validation:**
- If `action_value` is present, `change` must also be present
- If `change` is present, `action_value` must also be present
- Change values can be additive ("+2", "-1") or absolute ("5")

**Modifier Processing:**
- Additive modifiers start with "+" or "-" and are applied to base values
- Absolute modifiers replace the base value entirely
- Multiple effects can stack additively

### API Endpoints

**Current V1 API (Legacy):**
- `POST /api/v1/fights/:fight_id/character_effects` - Create effect
- `PATCH /api/v1/fights/:fight_id/character_effects/:id` - Update effect  
- `DELETE /api/v1/fights/:fight_id/character_effects/:id` - Delete effect

**V2 API Status:**
- No dedicated CharacterEffect controller in V2 API
- Character effects are loaded via Fight associations but not fully exposed
- Fight show endpoint includes character_effects through associations
- Encounter serializer doesn't include character effects in shots data

### Data Access Patterns

**Through Fight Model:**
```ruby
fight.character_effects  # All effects in fight via shots
fight.shots.includes(:character_effects)  # Eager loading
```

**Through Shot Model:**
```ruby
shot.character_effects  # Effects for specific shot
```

**Service Layer:**
- `CharacterEffectService` in legacy client handles modifier calculations
- Processes additive vs absolute changes
- Handles "MainAttack" special case for attack values

## Frontend Requirements

### User Interface Components

**Character Card Effects Display:**
- Color-coded info icons for each severity level
- Stack horizontally: red (error), yellow (warning), blue (info), green (success) 
- Tooltip showing effect count on hover
- Gamemaster-only "+" button to add new effects

**Effect Creation Modal:**
- Title field (required)
- Severity dropdown: Danger (error), Warning (warning), Info (info), Success (success)
- Description field (optional)
- Action Value dropdown (optional): Attack, Defense, Toughness, Damage for characters
- Vehicle action values: Acceleration, Handling, Frame, Crunch
- Change field (required if action value selected): "+2", "-1", "5"
- Save/Cancel buttons with loading states

**Effect Management:**
- Click effect icons to view details in popover
- Gamemaster can delete effects with confirmation
- Real-time updates via WebSocket when effects change

### State Management

**Context Integration:**
- Effects loaded through Fight context
- Grouped by shot_id for character/vehicle associations
- Auto-refresh when fight data updates

**Toast Notifications:**
- Success: "Effect [name] added/deleted" 
- Error: Generic error handling for API failures

### Visual Design

**Severity Color Mapping:**
- `error` → Red (Material-UI error color)
- `warning` → Yellow/Orange (Material-UI warning color)  
- `info` → Blue (Material-UI info color)
- `success` → Green (Material-UI success color)

**Icon Display:**
- Material-UI `InfoOutlinedIcon` with severity color
- Grouped horizontally with consistent spacing
- Add button (`AddCircleOutlineOutlinedIcon`) for gamemasters

## Technical Implementation Plan

### Backend Changes Required

**API V2 Endpoints:**
- Create `Api::V2::CharacterEffectsController`
- Follow RESTful V2 patterns with nested routes under fights
- Include proper error handling and validation responses

**Serializers:**
- Create `CharacterEffectSerializer` for V2 API responses
- Update `EncounterSerializer` to include character effects in shots data
- Ensure fight show includes character effects properly

**Routes:**
```ruby
resources :fights do
  resources :character_effects, only: [:create, :update, :destroy]
end
```

### Frontend Implementation

**Component Structure:**
```
src/components/character-effects/
├── CharacterEffectsDisplay.tsx      # Main display component
├── CharacterEffectIcon.tsx          # Individual severity icon
├── CharacterEffectModal.tsx         # Add/edit modal
├── CharacterEffectPopover.tsx       # Details popover
└── index.ts                         # Exports
```

**API Client Integration:**
- Add character effects methods to `ApiV2.ts`
- CRUD operations following V2 patterns
- Type definitions in `types/encounters.ts`

**Encounter Context Updates:**
- Include character effects in encounter data structure
- Group effects by shot_id for efficient lookup
- Handle real-time updates via WebSocket

### Data Flow

**Effect Creation:**
1. User clicks "+" button on character card
2. Modal opens with form pre-populated with shot_id and character/vehicle_id
3. User fills form and submits
4. POST request to V2 API endpoint
5. Success response updates encounter context
6. WebSocket broadcast triggers refresh for other users
7. Toast confirmation shown

**Effect Display:**
1. Encounter context loads fight with character effects
2. Effects grouped by shot_id in component
3. Severity-based color coding applied
4. Icons rendered horizontally with tooltips

**Effect Deletion:**
1. User clicks effect icon to open popover
2. Gamemaster sees delete button
3. Confirmation dialog prevents accidental deletion
4. DELETE request removes effect
5. Context updates and UI refreshes

## User Flows

### Adding a Character Effect

1. **Trigger:** Gamemaster clicks "+" icon on character card during encounter
2. **Form:** Modal opens with:
   - Title field focused and empty
   - Severity defaulted to "Info"
   - Description optional
   - Action Value dropdown with character-specific options
   - Change field disabled until action value selected
3. **Validation:** Form prevents submission without required fields
4. **Success:** Effect appears immediately on character card with appropriate color
5. **Broadcast:** Other users see effect appear in real-time

### Viewing Effect Details

1. **Trigger:** Any user hovers over or clicks effect icon
2. **Display:** Popover shows:
   - Effect name as title
   - Description if present
   - Action value and change if specified
   - Created timestamp
3. **Gamemaster Only:** Delete button with confirmation dialog

### Removing Effects

1. **Access:** Only gamemasters see delete option in effect popover  
2. **Confirmation:** "Are you sure?" dialog prevents accidents
3. **Feedback:** Toast notification confirms deletion
4. **Update:** Effect disappears immediately for all users

## Integration Points

### WebSocket Updates
- Character effect changes trigger encounter broadcasts
- Real-time synchronization across all connected clients
- Maintains consistency during active encounters

### Permissions System
- Effect creation limited to gamemasters via `GamemasterOnly` wrapper
- Effect viewing available to all encounter participants
- Effect deletion restricted to gamemasters only

### Action Value Integration
- Effects modify displayed action values in character cards
- Calculations handled by service layer following legacy patterns
- Visual indicators show modified vs original values

## Testing Strategy

### Backend Testing
- Model validations comprehensive via existing RSpec tests
- Controller tests for V2 API endpoints
- Integration tests for WebSocket broadcasts

### Frontend Testing
- Component rendering tests for all severity levels
- User interaction tests for modal form
- Integration tests for API communication
- E2E tests for complete effect lifecycle

### Visual Testing
- Color coding verification across themes
- Responsive layout testing on mobile devices
- Accessibility testing for screen readers

## Migration Notes

### Legacy Client Compatibility
- Existing V1 API endpoints remain functional
- Legacy CharacterEffectService patterns preserved
- Gradual migration approach prevents breaking changes

### Data Integrity
- No database changes required
- Existing character effects work with new frontend
- Validation rules consistent between versions

This specification maintains full compatibility with the existing backend implementation while providing a modern, user-friendly interface for managing character effects in the new frontend application.