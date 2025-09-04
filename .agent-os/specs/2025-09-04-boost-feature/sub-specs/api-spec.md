# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-04-boost-feature/spec.md

> Created: 2025-09-04
> Version: 1.0.0

## Endpoints

### Combat Action Update - Boost

**Endpoint:** `PATCH /api/v2/encounters/:encounter_id/combat_action_update`

**Purpose:** Process boost action as part of the atomic combat action update system

**Description:** Boost actions are processed through the existing combat action update endpoint to ensure all character updates (shot deduction, Fortune spending, effect creation) happen in a single atomic transaction with one WebSocket broadcast.

**Request Body:**
```json
{
  "combat_action": {
    "action_type": "boost",
    "booster_id": "uuid-of-boosting-character",
    "target_id": "uuid-of-target-character",
    "boost_type": "attack" | "defense",
    "use_fortune": true | false  // PC only option
  }
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "encounter": {
    "id": "encounter-uuid",
    "round": 1,
    "segment": 15
  },
  "updates": {
    "characters": [
      {
        "id": "booster-uuid",
        "current_shots": 9,        // After 3-shot deduction
        "fortune_points": 2        // If Fortune was spent (PC only)
      },
      {
        "id": "target-uuid",
        "character_effects": [
          {
            "id": "effect-uuid",
            "name": "Attack Boost",
            "attack": 2,           // +1/+2 for attack boost
            "defense": 0,          // or +3/+5 for defense boost
            "description": "Boost from Hero Name",
            "active": true
          }
        ]
      }
    ]
  },
  "action_log": {
    "description": "Hero Name boosted Ally Name's attack (+2)",
    "timestamp": "2025-09-04T10:00:00.000Z"
  }
}
```

**WebSocket Broadcast:**
The endpoint triggers a single `combat_action_update` event to all fight participants with the consolidated changes.

**Error Responses:**
- `400 Bad Request`: Invalid boost parameters or missing required fields
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized (not campaign member or character owner)
- `404 Not Found`: Encounter, booster, or target not found
- `422 Unprocessable Entity`: Validation errors (e.g., PC attempting Fortune without points)

### Get Active Boosts

**Endpoint:** `GET /api/v2/encounters/:encounter_id/active_boosts`

**Purpose:** Retrieve all active boost effects in the current encounter

**Success Response (200 OK):**
```json
{
  "active_boosts": [
    {
      "id": "effect-uuid",
      "character": {
        "id": "character-uuid",
        "name": "Character Name"
      },
      "name": "Attack Boost",
      "attack": 1,
      "defense": 0,
      "boosted_by": {
        "id": "booster-uuid",
        "name": "Booster Name"
      }
    }
  ]
}
```

## Integration Notes

### Transaction Handling
All boost operations must be wrapped in database transactions to ensure atomicity:
- Shot deduction from booster
- Fortune point deduction (if applicable)
- CharacterEffect creation for target
- WebSocket broadcast with all updates

### WebSocket Events
```javascript
// Single event broadcast for entire boost action
{
  "type": "combat_action_update",
  "data": {
    "action": "boost",
    "booster_id": "uuid",
    "target_id": "uuid",
    "boost_type": "attack",
    "updates": {
      // All character updates in one payload
    }
  }
}
```

### Validation Rules
- Booster must be in the encounter
- Target must be in the encounter
- Booster must have sufficient shots (warning if < 3, but allow negative)
- PC must have Fortune points if `use_fortune: true`
- Target selection follows same rules as Attack Panel targeting

### Effect Management
- Boosts are standard CharacterEffects with attack/defense modifiers
- Effects persist until manually removed or modified
- No automatic expiration logic required