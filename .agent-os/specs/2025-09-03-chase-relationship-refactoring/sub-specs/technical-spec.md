# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-03-chase-relationship-refactoring/spec.md

## Technical Requirements

- Create ChaseRelationship model as a join table between vehicles
- Each relationship tracks: pursuer_id, evader_id, fight_id, position (near/far), active status
- Remove Position field from Vehicle model's action_values JSONB
- Keep all other Vehicle fields unchanged (Chase Points, Pursuer, etc.)
- Add database indexes for efficient querying
- Update chase actions to use relationship for position changes
- Modify UI to show and select relationships when taking chase actions