# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-01-28-campaign-deletion-fix/spec.md

## CRITICAL REQUIREMENT: Unified Backend Response Format

**ARCHITECTURAL MANDATE**: ALL entity deletion endpoints MUST return IDENTICAL response structures when deletion is blocked by associations. This is not optional - it's a fundamental requirement that enables:

1. **Single Frontend Error Handler**: The frontend can implement ONE deletion error handler that works for ALL entities
2. **Code Reusability**: Deletion logic written once applies to campaigns, characters, vehicles, fights, etc.
3. **Maintainable System**: Changes to deletion behavior propagate consistently across all entity types
4. **Predictable API**: Developers can rely on consistent API behavior regardless of entity type

### Mandatory Response Structure

**HTTP Status Code**: 422 (Unprocessable Entity) - MUST be used for ALL constraint violations across ALL entities

**Standard Constraint Error Response** (EXACT format required for ALL entities):
```json
{
  "error": "Cannot delete {entity_type} due to associated data",
  "error_type": "associations_exist",
  "entity_type": "{entity_type}",
  "entity_id": "{uuid}",
  "constraints": {
    "{association_name}": {
      "count": 5,
      "details": [
        {"id": "uuid", "name": "Entity Name", "type": "entity_type"}
      ]
    }
  },
  "suggestions": [
    "Entity-specific suggested actions",
    "Use force=true to delete all associated data"
  ]
}
```

**CRITICAL FIELDS** (REQUIRED in every constraint response):
- `error`: Human-readable message following exact pattern
- `error_type`: Always "associations_exist" for constraint violations
- `entity_type`: The type of entity (campaign, character, vehicle, fight, etc.)
- `entity_id`: UUID of the entity being deleted
- `constraints`: Object with association details (same structure for all entities)
- `suggestions`: Array of actionable next steps

**COMPLIANCE REQUIREMENT**: Any endpoint that deviates from this structure violates the architectural requirement and breaks the unified frontend handler.

## Universal Deletion Endpoint Pattern

All entity deletion endpoints follow the same pattern and response structure for consistency.

### Supported DELETE Endpoints

- `DELETE /api/v2/campaigns/:id` - Delete campaigns with all associations
- `DELETE /api/v2/characters/:id` - Delete characters with schticks, weapons, shots
- `DELETE /api/v2/vehicles/:id` - Delete vehicles with weapons, shots
- `DELETE /api/v2/fights/:id` - Delete fights with shots and combat data
- `DELETE /api/v2/weapons/:id` - Delete weapons with ownership constraints
- `DELETE /api/v2/schticks/:id` - Delete schticks with character associations
- `DELETE /api/v2/sites/:id` - Delete sites with campaign associations
- `DELETE /api/v2/parties/:id` - Delete parties with character and campaign associations
- `DELETE /api/v2/factions/:id` - Delete factions with character and campaign associations
- `DELETE /api/v2/junctures/:id` - Delete junctures with campaign associations
- `DELETE /api/v2/users/:id` - Delete users with campaign memberships and ownership

### Universal Parameters
- `id` (required): UUID of the entity to delete
- `force` (optional): Boolean to force cascade deletion of associated data

## Response Patterns

### DELETE /api/v2/campaigns/:id (Example Implementation)

**Purpose:** Delete a campaign and handle associated data constraints

**Success Response (200):**
```json
{
  "message": "Campaign deleted successfully",
  "entity_type": "campaign",
  "entity_id": "uuid",
  "deleted_associations": {
    "characters": 5,
    "fights": 3,
    "sites": 2,
    "parties": 1,
    "factions": 2,
    "vehicles": 1,
    "junctures": 3
  }
}
```

**Constraint Error Response (422) - FOLLOWS UNIFIED FORMAT:**
```json
{
  "error": "Cannot delete campaign due to associated data",
  "error_type": "associations_exist",
  "entity_type": "campaign",
  "entity_id": "uuid",
  "constraints": {
    "characters": {
      "count": 5,
      "details": [
        {"id": "uuid1", "name": "Character 1", "type": "pc"},
        {"id": "uuid2", "name": "Character 2", "type": "npc"}
      ]
    },
    "fights": {
      "count": 3,
      "details": [
        {"id": "uuid3", "name": "Boss Fight", "status": "active"}
      ]
    },
    "vehicles": {
      "count": 1,
      "details": [
        {"id": "uuid4", "name": "Police Car", "type": "vehicle"}
      ]
    },
    "sites": {"count": 2},
    "parties": {"count": 1},
    "factions": {"count": 2},
    "junctures": {"count": 3}
  },
  "suggestions": [
    "Transfer characters and vehicles to another campaign",
    "Delete individual fights, characters, and vehicles first",
    "Use force=true to delete all associated data"
  ]
}
```

**Authentication Error Response (401):**
```json
{
  "error": "Authentication required"
}
```

**Authorization Error Response (403):**
```json
{
  "error": "Not authorized to delete this campaign"
}
```

**Not Found Error Response (404):**
```json
{
  "error": "Campaign not found"
}
```

### DELETE /api/v2/characters/:id (Additional Example)

**Success Response (200):**
```json
{
  "message": "Character deleted successfully",
  "entity_type": "character",
  "entity_id": "uuid",
  "deleted_associations": {
    "schticks": 5,
    "weapons": 3,
    "shots": 2
  }
}
```

**Constraint Error Response (422) - FOLLOWS UNIFIED FORMAT:**
```json
{
  "error": "Cannot delete character due to associated data",
  "error_type": "associations_exist",
  "entity_type": "character", 
  "entity_id": "uuid",
  "constraints": {
    "schticks": {
      "count": 5,
      "details": [
        {"id": "uuid1", "name": "Gun Fu", "type": "schtick"}
      ]
    },
    "weapons": {
      "count": 3,
      "details": [
        {"id": "uuid2", "name": "Pistol", "damage": 9}
      ]
    },
    "active_fights": {
      "count": 1,
      "details": [
        {"id": "uuid3", "name": "Boss Fight", "status": "active"}
      ]
    }
  },
  "suggestions": [
    "Remove character from active fights first",
    "Transfer weapons to other characters",
    "Use force=true to delete character with all equipment"
  ]
}
```

### DELETE /api/v2/fights/:id (Additional Example)

**Constraint Error Response (422) - FOLLOWS UNIFIED FORMAT:**
```json
{
  "error": "Cannot delete fight due to associated data",
  "error_type": "associations_exist",
  "entity_type": "fight",
  "entity_id": "uuid", 
  "constraints": {
    "shots": {
      "count": 4,
      "details": [
        {"character_name": "Hero", "shot": 15},
        {"character_name": "Villain", "shot": 12}
      ]
    },
    "combat_status": "active"
  },
  "suggestions": [
    "End the fight before deleting",
    "Remove all characters from initiative",
    "Use force=true to delete active fight"
  ]
}
```

## Universal Controller Pattern

### All Entity Controllers (Api::V2::{Entity}Controller#destroy)
- **Consistent Business Logic**: Check for associated records before attempting deletion across all entity types
- **Service Integration**: Delegate deletion logic to entity-specific deletion services
- **CRITICAL: Unified Error Handling**: ALL controllers MUST return the exact same error response structure (see Unified Format above)
- **Response Format Compliance**: Controllers MUST validate their error responses match the unified structure exactly
- **Authorization**: Ensure proper permissions for entity deletion based on user role and ownership
- **Audit Logging**: Log deletion attempts and outcomes for all entity types

### Universal Deletion Service Pattern

#### Base EntityDeletionService
- **Common Interface**: Define standard methods for constraint validation and deletion
- **CRITICAL: Unified Error Collection**: ALL services MUST generate responses that match the exact unified format
- **Response Format Enforcement**: Base service MUST validate that all error responses follow the unified structure
- **Force Deletion Support**: Universal force parameter handling
- **Transaction Management**: Atomic operations for all cascade deletions
- **WebSocket Integration**: Broadcast deletion events for real-time updates

#### Entity-Specific Deletion Services
- **CampaignDeletionService**: Check characters, vehicles, fights, sites, parties, factions, junctures
- **CharacterDeletionService**: Check schticks, weapons, active fight participation
- **VehicleDeletionService**: Check weapons, active fight participation
- **FightDeletionService**: Check shots, combat status, character/vehicle participation
- **WeaponDeletionService**: Check character/vehicle ownership
- **SchtickDeletionService**: Check character ownership
- **SiteDeletionService**: Check campaign association
- **PartyDeletionService**: Check characters, campaign association
- **FactionDeletionService**: Check characters, campaign association  
- **JunctureDeletionService**: Check campaign association
- **UserDeletionService**: Check campaign memberships, owned entities

## Purpose

The comprehensive entity deletion system addresses inconsistent deletion behavior across all entity types by:

1. **CRITICAL: Unified Response Format**: ALL entities return identical error response structures, enabling a single frontend error handler
2. **Universal Constraint Handling**: Checking for associated data before deletion attempts for all entities  
3. **Consistent Error Communication**: Providing detailed information about why deletion failed using the same format across all entity types
4. **User Empowerment**: Offering specific, entity-appropriate suggestions for resolving constraints
5. **Flexible Deletion Options**: Supporting both prevented and cascade deletion strategies for all entities
6. **Standardized Integration**: Maintaining existing API patterns while enhancing functionality across all endpoints
7. **Comprehensive Coverage**: Ensuring all entity types (Campaigns, Characters, Vehicles, Fights, Weapons, Schticks, Sites, Parties, Factions, Junctures, Users) have proper deletion handling
8. **Force Parameter Consistency**: Providing uniform force deletion capabilities where appropriate
9. **Developer Experience**: Creating predictable API behavior that developers can rely on across all entity management operations
10. **Architectural Consistency**: The unified response format is a fundamental architectural decision that simplifies frontend implementation and ensures system maintainability