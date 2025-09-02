# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-01-vehicle-chase-system/spec.md

## Implementation Note

**IMPORTANT:** The API design will follow the atomic state update pattern being developed for combat operations. All chase-related state changes (chase points, gap distances, driver assignments) will be handled as atomic transactions to ensure consistency and prevent race conditions. The exact API structure may be refined once the combat atomic update system is finalized.

## Endpoints

### POST /api/v2/chases

**Purpose:** Create a new chase within an active fight
**Parameters:** 
- `fight_id` (required): UUID of the parent fight
- `vehicle_participants`: Array of objects with `vehicle_id` and `role` (pursuer/evader)

**Request Body:**
```json
{
  "chase": {
    "fight_id": "uuid",
    "vehicle_participants": [
      { "vehicle_id": "uuid", "role": "pursuer" },
      { "vehicle_id": "uuid", "role": "evader" }
    ]
  }
}
```

**Response:** 201 Created
```json
{
  "id": "uuid",
  "fight_id": "uuid",
  "status": "active",
  "participants": [...],
  "gaps": [...]
}
```

**Errors:** 
- 404: Fight not found
- 422: Invalid vehicle IDs or roles
- 409: Vehicle already in active chase

### GET /api/v2/chases/:id

**Purpose:** Retrieve current chase state with all participants and gaps
**Parameters:** Chase ID in URL

**Response:** 200 OK
```json
{
  "id": "uuid",
  "fight_id": "uuid", 
  "status": "active",
  "participants": [
    {
      "vehicle_id": "uuid",
      "vehicle": { "name": "...", "squeal": 10, "crunch": 8 },
      "driver": { "id": "uuid", "name": "..." },
      "role": "pursuer",
      "chase_points": 15,
      "condition_points": 5
    }
  ],
  "gaps": [
    {
      "pursuer_id": "uuid",
      "evader_id": "uuid", 
      "distance": "near"
    }
  ]
}
```

**Errors:**
- 404: Chase not found

### PATCH /api/v2/chases/:id

**Purpose:** Update chase status or end chase
**Parameters:** 
- Chase ID in URL
- `status`: "completed" or "abandoned"

**Request Body:**
```json
{
  "chase": {
    "status": "completed"
  }
}
```

**Response:** 200 OK (returns updated chase)

**Errors:**
- 404: Chase not found
- 422: Invalid status transition

### POST /api/v2/chases/:id/driving_check

**Purpose:** Resolve a driving check action
**Parameters:**
- `driver_id`: Character making the check
- `vehicle_id`: Vehicle being driven
- `target_vehicle_id`: Target vehicle
- `swerve`: Die roll result
- `boost_value`: Any boost applied

**Request Body:**
```json
{
  "driving_check": {
    "driver_id": "uuid",
    "vehicle_id": "uuid",
    "target_vehicle_id": "uuid",
    "swerve": 5,
    "boost_value": 2
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "outcome": 3,
  "chase_points_applied": 7,
  "gap_change": "closer",
  "new_distance": "near",
  "target_chase_points": 22
}
```

**Errors:**
- 404: Chase, vehicle, or driver not found
- 422: Invalid action (not driver's turn, vehicles not in chase)

### POST /api/v2/chases/:id/sideswipe

**Purpose:** Execute a sideswipe attack (only when Near)
**Parameters:**
- Same as driving_check

**Request Body:**
```json
{
  "sideswipe": {
    "driver_id": "uuid",
    "vehicle_id": "uuid",
    "target_vehicle_id": "uuid",
    "swerve": 5,
    "boost_value": 0
  }
}
```

**Response:** 200 OK
```json
{
  "success": true,
  "outcome": 4,
  "chase_points_applied": 8,
  "condition_points_applied": 6,
  "target_chase_points": 30,
  "target_condition_points": 12
}
```

**Errors:**
- 404: Resources not found
- 422: Vehicles not Near each other
- 422: Not a valid action for this turn

### PATCH /api/v2/vehicles/:id/assign_driver

**Purpose:** Assign or change a vehicle's driver
**Parameters:**
- Vehicle ID in URL
- `driver_id`: Character to assign as driver (null to remove)

**Request Body:**
```json
{
  "vehicle": {
    "driver_id": "uuid"
  }
}
```

**Response:** 200 OK (returns updated vehicle with driver)

**Errors:**
- 404: Vehicle or character not found
- 409: Character already driving another vehicle
- 422: Character not in same fight as vehicle

### GET /api/v2/fights/:fight_id/chases

**Purpose:** List all chases (active and completed) for a fight
**Parameters:** Fight ID in URL

**Response:** 200 OK
```json
{
  "chases": [
    {
      "id": "uuid",
      "status": "active",
      "participant_count": 3,
      "started_at": "2025-09-01T10:00:00Z"
    }
  ]
}
```

**Errors:**
- 404: Fight not found

## WebSocket Events

### Chase Channel Subscriptions

**Channel:** `ChaseChannel`
**Room:** `chase:${chase_id}`

**Events Broadcast:**
- `chase_created`: New chase initiated
- `chase_updated`: Chase state changed
- `driving_check_resolved`: Driving check completed
- `sideswipe_resolved`: Sideswipe attack completed
- `gap_changed`: Distance between vehicles changed
- `vehicle_eliminated`: Vehicle reached 35/50 chase points
- `chase_completed`: Chase ended
- `driver_assigned`: Driver changed for a vehicle

## Controller Implementation

All chase endpoints will be implemented in:
- `app/controllers/api/v2/chases_controller.rb`
- `app/controllers/api/v2/vehicles_controller.rb` (for driver assignment)

Services to implement business logic:
- `app/services/chase_service.rb` - Core chase mechanics
- `app/services/driving_check_service.rb` - Driving check resolution
- `app/services/sideswipe_service.rb` - Sideswipe attack resolution

Serializers for consistent JSON responses:
- `app/serializers/chase_serializer.rb`
- `app/serializers/chase_participant_serializer.rb`
- `app/serializers/chase_gap_serializer.rb`