# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-02-character-edit-dialog/spec.md

> Created: 2025-09-02
> Version: 1.0.0

## Technical Requirements

### Frontend Implementation

- **Component Integration**: Add edit button to `CharacterDetail.tsx` component in encounters view
- **Dialog Component**: Create `CharacterEditDialog.tsx` with MUI Dialog and form fields
- **Form Fields**: TextField for name, NumberField components for shot, wounds, impairments, marks of death
- **State Management**: Local React state with optimistic updates and error rollback
- **Validation**: Client-side validation for numeric ranges (wounds ≥ 0, marks of death 0-5, etc.)
- **Icon Integration**: MdEdit icon from react-icons for edit button

### Backend Implementation

- **Character Updates**: Use existing `PATCH /api/v2/characters/:id` endpoint
- **Shot Updates**: Use existing actor endpoints or create custom shot update endpoint
- **Data Validation**: 
  - Marks of Death: 0-5 range validation
  - Impairments: 0-10 range validation  
  - Wounds: Non-negative integer validation
- **WebSocket Broadcasting**: Trigger `broadcast_encounter_update!` after any update
- **Character Type Logic**: Handle PC vs non-PC impairment storage routing

### Data Structure Handling

- **Character Model**: Update `name`, `action_values.Wounds`, `action_values["Marks of Death"]`
- **PC Impairments**: Store on character model `impairments` field
- **Non-PC Impairments**: Store on shot association `impairments` field
- **Shot Position**: Update `shot` number on shot association record

### API Integration

- **Character API Payload**:
```json
{
  "character": {
    "name": "string",
    "impairments": 0,
    "action_values": {
      "Wounds": 0,
      "Marks of Death": 0
    }
  }
}
```

- **Shot API Payload**:
```json
{
  "character": {
    "shot_id": "uuid",
    "current_shot": 15,
    "impairments": 0
  }
}
```

### UI/UX Specifications

- **Edit Button**: Small pencil icon, positioned with existing action buttons
- **Dialog Size**: Compact (maxWidth="sm") for quick editing
- **Form Layout**: Vertical stack with logical grouping (name, then combat stats)
- **Button Actions**: Save/Cancel buttons, ESC key support, click-outside to close
- **Loading States**: Disable form during save operation with loading indicators

### Performance Criteria

- **Response Time**: Dialog save operations complete within 2 seconds
- **Optimistic Updates**: UI updates immediately, rollback on error
- **WebSocket Efficiency**: Minimal broadcast payload with targeted updates
- **Form Validation**: Real-time client validation to prevent unnecessary API calls

## Approach

The implementation leverages existing patterns:
- Reuse NumberField components from other forms
- Follow existing dialog patterns used in other edit components
- Utilize established WebSocket broadcasting infrastructure
- Maintain consistency with current toast notification system

## External Dependencies

- Material-UI Dialog, TextField, Button components
- React Icons (MdEdit)
- Existing NumberField component
- Toast notification system (useToast hook)
- WebSocket connection via EncounterContext
- API client methods (ApiV2.ts)