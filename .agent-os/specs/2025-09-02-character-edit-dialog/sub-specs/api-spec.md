# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-02-character-edit-dialog/spec.md

> Created: 2025-09-02
> Version: 1.0.0

## API Endpoints

### Character Update Endpoint

**Endpoint**: `PATCH /api/v2/characters/:id`

**Purpose**: Update character attributes including name, wounds, marks of death, and impairments (for PC characters only)

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "character": {
    "name": "Updated Character Name",
    "impairments": 2,
    "action_values": {
      "Wounds": 5,
      "Marks of Death": 1
    }
  }
}
```

**Response (Success 200)**:
```json
{
  "id": "uuid",
  "name": "Updated Character Name",
  "impairments": 2,
  "action_values": {
    "Wounds": 5,
    "Marks of Death": 1
  },
  "updated_at": "2025-09-02T10:30:00Z"
}
```

**Response (Error 422)**:
```json
{
  "errors": {
    "action_values": ["Marks of Death must be between 0 and 5"],
    "impairments": ["must be greater than or equal to 0"]
  }
}
```

### Shot Update Endpoint

**Endpoint**: `PATCH /api/v1/actors/:id` (existing actor endpoint)

**Purpose**: Update shot position and impairments for non-PC characters

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "character": {
    "shot_id": "shot-uuid-here",
    "current_shot": 15,
    "impairments": 1
  }
}
```

**Response (Success 200)**:
```json
{
  "id": "actor-uuid",
  "shot": 15,
  "impairments": 1,
  "updated_at": "2025-09-02T10:30:00Z"
}
```

## Validation Rules

### Character Model Validations

- **name**: String, presence required, max length 255 characters
- **impairments**: Integer, minimum 0, maximum 10 (only for PC characters)
- **action_values.Wounds**: Integer, minimum 0, maximum 999
- **action_values["Marks of Death"]**: Integer, minimum 0, maximum 5

### Shot Model Validations

- **shot**: Integer, minimum 0, maximum 30
- **impairments**: Integer, minimum 0, maximum 10 (for non-PC characters)

## Business Logic

### Character Type Handling

1. **PC Characters**: 
   - Update character model fields directly
   - `impairments` stored on character record
   - Both character update AND shot update may be needed

2. **Non-PC Characters (Ally, Mook, Featured Foe, Boss, Uber-Boss)**:
   - Update shot association for impairments and shot position
   - Update character model for name, wounds, marks of death
   - `impairments` stored on shot record

### WebSocket Broadcasting

After successful updates, trigger:
```ruby
broadcast_encounter_update!
```

This ensures all connected clients receive real-time updates to the encounter state.

## Error Handling

### Client-Side Validation
- Validate numeric ranges before API call
- Display validation errors inline with form fields
- Prevent submission if validation fails

### Server-Side Validation
- Return 422 with specific field errors
- Log validation failures for debugging
- Maintain data consistency across related models

### Network Error Handling
- Implement retry logic for transient failures
- Rollback optimistic updates on failure
- Display user-friendly error messages via toast notifications

## Security Considerations

- Validate user has access to the campaign containing the character
- Ensure user has appropriate permissions (gamemaster role typically required)
- Sanitize input values to prevent injection attacks
- Rate limiting to prevent abuse of update endpoints