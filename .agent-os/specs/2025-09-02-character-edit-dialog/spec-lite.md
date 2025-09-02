# Character Edit Dialog - Spec Lite

> Created: 2025-09-02
> Feature: Quick character stat editing in encounters

## Summary

Add edit button to character cards in encounters that opens a compact dialog for editing combat-critical stats (shot, wounds, impairments, marks of death, name).

## Key Requirements

- Edit button on each character in encounters view
- Compact dialog with form fields for combat stats
- Handle PC vs non-PC impairment storage differences
- Real-time updates via WebSocket
- Optimistic updates with error rollback

## Technical Components

- Frontend: CharacterEditDialog component with MUI Dialog
- API: Character V2 update endpoint and Shot V1 update endpoint  
- Backend: Enhanced controllers with WebSocket broadcasting
- Forms: NumberField components with validation

## Acceptance

- [ ] Edit button visible on character cards
- [ ] Dialog opens with pre-populated values
- [ ] All fields save correctly based on character type
- [ ] Real-time updates broadcast to all clients
- [ ] Error handling with user feedback