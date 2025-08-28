# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-28-entity-active-toggle/spec.md

## Technical Requirements

**Note:** This is a frontend-only implementation. No backend changes are required as all necessary API endpoints already exist and support updating the active field.

## Frontend Implementation

### Component Architecture
- Create reusable `EntityActiveToggle` component in `shot-client-next/src/components/common/`
- Component accepts props: `entityType`, `entityId`, `currentActive`, `onToggle`
- Implement permission checking using user context (isAdmin, isGamemaster)
- Use Material-UI Switch component with "Active" label showing on/off state

### Permission Logic
- Check `user.admin === true` for admin permission
- Check `campaign.gamemaster_id === user.id` for gamemaster permission
- Hide component entirely if neither condition is met
- Permissions evaluated client-side and validated server-side

### State Management
- Use `handleChangeAndSave` function from useEntity hook for the change handler
- Implement optimistic updates with automatic rollback on error
- Show toastSuccess on successful update
- Show toastError and revert toggle on failure
- No confirmation dialog needed - immediate action

### Integration Points
- Import and use in all entity Show components:
  - `src/components/Characters/Show.tsx`
  - `src/components/Campaigns/Show.tsx`
  - `src/components/Sites/Show.tsx`
  - `src/components/Parties/Show.tsx`
  - `src/components/Fights/Show.tsx`
  - `src/components/Vehicles/Show.tsx`
  - `src/components/Weapons/Show.tsx`
  - `src/components/Schticks/Show.tsx`

### API Integration
- Use existing PATCH endpoints for each entity type
- Send `{ active: boolean }` in request body
- Handle 401/403 for unauthorized attempts
- Use ApiV2 client methods for all requests

### UI/UX Specifications
- Position toggle near the entity Name (iterate on exact placement)
- Switch component with "Active" label
- Clear on/off visual states
- No confirmation dialog - immediate action on toggle
- Disabled appearance during API call
- Success: toastSuccess with appropriate message
- Error: toastError with message and revert toggle to previous state
- Visual indicator for inactive status on Show page (iterate on design)
- Existing List filters will handle hiding inactive entities (no changes needed)

### Performance Criteria
- Toggle response time < 200ms for optimistic update
- API response handling < 2 seconds
- No page reload required
- No impact on initial page load time