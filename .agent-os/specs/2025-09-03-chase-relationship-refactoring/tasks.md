# Spec Tasks

## Tasks

- [ ] 1. Backend: Create ChaseRelationship model and migration
  - [ ] 1.1 Write tests for ChaseRelationship model
  - [ ] 1.2 Create migration to add chase_relationships table
  - [ ] 1.3 Implement ChaseRelationship model with validations
  - [ ] 1.4 Create migration to remove Position from Vehicle action_values
  - [ ] 1.5 Verify all model tests pass

- [ ] 2. Backend: Implement ChaseRelationship API endpoints
  - [ ] 2.1 Write controller tests for chase_relationships endpoints
  - [ ] 2.2 Create ChaseRelationshipsController with CRUD actions
  - [ ] 2.3 Create ChaseRelationshipSerializer
  - [ ] 2.4 Add routes for chase_relationships resource
  - [ ] 2.5 Verify all controller tests pass

- [ ] 3. Backend: Update chase action logic
  - [ ] 3.1 Write tests for updated ChaseActionService
  - [ ] 3.2 Modify apply_chase_action to use relationship_id
  - [ ] 3.3 Update EncounterSerializer to include chase_relationships
  - [ ] 3.4 Verify all service tests pass

- [ ] 4. Frontend: Add ChaseRelationship support
  - [ ] 4.1 Create TypeScript interfaces for ChaseRelationship
  - [ ] 4.2 Update API client to handle chase_relationships endpoints
  - [ ] 4.3 Create ChaseRelationshipService
  - [ ] 4.4 Update vehicle types to remove Position field

- [ ] 5. Frontend: Update chase UI components
  - [ ] 5.1 Create RelationshipSelector component
  - [ ] 5.2 Update ChasePanel to display relationships
  - [ ] 5.3 Modify chase action forms to use selected relationship
  - [ ] 5.4 Test multi-vehicle chase scenarios in UI
  - [ ] 5.5 Verify position changes work correctly per relationship