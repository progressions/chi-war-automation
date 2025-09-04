# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-03-chase-relationship-refactoring/spec.md

## Endpoints

### GET /api/v2/chase_relationships
List all relationships for a fight or vehicle

### GET /api/v2/chase_relationships/:id
Show a specific relationship

### POST /api/v2/chase_relationships
Create a new relationship between two vehicles

### PATCH /api/v2/chase_relationships/:id
Update relationship position or active status

### DELETE /api/v2/chase_relationships/:id
Soft delete a relationship

### POST /api/v2/encounters/:id/apply_chase_action
Modified to accept relationship_id and update position based on that relationship

## Key Changes

- Chase actions now require selecting a relationship_id
- Position changes only affect the selected relationship
- Chase Points continue to work exactly as before (on Vehicle model)
- All other chase mechanics remain unchanged