# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-07-cheese-it-escape/spec.md

> Created: 2025-09-07
> Version: 1.0.0

## Endpoints

All escape-related actions use the existing combat action endpoint:

### POST /api/v2/encounters/:id/apply_combat_action

This endpoint handles all escape-related actions through the `character_updates` array parameter.

#### Escape Attempt
**Parameters (in character_updates array):**
```json
{
  "character_updates": [
    {
      "character_id": "uuid",
      "shot_id": "uuid", 
      "shot": 9,  // new shot position after spending 3 (or 2 for Boss/Uber-Boss)
      "add_status": ["cheesing_it"],
      "event": {
        "type": "escape_attempt",
        "description": "Character Name is attempting to escape!"
      }
    }
  ]
}
```

#### Prevention Attempt (Success)
**Parameters (in character_updates array):**
```json
{
  "character_updates": [
    {
      "character_id": "preventing-character-uuid",
      "shot": 8,  // deduct shots for prevention attempt
      "action_values": { "Fortune": 5 },  // if PC spent fortune
      "event": {
        "type": "prevent_escape",
        "description": "Preventer Name attempts to stop Escaper Name"
      }
    },
    {
      "character_id": "escaping-character-uuid",
      "remove_status": ["cheesing_it"],  // remove only "cheesing_it" from status array
      "event": {
        "type": "escape_prevented",
        "description": "Preventer Name prevented Escaper Name from escaping!"
      }
    }
  ]
}
```

#### Prevention Attempt (Failure)
**Parameters (in character_updates array):**
```json
{
  "character_updates": [
    {
      "character_id": "preventing-character-uuid",
      "shot": 8,  // deduct shots for prevention attempt
      "action_values": { "Fortune": 5 },  // if PC spent fortune
      "event": {
        "type": "prevent_escape_failed",
        "description": "Preventer Name failed to stop Escaper Name"
      }
    },
    {
      "character_id": "escaping-character-uuid",
      "remove_status": ["cheesing_it"],
      "add_status": ["cheesed_it"],  // change from "cheesing_it" to "cheesed_it"
      "event": {
        "type": "escape_succeeded",
        "description": "Escaper Name successfully escaped!"
      }
    }
  ]
}
```

#### Cancel Escape
**Parameters (in character_updates array):**
```json
{
  "character_updates": [
    {
      "character_id": "uuid",
      "remove_status": ["cheesing_it"],  // remove "cheesing_it" from status array
      "event": {
        "type": "escape_canceled",
        "description": "Character Name canceled their escape attempt"
      }
    }
  ]
}
```

## Controllers

### Extended CombatActionService

**Implementation Required:**
Add support for `add_status` and `remove_status` arrays in character_updates:
```ruby
# In apply_character_update method
if update[:add_status].present?
  update[:add_status].each { |status| entity.add_status(status) }
end

if update[:remove_status].present?
  update[:remove_status].each { |status| entity.remove_status(status) }
end
```

**Handles:**
- Escape initiation: Add "cheesing_it" status, deduct shot cost
- Prevention success: Remove "cheesing_it" status, deduct preventer's shots/fortune
- Prevention failure: Remove "cheesing_it" and add "cheesed_it", deduct preventer's shots/fortune
- Cancel escape: Remove "cheesing_it" status

**Business Logic:**
- Validate character ownership/control permissions
- Apply status changes based on frontend calculation
- Process shot and fortune costs
- Process pre-calculated results from frontend (success/failure already determined)
- Update character status arrays ("cheesing_it", "cheesed_it", or clear status)
- Trigger appropriate WebSocket broadcasts
- Log fight events for history

**Error Handling:**
- Return appropriate HTTP status codes
- Include descriptive error messages
- Handle race conditions for simultaneous prevention attempts