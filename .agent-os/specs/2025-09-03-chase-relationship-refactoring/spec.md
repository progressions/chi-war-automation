# Spec Requirements Document

> Spec: Chase Position Relationships
> Created: 2025-09-03

## Overview

Move the Position field from Vehicle models to a ChaseRelationship join table that tracks the positional relationship (near/far) between any two vehicles in a chase. This enables multi-vehicle chase scenarios where one vehicle can have different positions relative to multiple other vehicles.

## User Stories

### Multi-Vehicle Positioning

As a gamemaster, I want vehicles to have different positions relative to each other in a multi-vehicle chase, so that complex chase scenarios work correctly.

In a chase with three vehicles, a player's truck might be "near" to the motorcycle pursuing it while simultaneously being "far" from the police car also in pursuit. The ChaseRelationship table tracks these independent positions, replacing the single Position field previously stored on each Vehicle.

### Position Selection

As a player, I want to see and act on my position relative to specific vehicles, so that I can make tactical decisions in multi-vehicle chases.

When taking a chase action, players select which relationship they're acting on. The UI shows all active relationships for their vehicle, clearly indicating their position relative to each other vehicle. Actions that change position only affect the selected relationship.

## Spec Scope

1. **ChaseRelationship Model** - Create a join table tracking pursuer_id, evader_id, fight_id, position (near/far), and active status
2. **Database Migration** - Remove Position field from Vehicle model and create chase_relationships table
3. **API Endpoints** - Basic CRUD for chase relationships
4. **UI Updates** - Display relationships and allow selection when taking chase actions

## Out of Scope

- Changes to Chase Points (remains on Vehicle)
- Changes to Pursuer field (remains on Vehicle)
- Changes to chase mechanics or rules
- Any other vehicle fields or chase logic

## Expected Deliverable

1. Working multi-vehicle chases where each vehicle pair maintains independent position
2. UI for selecting which relationship to act upon during chase actions
3. Clean migration removing Position from Vehicle and adding chase_relationships table