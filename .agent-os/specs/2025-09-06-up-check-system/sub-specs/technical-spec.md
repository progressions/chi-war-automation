# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Version: 1.0.0

## Technical Requirements

### Frontend Components

- **UpCheckPanel Component** - New panel component following the pattern of AttackPanel, ChasePanel, HealPanel, and BoostPanel
  - Location: `shot-client-next/src/components/encounters/panels/UpCheckPanel.tsx`
  - Props: character, onClose, onResolve
  - Contains NumberField for Swerve input (required)
  - Contains NumberField for Fortune input (optional, default 0)
  - Display character's current Toughness value
  - "Resolve" button to submit the check
  - Visual indicator showing required threshold (5)

- **Action Bar Integration**
  - Add "Up Check" button to `shot-client-next/src/components/encounters/ActionBar.tsx`
  - Button only visible when selected character is PC with "up_check_required" status
  - Uses same styling pattern as existing action buttons
  - Opens UpCheckPanel when clicked

### State Management

- **Character Status Tracking**
  - Update Character type definition to include new `status` field (string array)
  - Add status checks to CharacterService utility functions
  - Create new helper functions: `hasUpCheckRequired()`, `isOutOfFight()`
  - Update wound damage calculations to trigger "up_check_required" status

- **Mark of Death Management**
  - Increment existing Marks of Death in character's action_values
  - Automatically increment when PC reaches wound threshold
  - Additional Mark of Death when Fortune die is used in Up Check
  - Integrate with existing character update flow
  - Ensure proper synchronization with backend

### Backend Services

- **Up Check Resolution Service**
  - Process Up Check submissions through encounters controller
  - Calculate success: (swerve + fortune + toughness) >= 5
  - Deduct Fortune point if Fortune die used
  - Add Mark of Death if Fortune die used
  - Update character status based on result:
    - Success: Remove "up_check_required" status (can be triggered again)
    - Failure: Set status to ["out_of_fight"]
  - Log Up Check attempt in fight_events table
  - Broadcast status changes via WebSocket to all session participants

- **Wound Threshold Detection**
  - Hook into existing damage application logic
  - Check if character is PC and wounds >= threshold
  - Automatically apply Mark of Death and set "up_check_required" status
  - Support multiple Up Checks per fight (PC can keep making checks as long as they succeed)
  - Clear "up_check_required" if PC is healed below threshold before making check
  - Use woundThresholds from SharedService for threshold values

### UI/UX Specifications

- **Visual Indicators**
  - Characters with "up_check_required" status show badge in Shot Counter character details
  - Characters with "out_of_fight" status show defeated/grayed out appearance (PCs, NPCs, and Mooks)
  - Up Check button appears only when selected character has "up_check_required" status
  - Panel displays calculation preview identical to Attack Panel and Chase Panel format
  - Shows: Swerve + Fortune + Toughness vs Difficulty 5

- **User Flow**
  1. PC takes damage bringing wounds to 35+
  2. System automatically adds Mark of Death to action_values
  3. Character status updates to "up_check_required"
  4. Badge appears in Shot Counter character details
  5. "Up Check" button appears in Action Bar when character selected
  6. Player clicks button, enters rolls in panel (sees calculation preview)
  7. If using Fortune die: costs Fortune point, adds another Mark of Death
  8. System calculates and applies result
  9. Character either continues (success, can face more Up Checks) or is defeated (failure)
  10. Event logged in fight_events table

### Performance Criteria

- Up Check panel opens within 200ms of button click
- Status updates propagate to all clients within 500ms via WebSocket
- No additional database queries beyond existing character updates
- Reuse existing combat action submission infrastructure

## Approach

### Implementation Strategy

1. **Backend Foundation**
   - Extend Character model with status field (JSON array)
   - Create service methods for status management
   - Hook into existing damage calculation flow
   - Add API endpoint for Up Check resolution

2. **Frontend Infrastructure**
   - Update TypeScript types for character status
   - Create status utility functions
   - Build reusable UpCheckPanel component
   - Integrate with existing ActionBar component

3. **Testing Strategy**
   - Unit tests for status calculation logic
   - Component tests for UpCheckPanel
   - Integration tests for damage threshold triggers
   - E2E tests for complete Up Check workflow

### Integration Points

- **Damage System**: Hook into existing wound calculation
- **Combat Actions**: Reuse action submission infrastructure
- **WebSocket**: Leverage existing FightChannel broadcasts
- **UI Components**: Follow established panel component patterns

## External Dependencies

### Existing Systems
- Character damage calculation system
- Combat action processing infrastructure
- WebSocket broadcasting via FightChannel
- Material-UI component library
- Existing panel component architecture

### New Dependencies
- None - leverages existing infrastructure

### Database Changes
- Add `status` JSON field to characters table
- Migration to support character status tracking
- Index on status field for efficient queries