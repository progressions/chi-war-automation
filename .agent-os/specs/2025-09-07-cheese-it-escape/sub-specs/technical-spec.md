# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-07-cheese-it-escape/spec.md

> Created: 2025-09-07
> Version: 1.0.0

## Technical Requirements

### Frontend Requirements

- **Action Bar Integration**: Add "Cheese It" button to the Action Bar (the single toolbar containing Attack, Chase, Heal, Boost buttons)
- **Status Display**: Update character status indicators to show "cheesing_it" and "cheesed_it" badges/icons
- **Prevention UI**: Add "Prevent Escape" button that opens a Prevent Escape Panel for eligible characters (those acting after the escaping character in shot order)
- **Prevent Escape Panel**: New panel component (like Attack Panel, Chase Panel, etc.) with Swerve NumberField (and optional Fortune NumberField for PCs), shows equation: Speed + Swerve + Fortune >= Target Speed
- **Real-time Updates**: WebSocket broadcasts for escape attempts and resolutions via EncounterContext
- **Visual Feedback**: Clear visual indicators (colors, icons, animations) for escape states

### Backend Requirements

- **Status Management**: Extend character status handling in Character model to support "cheesing_it" and "cheesed_it" statuses
- **Combat Action Service**: Extend existing CombatActionService to handle new `add_status` and `remove_status` fields in character_updates payload, calling the Character model's existing add_status() and remove_status() methods
- **Frontend Calculation**: Frontend calculates success/failure (Speed + Swerve + Fortune >= Target Speed) and sends result to backend
- **Status Updates**: CombatActionService processes payloads for: a) character entering "cheesing_it" status with shot cost, b) successful/failed prevention with shot/fortune costs and status changes
- **WebSocket Broadcasting**: Broadcast escape attempts and resolutions through encounter broadcast (not FightChannel)
- **Fight Event Logging**: Create fight_events entries for escape attempts, prevention attempts (success/failure), and final escape status

### Data Flow

1. Character clicks "Cheese It" → API call to `/api/v2/encounters/:id/apply_combat_action` to set status and deduct shots (3 or 2 for Boss/Uber-Boss) → Broadcast to all clients
2. Eligible character clicks "Prevent" → User enters Swerve (+ Fortune for PCs) → Frontend calculates success → Sends result to `/api/v2/encounters/:id/apply_combat_action` → Broadcast status changes
3. If prevented: Remove "cheesing_it" status, character remains active in fight
4. If not prevented: Character gains "cheesed_it" status, remains visible but escaped

### Performance Considerations

- Minimize API calls by batching status updates with other combat actions
- Cache eligible preventers list on client side, update on shot changes
- Use optimistic UI updates for better responsiveness

## Approach

The implementation will follow the existing combat action patterns in the Chi War system:

### API V2 Endpoints
- `POST /api/v2/encounters/{id}/apply_combat_action` - Single endpoint for all escape-related actions (initiate escape, prevent escape, cancel escape) using character_updates array

### Service Layer Pattern
Extend the existing `CombatActionService` to handle escape-related status updates, following the established pattern for combat actions.

### WebSocket Integration
Leverage the existing encounter broadcast infrastructure for real-time updates, ensuring all connected clients receive immediate feedback on escape attempts and resolutions.

## External Dependencies

- **Existing Combat System**: Integrates with current shot management and turn progression
- **Character Status System**: Extends current character status tracking
- **WebSocket Infrastructure**: Uses established Action Cable channels
- **Speed Attribute**: Relies on existing character Speed attribute for resolution mechanics