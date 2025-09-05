# API Specification

This is the API specification for the spec detailed in @specs/2025-09-05-vehicle-chase-defeat-thresholds/spec.md

## Endpoints

### GET /api/v2/vehicles/:id

**Purpose:** Retrieve vehicle details including defeat status
**Parameters:** 
- id: Vehicle UUID

**Response Enhancement:**
```json
{
  "id": "uuid",
  "name": "Police Car",
  "shot_id": "uuid",
  "impairments": 1,
  "was_rammed_or_damaged": true,
  "action_values": {
    "Chase Points": 35,
    "Type": "Featured Foe",
    ...
  },
  "driver": {
    "id": "uuid", 
    "name": "Officer Chen",
    "action_values": {
      "Type": "Featured Foe"
    }
  },
  "is_defeated_in_chase": true,
  "defeat_type": "crashed",
  "defeat_threshold": 35,
  ...
}
```

**Note:** `impairments` and `was_rammed_or_damaged` come from the shot record, not the vehicle model

**Errors:** 404 if vehicle not found, 401 if unauthorized

### POST /api/v2/vehicles/:id/apply_chase_action

**Purpose:** Apply chase action to vehicle and detect defeat
**Parameters:**
- id: Vehicle UUID
- chase_action: Action details including chase point changes and action type (ram, sideswipe, weapon, etc.)

**Response:** Updated vehicle JSON with defeat status and type

**Side Effects:**
- Sets shot.was_rammed_or_damaged to true for ram/sideswipe/weapon actions
- Creates fight_event record if defeat threshold crossed with appropriate message:
  - "[Vehicle] has crashed!" if shot.was_rammed_or_damaged is true
  - "[Vehicle] is boxed in!" if shot.was_rammed_or_damaged is false
- Broadcasts defeat event via WebSocket including defeat type

**Errors:** 422 if invalid data, 404 if not found, 401 if unauthorized

### GET /api/v2/fights/:fight_id/vehicles

**Purpose:** List all vehicles in a fight with their defeat status
**Parameters:** 
- fight_id: Fight UUID

**Response Enhancement:**
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "name": "Motorcycle",
      "shot_id": "uuid",
      "impairments": 0,
      "was_rammed_or_damaged": false,
      "is_defeated_in_chase": false,
      "defeat_type": null,
      "defeat_threshold": 35,
      "action_values": {
        "Chase Points": 10,
        ...
      },
      ...
    }
  ]
}
```

**Note:** Fight-scoped data (impairments, was_rammed_or_damaged) comes from shot records

## WebSocket Events

### FightChannel Broadcast

**Event:** vehicle_defeated_in_chase

**Payload:**
```json
{
  "type": "vehicle_defeated_in_chase",
  "vehicle_id": "uuid",
  "vehicle_name": "Police Car",
  "defeat_type": "crashed",
  "defeat_threshold": 35,
  "chase_points": 36,
  "pursuer": true,
  "message": "Police Car has crashed!"
}
```

**Trigger:** When vehicle chase points cross defeat threshold

## Controllers

### Api::V2::VehiclesController

**Actions to Modify:**
- `show`: Include defeat status fields in serialization
- `apply_chase_action`: Check for defeat threshold crossing after applying chase action
- `index`: Include defeat status in vehicle list responses

### Api::V2::FightsController  

**Actions to Modify:**
- `vehicles`: Include defeat status and was_rammed_or_damaged from shot records for all vehicles in fight

## Business Logic

### ChaseActionService

**New Methods:**
- `check_defeat_status(vehicle)`: Evaluate if vehicle is defeated
- `handle_defeat_event(vehicle, fight)`: Create fight_event record and broadcast

**Modified Methods:**
- `apply_chase_action`: Add defeat detection after chase point updates, create fight_event when threshold crossed

## Error Handling

- Invalid chase point values (negative numbers): Return 422 with error message
- Missing driver when calculating defeat threshold: Use default Featured Foe threshold (35)
- WebSocket broadcast failures: Log error but don't block response