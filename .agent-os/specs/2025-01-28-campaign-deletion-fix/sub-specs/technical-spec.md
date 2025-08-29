# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-01-28-campaign-deletion-fix/spec.md

## Critical Architectural Decision: Unified Backend Response Format

**PRIORITY REQUIREMENT**: ALL entities MUST return the EXACT SAME response structure when deletion is blocked due to associations. This is not a suggestion - it is a fundamental architectural requirement that enables:

1. **Single Frontend Error Handler**: One reusable error handling system across ALL entity types
2. **Predictable Developer Experience**: Developers can write deletion logic once and apply it everywhere
3. **Consistent User Experience**: Users see the same interface patterns regardless of entity type
4. **Maintainable Codebase**: Changes to deletion logic propagate consistently across the system

### Mandatory Response Structure for All Entities

**HTTP Status Code**: 422 (Unprocessable Entity) for ALL constraint violations

**Response Format** (MUST be identical for all entities):
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

**Key Fields (REQUIRED for all entities)**:
- `error`: Human-readable error message following pattern "Cannot delete {entity} due to associated data"
- `error_type`: Always "associations_exist" for constraint violations
- `entity_type`: The type of entity being deleted (campaign, character, vehicle, etc.)
- `entity_id`: UUID of the entity being deleted
- `constraints`: Object containing all blocking associations with counts and details
- `suggestions`: Array of actionable suggestions for resolving the constraint

**Implementation Requirement**: Any deviation from this structure breaks the unified frontend handler and violates the architectural requirement.

## Technical Requirements

### Entity Association Analysis
- **Complete Entity Audit**: Map all associations and dependencies between entities
  - Campaigns (has_many: characters, vehicles, fights, sites, parties, factions, junctures)
  - Characters (has_many: schticks, weapons; has_many: shots through fights)
  - Vehicles (has_many: weapons; has_many: shots through fights)
  - Fights (has_many: shots)
  - Weapons (belongs_to: character/vehicle)
  - Schticks (belongs_to: character)
  - Sites/Parties/Factions/Junctures (belongs_to: campaign)
  - Users (has_many: campaigns through memberships)

### Backend Implementation

#### Universal Deletion Framework
- **Base Service Class**: Create `EntityDeletionService` with common deletion patterns
- **Constraint Interface**: Define standard methods for checking associations
- **CRITICAL: Error Response Interface**: ALL services MUST use identical error response structure (see Unified Backend Response Format above)
- **Force Deletion Interface**: Consistent force parameter handling
- **Response Format Validation**: Services MUST validate their responses match the unified structure exactly

#### Entity-Specific Controllers and Services
- **All Controllers**: Enhance all `Api::V2::{Entity}Controller#destroy` methods
  - CampaignsController, CharactersController, VehiclesController
  - FightsController, WeaponsController, SchtickController  
  - SitesController, PartiesController, FactionsController, JuncturesController
  - UsersController
- **Service Layer**: Create deletion services for each entity type:
  - `CampaignDeletionService` - Handle all campaign associations
  - `CharacterDeletionService` - Handle schticks, weapons, active fights
  - `VehicleDeletionService` - Handle weapons, active fights
  - `FightDeletionService` - Handle shots, combat state validation
  - `WeaponDeletionService` - Handle character/vehicle ownership
  - `SchtickDeletionService` - Handle character ownership
  - `SiteDeletionService`, `PartyDeletionService`, `FactionDeletionService`, `JunctureDeletionService` - Handle campaign associations
  - `UserDeletionService` - Handle campaign memberships, owned data

#### Database and Performance Optimization
- **Efficient Constraint Queries**: Use count queries instead of loading full associations
- **Batch Constraint Checking**: Single query to check multiple association types
- **Index Optimization**: Ensure proper indexes on foreign keys for constraint checking
- **Transaction Management**: Atomic operations for cascade deletions

### Frontend Implementation

#### Universal Deletion Components
- **CRITICAL: Single Error Handler**: `useEntityDeletion` hook that works with ALL entity types due to unified response structure
- **Universal Confirmation Dialog**: `EntityDeletionDialog` component supporting all entity types using the same constraint format
- **Constraint Display Component**: `ConstraintDetails` for showing association information (works with all entities due to unified structure)
- **Force Deletion Interface**: `ForceDeletionConfirmation` with comprehensive impact disclosure
- **Response Format Dependency**: All frontend components depend on the unified backend response format - any backend deviation breaks the system

#### Entity-Specific UI Updates
- **All Entity Management Pages**: Update deletion interfaces across all entity types
  - Campaign management, Character sheets, Vehicle management
  - Fight management, Weapon/Schtick management
  - Site/Party/Faction/Juncture management, User management
- **Consistent UX Patterns**: Standardize deletion button placement, confirmation flows
- **Error Handling**: Update all entity deletion components to handle new error response structure
- **Loading States**: Add proper loading indicators during constraint checking for all entities
- **Action Options**: Provide entity-appropriate UI for resolving constraints

#### Integration Requirements
- **Toast Integration**: Use existing `ToastContext` and `useToast` hook for all entity types
- **API Client Updates**: Update `ApiV2` client to handle new error response structure for all endpoints
- **Loading States**: Consistent loading UI during constraint checking across all entity management pages

### UI/UX Specifications

#### Universal Interface Patterns
- **Consistent Error Messages**: Display specific constraint information for all entity types
  - Example: "Cannot delete Campaign: 5 characters, 3 fights, 2 sites exist"
  - Example: "Cannot delete Character: 3 weapons, 5 schticks, active in 1 fight"
  - Example: "Cannot delete Fight: 4 shots exist, combat is active"
- **Standardized Confirmation Dialogs**: Show warning for cascade deletion with comprehensive item lists
- **Progressive Disclosure**: Allow users to expand constraint details for any entity type
- **Consistent Call-to-Action**: Provide clear next steps when deletion is prevented for any entity

#### Entity-Specific Constraint Messaging
- **Campaigns**: "This campaign contains characters, fights, and world-building data"
- **Characters**: "This character has equipment and may be involved in active combat"
- **Vehicles**: "This vehicle has weapons and may be involved in active combat"
- **Fights**: "This fight contains character positions and combat data"
- **Users**: "This user owns campaigns and characters"

### Integration Requirements

#### Comprehensive System Integration
- **Toast System**: Integrate with existing `ToastContext` and `useToast` hook for all entity types
- **API Client**: Update `ApiV2` client to handle new error response structure for all endpoints
- **WebSocket Notifications**: Broadcast deletion events via existing Action Cable channels for all entities
- **Authorization System**: Integrate with existing permission system for all entity deletion operations
- **Audit Logging**: Log deletion attempts and outcomes for all entity types

### Performance Criteria

#### Universal Performance Standards
- **Response Time**: Constraint checking should complete within 2 seconds for entities with up to 1000 associated records
- **Database Optimization**: Use efficient queries with proper indexes to minimize constraint checking overhead across all entity types
- **Memory Usage**: Constraint validation should not load full associated records, only counts and essential details
- **Batch Processing**: For entities with many associations, batch constraint checks to minimize database round trips
- **Caching Strategy**: Cache constraint check results for frequently accessed entities during user sessions

#### Entity-Specific Performance Targets
- **Campaigns**: Handle up to 500 characters, 100 fights, 50 sites efficiently
- **Characters**: Handle up to 20 weapons, 30 schticks, participation in 10 fights
- **Vehicles**: Handle up to 15 weapons, participation in 10 fights
- **Fights**: Handle up to 20 shots (characters/vehicles in initiative order)
- **Users**: Handle membership in up to 50 campaigns with associated ownership

## Implementation Compliance Requirements

### Backend Compliance Checklist
- [ ] ALL entity deletion services return responses matching the exact unified format
- [ ] HTTP status code 422 used consistently for ALL constraint violations across ALL entities
- [ ] `error_type: "associations_exist"` field present in ALL constraint responses
- [ ] `constraints` object structure identical across ALL entities
- [ ] `suggestions` array present with actionable items for ALL entities
- [ ] Base service class validates response format compliance
- [ ] Controllers validate service responses match unified structure

### Frontend Integration Benefits
- **Single Error Handler**: `useEntityDeletion` hook handles ALL entity types identically
- **Reusable Components**: `EntityDeletionDialog` and `ConstraintDetails` work with any entity
- **Consistent UX**: Users see identical interfaces regardless of entity type being deleted
- **Maintainable Code**: Changes to deletion UI propagate across ALL entity management pages
- **Predictable Behavior**: Developers can write deletion logic once and apply it universally

### Critical Success Factor
The unified response format is not a nice-to-have feature - it is the foundational architectural decision that makes the entire system work. Any deviation from this format in ANY entity breaks the unified frontend handler and violates the core requirement.