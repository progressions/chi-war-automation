# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Version: 1.0.0

## Endpoints

### POST /api/v2/encounters/:id/apply_combat_action

**Purpose:** Process Up Check results and update character status in combat
**Parameters:** 
- `id` (path parameter) - UUID of the current encounter
- `character_updates` (body) - Array of character update objects

**Request Body Example:**
```json
{
  "character_updates": [
    {
      "character_id": "uuid-here",
      "action_values": {
        "Fortune": 2,
        "Marks of Death": 1
      },
      "attributes": {
        "status": "active"
      },
      "event": {
        "type": "up_check",
        "description": "Character made Up Check (Swerve 3 + Toughness 7 = 10, Success)",
        "details": {
          "swerve_roll": 3,
          "toughness": 7,
          "total": 10,
          "target": 5,
          "used_fortune": true,
          "result": "success"
        }
      }
    }
  ]
}
```

**Response:** 
Returns the updated Encounter object serialized with EncounterSerializer, which includes:
- Fight details with all shots and characters
- Current fight state
- Updated character statuses
- Fight events including the Up Check event
```

**Errors:** 
- 404: Encounter or character not found
- 422: Invalid Up Check data
- 403: User not authorized to control this character

### GET /api/v2/characters/:id/wound_status

**Purpose:** Check if a character needs an Up Check
**Parameters:**
- `id` (path parameter) - UUID of the character

**Response:**
```json
{
  "wounds": 36,
  "threshold": 35,
  "exceeds_threshold": true,
  "needs_up_check": true,
  "marks_of_death": 0,
  "status": "active"
}
```

**Errors:**
- 404: Character not found
- 403: User not authorized to view this character

## Controller Actions

### EncountersController#apply_combat_action

The existing endpoint already supports the needed structure through character_updates array. For Up Check:
- Process character_updates with event.type = "up_check"
- Update action_values["Marks of Death"] (increment when threshold exceeded)
- Update action_values["Fortune"] if point spent
- Modify character.status JSONB array based on result
- Success: No status change (character stays active)
- Failure: Add "out_of_fight" to status array (permanent for fight)
- Log fight event with Up Check details
- CombatActionService handles PC character updates persistently
- Broadcasts update via Action Cable automatically

### CharactersController#wound_status

New action to check wound threshold status:
- Calculate current wound threshold (checking for overrides)
- Compare wounds to threshold
- Return whether Up Check is needed
- Include current Marks of Death count

## External Dependencies

None - uses existing Rails patterns and Action Cable for real-time updates