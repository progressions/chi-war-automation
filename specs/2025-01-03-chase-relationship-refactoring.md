# Chase Relationship Model Refactoring Specification

**Date**: 2025-01-03
**Author**: Isaac Priestley
**Status**: In Development
**Priority**: High

## Executive Summary

Refactor the vehicle chase system from storing position and chase_points directly on Vehicle models to using a ChaseRelationship join table that models the relationship between any two vehicles in a chase. This architectural change enables proper multi-vehicle chase scenarios where one vehicle can have different positions and chase point totals relative to multiple other vehicles simultaneously.

## Problem Statement

### Current Limitations
The existing chase system stores chase state directly on Vehicle models:
- Single `position` field (near/far) per vehicle
- Single `chase_points` counter per vehicle  
- Single `pursuer` boolean per vehicle

This breaks down in multi-vehicle scenarios:
- **Example**: A player's Pickup truck being chased by both a Motorcycle and a Semi cannot have different positions relative to each pursuer
- **Impact**: Limited to simple two-vehicle chases, preventing complex chase scenarios that are core to Feng Shui 2 gameplay

### Technical Debt
- Position is meaningless without context of which other vehicle it's relative to
- Chase points should accumulate per relationship, not per vehicle
- Current model forces UI workarounds and assumptions about vehicle relationships

## Solution Design

### Core Concept: ChaseRelationship Entity

Create a join table that models the relationship between any two vehicles in a chase:

```ruby
class ChaseRelationship < ApplicationRecord
  belongs_to :pursuer, class_name: 'Vehicle', foreign_key: 'pursuer_id'
  belongs_to :evader, class_name: 'Vehicle', foreign_key: 'evader_id'
  belongs_to :fight
  
  # position: string - 'near' or 'far'
  # chase_points: integer - 0 to 35/50
  # active: boolean - whether this relationship is currently active
end
```

### Benefits
1. **Multiple Simultaneous Relationships**: Each vehicle pair has independent state
2. **Accurate Position Tracking**: Position is relative to specific vehicles
3. **Independent Progress**: Chase points accumulate per relationship
4. **Clean Data Model**: Chase state lives where it belongs - in relationships

## Technical Specifications

### Database Schema

#### New Table: chase_relationships
```sql
CREATE TABLE chase_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuer_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  evader_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fight_id uuid NOT NULL REFERENCES fights(id) ON DELETE CASCADE,
  position varchar NOT NULL DEFAULT 'far' CHECK (position IN ('near', 'far')),
  chase_points integer NOT NULL DEFAULT 0 CHECK (chase_points >= 0),
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  
  UNIQUE(pursuer_id, evader_id, fight_id) WHERE active = true
);

CREATE INDEX idx_chase_relationships_fight ON chase_relationships(fight_id);
CREATE INDEX idx_chase_relationships_pursuer ON chase_relationships(pursuer_id);
CREATE INDEX idx_chase_relationships_evader ON chase_relationships(evader_id);
```

#### Modify Table: vehicles
Remove the following from action_values JSONB:
- "Position"
- "Chase Points"  
- "Pursuer"

Keep:
- "Condition Points" (vehicle damage, not relationship-specific)

### API Changes

#### New Endpoints
```
GET    /api/v2/chase_relationships          # List all relationships
GET    /api/v2/chase_relationships/:id      # Show specific relationship
POST   /api/v2/chase_relationships          # Create new relationship
PATCH  /api/v2/chase_relationships/:id      # Update relationship
DELETE /api/v2/chase_relationships/:id      # Remove relationship

POST   /api/v2/encounters/:id/apply_chase_action
  # Modified to accept relationship_id instead of vehicle_ids
```

#### Modified Responses
EncounterSerializer will include:
```json
{
  "encounter": {
    "id": "...",
    "shots": [...],
    "vehicles": [...],
    "chase_relationships": [
      {
        "id": "abc-123",
        "pursuer_id": "vehicle-1",
        "evader_id": "vehicle-2",
        "position": "near",
        "chase_points": 15,
        "active": true,
        "pursuer": { /* vehicle object */ },
        "evader": { /* vehicle object */ }
      }
    ]
  }
}
```

### Frontend Changes

#### TypeScript Interfaces
```typescript
interface ChaseRelationship {
  id: string
  pursuer_id: string
  evader_id: string
  fight_id: string
  position: 'near' | 'far'
  chase_points: number
  active: boolean
  pursuer?: Vehicle
  evader?: Vehicle
}

interface ChaseFormData {
  relationship_id?: string  // Selected relationship
  relationship?: ChaseRelationship
  // ... rest of form data
}
```

#### UI Flow Changes
1. **Relationship Selection**: User selects which chase relationship to act on
2. **Position Display**: Shows position specific to selected relationship
3. **Chase Points**: Displays points for that specific relationship
4. **Action Resolution**: Updates only the selected relationship

## Implementation Plan

### Phase 1: Backend Foundation (Week 1)
- [ ] Create migration for chase_relationships table
- [ ] Implement ChaseRelationship model with validations
- [ ] Update Vehicle model to remove chase state
- [ ] Write comprehensive model tests

### Phase 2: API Layer (Week 1-2)  
- [ ] Create ChaseRelationshipsController
- [ ] Update ChaseActionService for relationships
- [ ] Modify EncounterSerializer
- [ ] Add routes and controller tests

### Phase 3: Frontend Services (Week 2)
- [ ] Update TypeScript definitions
- [ ] Refactor ChaseReducerService
- [ ] Create ChaseRelationshipService
- [ ] Update VehicleService

### Phase 4: UI Components (Week 2-3)
- [ ] Create RelationshipSelector component
- [ ] Update ChasePanel for relationships
- [ ] Modify ChaseAttackerSection
- [ ] Modify ChaseTargetSection
- [ ] Update ChaseResolution

### Phase 5: Integration & Testing (Week 3)
- [ ] API client integration
- [ ] WebSocket updates for relationships
- [ ] End-to-end testing
- [ ] Performance validation

## User Stories

### Story 1: Multi-Vehicle Pursuit
**As a** gamemaster  
**I want to** set up a chase where multiple vehicles pursue one evader  
**So that** I can create exciting multi-party chase scenes

**Acceptance Criteria:**
- GM can create multiple chase relationships with same evader
- Each pursuer has independent position (near/far) to evader
- Chase points accumulate separately per pursuer
- UI clearly shows all active relationships

### Story 2: Chain Pursuit
**As a** player  
**I want to** pursue one vehicle while being pursued by another  
**So that** I can be in the middle of a chase chain

**Acceptance Criteria:**
- Vehicle can be both pursuer and evader in different relationships
- UI shows both "pursuing" and "evading" relationships
- Player can choose which relationship to act on
- Position and points tracked independently

### Story 3: Selective Chase Actions
**As a** player in a multi-vehicle chase  
**I want to** choose which specific vehicle I'm taking action against  
**So that** my tactical choices affect the right relationship

**Acceptance Criteria:**
- Chase panel shows all my vehicle's active relationships
- I can select which relationship to resolve
- Action outcome only affects selected relationship
- Other relationships remain unchanged

## Success Metrics

1. **Functionality**: Support 3+ vehicle chase scenarios without errors
2. **Performance**: Relationship queries complete in <100ms
3. **Usability**: Clear UI for managing multiple relationships
4. **Data Integrity**: No orphaned relationships after vehicle/fight deletion

## Risk Analysis

### Technical Risks
- **Migration Complexity**: Removing existing chase data cleanly
- **Performance**: N+1 query issues with multiple relationships
- **State Management**: Keeping frontend in sync with relationship changes

### Mitigation Strategies
- Clean break with no backward compatibility (approved approach)
- Eager loading and query optimization
- Comprehensive WebSocket broadcasting for updates

## Testing Strategy

### Unit Tests
- ChaseRelationship model validations and methods
- Service layer relationship logic
- Frontend service relationship calculations

### Integration Tests
- API endpoints for CRUD operations
- WebSocket broadcasting of changes
- Chase action resolution with relationships

### E2E Tests
- Multi-vehicle chase setup and resolution
- Relationship state persistence across sessions
- Victory condition checking (35/50 points)

## Rollback Plan

Since this is a clean break:
1. Keep database backup before migration
2. Git branch for easy reversion
3. No production deployment until fully tested

## Documentation Updates

- Update API documentation for new endpoints
- Create user guide for multi-vehicle chases
- Developer documentation for relationship model

## Dependencies

- Rails 8.0+ for model and API
- PostgreSQL UUID support
- Next.js 15+ for frontend
- TypeScript 5+ for type safety

## Timeline

**Total Duration**: 3 weeks

- Week 1: Backend implementation
- Week 2: Frontend implementation  
- Week 3: Integration, testing, and polish

## Appendix

### Sample Chase Scenario

**Setup**: Highway chase with three vehicles
- Motorcycle (Player) pursuing Van (NPC)
- Police Car (NPC) pursuing Motorcycle

**Relationships**:
1. Motorcycle → Van (position: far, chase_points: 10)
2. Police Car → Motorcycle (position: near, chase_points: 20)

**Turn Resolution**:
- Motorcycle acts: Narrows gap with Van (Relationship 1)
- Van acts: Maintains distance from Motorcycle (Relationship 1)  
- Police Car acts: Ram/sideswipe Motorcycle (Relationship 2)

Each action only affects its specific relationship, maintaining independent chase states.