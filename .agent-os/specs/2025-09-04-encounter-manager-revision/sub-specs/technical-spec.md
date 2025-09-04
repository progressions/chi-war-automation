# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-04-encounter-manager-revision/spec.md

> Created: 2025-09-04
> Version: 1.0.0

## Technical Requirements

### Component Architecture

- **Enhanced CharacterSelector**: Minor modification to the existing CharacterSelector component
  - The component behavior is already 95% correct
  - Simply add shot labels (e.g., "Shot 12", "Shot 10") before each shot group
  - Expose selected character to parent component via onSelect callback
  - No changes needed to:
    - Grouping logic (already correct)
    - Ordering logic (already correct) 
    - Selection behavior (already correct)
    - Avatar display (already correct)
    - Horizontal layout (already correct)
    - Visual feedback (already handles highlighting, clicking, etc.)

- **EncounterActionBar**: New component for displaying available actions after character selection
  - Dynamically shows/hides based on character selection state
  - Displays action buttons (Attack, Boost, Chase, Heal, etc.) based on character capabilities
  - Maintains consistent styling with existing MenuBar component
  - Handles action button clicks to open respective panels with pre-selected character

### State Management

- Extend EncounterContext with:
  - `selectedActorId`: Track the currently selected character for actions
  - `selectedActorShot`: Store the shot position of selected character
  - Update existing panels to check for pre-selected actor

### UI/UX Specifications

- **Shot Groups Layout**:
  - Horizontal display of characters (matching current CharacterSelector layout)
  - Characters on the same shot displayed horizontally in a row
  - Shot labels inserted before each shot group
  - Clear visual separation between shot groups (dividers or spacing)
  - Shot labels prominently displayed with countdown styling
  - Horizontal scroll if total width exceeds container

- **Character Selection Feedback**:
  - All visual feedback already handled correctly by existing CharacterSelector
  - Component already displays selected state, highlighting, hover effects, etc.
  - No changes needed to selection display behavior

- **Action Bar Behavior**:
  - Slides in/fades in when character selected
  - Positioned between character selector and main encounter content
  - Sticky positioning to remain visible during scroll
  - Clear visual connection to selected character

### Integration Points

- Move the enhanced CharacterSelector from inside action panels to top-level encounter manager
- Modify existing MenuBar to work with the elevated character selector
- Update AttackPanel, BoostPanel, ChasePanel to:
  - Accept pre-selected character as prop
  - Skip character selection step if actor already chosen
  - Maintain backwards compatibility for direct action selection
  - Reuse existing shot sorting logic from `attacks/shotSorting.ts`

- The CharacterSelector already uses `getAllVisibleShots()` for correct ordering
- Ensure ShotCounter still displays but in reduced/integrated form
- Maintain WebSocket real-time updates for character position changes

### Performance Considerations

- Memoize character grouping by shot to prevent unnecessary recalculations
- Use React.memo for character avatar components to prevent re-renders
- Lazy load action panels only when needed
- Standard encounter sizes (typically 5-20 characters) won't require special optimization