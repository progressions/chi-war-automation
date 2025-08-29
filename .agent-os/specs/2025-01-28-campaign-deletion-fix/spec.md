# Spec Requirements Document

> Spec: Comprehensive Entity Deletion System
> Created: 2025-01-28
> Updated: 2025-01-28 (Expanded scope to all entities)

## Overview

Implement a comprehensive deletion system that properly handles all entities with associations, replacing the current inconsistent deletion behavior and 400 Bad Request errors with clear user feedback and appropriate deletion policies. This system will provide transparent information about deletion constraints across all entity types and offer consistent options for managing associated data.

The scope includes all core entities: Campaigns, Characters, Vehicles, Fights, Weapons, Schticks, Sites, Parties, Factions, Junctures, and Users.

## User Stories

### Entity Management Across All Types

As a user (gamemaster or player), I want to delete entities (campaigns, characters, vehicles, fights, etc.) that are no longer needed, so that I can keep my data organized and remove outdated content.

**Detailed Workflow:**
When a user attempts to delete any entity, the system should:
1. Check for associated data and relationships
2. Either allow cascade deletion with clear warning about what will be removed
3. Or prevent deletion with clear explanation of existing dependencies and suggest next steps
4. Provide consistent behavior across all entity types

**Entity-Specific Scenarios:**
- **Campaigns**: Check for characters, vehicles, fights, sites, parties, factions, junctures
- **Characters**: Check for schticks, weapons, shots in active fights
- **Vehicles**: Check for weapons, shots in active fights  
- **Fights**: Check for shots and active combat status
- **Weapons**: Check for character/vehicle ownership
- **Sites/Parties/Factions/Junctures**: Check for campaign associations
- **Users**: Check for campaign memberships and owned data

### Clear Error Messaging and Constraint Handling

As a user, I want to understand why any entity cannot be deleted, so that I can take appropriate action to resolve the issue.

**Detailed Workflow:**
When deletion is prevented due to associated data, the system should display:
1. Specific information about what data exists (e.g., "Character has 3 weapons, 5 schticks")
2. Clear options for resolving the constraint (reassign ownership, delete dependencies)
3. Actionable next steps instead of generic error messages
4. Consistent error format across all entity types

### Force Deletion with Full Disclosure

As an authorized user, I want the option to force delete entities with all their associations when appropriate, so that I can clean up complex data structures when needed.

**Detailed Workflow:**
When using force deletion:
1. System displays comprehensive list of all items that will be deleted
2. User must explicitly confirm understanding of cascading effects
3. Deletion proceeds with full cascade, removing all associated data
4. Success message details exactly what was removed

## Spec Scope

### Comprehensive Entity Audit and Analysis
1. **Association Mapping** - Complete audit of all entity relationships and dependencies
2. **Current Deletion Behavior Analysis** - Document existing deletion patterns and identify inconsistencies
3. **Constraint Identification** - Map all foreign key relationships and business logic constraints

### Backend API Enhancement (All Entity Types)
1. **Universal Deletion Service** - Create `EntityDeletionService` framework for consistent behavior
2. **All DELETE Endpoints** - Enhance all `/api/v2/{entity}/:id` endpoints to handle associations properly
3. **Entity-Specific Services** - Implement deletion services for each entity type:
   - `CampaignDeletionService` - Handle campaigns with all associations
   - `CharacterDeletionService` - Handle characters with schticks, weapons, shots
   - `VehicleDeletionService` - Handle vehicles with weapons, shots
   - `FightDeletionService` - Handle fights with shots and active combat
   - `WeaponDeletionService` - Handle weapons with ownership constraints
   - `UserDeletionService` - Handle users with campaign memberships
4. **Force Parameter Implementation** - Consistent `force` parameter across all deletion endpoints

### Error Response Structure (Standardized)
1. **Universal Error Format** - Implement consistent error response structure across all entities
2. **Constraint Details** - Include specific association counts and details for each entity type
3. **Actionable Suggestions** - Provide entity-appropriate resolution suggestions
4. **Progressive Disclosure** - Support detailed vs summary constraint information

### Frontend Enhancement (All Entity Types)  
1. **Universal Deletion Components** - Create reusable deletion confirmation and error handling components
2. **Entity-Specific UI** - Update all entity deletion interfaces to use new system
3. **Consistent User Experience** - Standardize deletion flows across all entity management pages
4. **Force Deletion UI** - Implement force deletion confirmation dialogs with full impact disclosure

### Deletion Policy Framework
1. **Entity Deletion Rules** - Define clear rules for each entity type's deletion constraints
2. **Authorization Policies** - Specify who can delete what entities under which circumstances
3. **Business Logic Integration** - Ensure deletion policies align with game mechanics and user roles
4. **Force Deletion Policies** - Define when and how force deletion is available for each entity type

### User Feedback System Enhancement
1. **Toast Integration** - Integrate with existing toast notification system for all entity types
2. **Progress Indicators** - Add loading states for constraint checking across all entities
3. **Success/Error Messaging** - Standardize success and error messages for all deletion operations
4. **Help Documentation** - Provide contextual help for understanding deletion constraints

## Out of Scope

- Bulk operations for multiple entities
- Archiving functionality (alternative to deletion) for any entity type
- Data export before deletion
- Undo functionality for deleted entities
- Administrative override capabilities beyond force deletion
- Migration of existing data to fix historical constraint issues
- Performance optimization for extremely large datasets (>10,000 associations)
- Audit trail system for tracking deletions (beyond basic logging)

## Expected Deliverable

### Phase 1: Entity Association Audit
1. **Complete Entity Relationship Map** - Document all associations between entities
2. **Current Deletion Behavior Analysis** - Identify existing deletion patterns and issues
3. **Constraint Matrix** - Map all foreign key and business logic constraints

### Phase 2: Backend Implementation
1. **Universal Deletion Framework** - `EntityDeletionService` base class with consistent patterns
2. **All Entity Deletion Services** - Complete implementation for all entity types
3. **Enhanced DELETE Endpoints** - All `/api/v2/{entity}/:id` endpoints handle associations properly
4. **Standardized Error Responses** - Consistent constraint error format across all entities
5. **Force Parameter Support** - `force` parameter available and working for appropriate entity types

### Phase 3: Frontend Implementation
1. **Universal Deletion Components** - Reusable confirmation dialogs and error handling
2. **Updated Entity Management UI** - All entity management pages use new deletion system
3. **Consistent User Experience** - Standardized deletion flows with proper constraint messaging
4. **Force Deletion Interface** - Clear UI for force deletion with full impact disclosure

### Phase 4: System Integration
1. **Toast Notification Integration** - All deletion operations provide clear user feedback
2. **Authorization Integration** - Deletion permissions properly enforced across all entity types
3. **WebSocket Integration** - Real-time updates for deletion events across all entities
4. **Documentation** - Updated API documentation and user guides for new deletion system

### Success Criteria
1. **No 400 Bad Request errors** - All deletion attempts return appropriate responses (200, 422, 403, 404)
2. **Consistent behavior** - All entity types follow same deletion pattern and error handling
3. **Clear user feedback** - Users always understand why deletion failed and what actions they can take
4. **Proper force deletion** - Force parameter works consistently with full disclosure of consequences
5. **Maintained data integrity** - No orphaned records or broken associations after any deletion operation