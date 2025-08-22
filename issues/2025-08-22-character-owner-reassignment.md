# Issue: Allow Administrators and Gamemasters to Reassign Character Ownership

**Date**: 2025-08-22  
**Priority**: High  
**Category**: Backend/Frontend  
**Status**: Completed

## Description

Currently, the character owner is displayed as read-only on the Character Show page. Administrators and campaign gamemasters need the ability to reassign character ownership to different users. This is essential for managing campaigns when players leave, new players join, or when characters need to be transferred between users.

## Current State

- Characters have a `belongs_to :user` relationship in the Rails model
- The owner is displayed on `characters/Show.tsx` but is not editable
- No interface exists to change character ownership
- The audit report identified owner as intentionally read-only for security

## Requirements

### Backend Requirements

1. **API Endpoint**: Update the characters controller to accept `user_id` parameter
2. **Authorization**: Only allow changes by:
   - System administrators (admin role)
   - Campaign gamemaster (owner of the campaign)
3. **Validation**: Ensure the new owner exists and is a member of the campaign

### Frontend Requirements

1. **Edit Component**: Create an owner reassignment component using the UserFilter pattern
2. **Display Logic**: Show edit capability only to authorized users
3. **User Selection**: Implement user search/filter to find and select new owner
4. **Confirmation**: Add confirmation dialog for ownership transfer
5. **Feedback**: Show success/error messages after reassignment

## Implementation Details

### Backend Changes

**File**: `shot-server/app/controllers/api/v2/characters_controller.rb`
- Add `:user_id` to permitted parameters
- Add authorization check for owner reassignment
- Validate new owner is campaign member

**File**: `shot-server/app/models/character.rb`
- Add validation to ensure user exists
- Add method to check if user can be assigned as owner

### Frontend Changes

**File**: `shot-client-next/src/components/characters/Show.tsx`
- Replace read-only owner display with conditional edit component
- Add `EditOwner` or `OwnerSelector` component
- Show edit UI only for admin/gamemaster users

**New Component**: `shot-client-next/src/components/characters/EditOwner.tsx`
- Use UserFilter pattern for user selection
- Filter to show only campaign members
- Include search functionality
- Handle API calls for ownership update

## User Stories

1. **As a gamemaster**, I want to reassign character ownership when a player leaves the campaign, so the character can be given to a new player.

2. **As an administrator**, I want to change character ownership across any campaign to help resolve user issues and manage the system.

3. **As a player**, I should not be able to change character ownership, even for my own characters, to maintain security.

## Acceptance Criteria

- [ ] Gamemasters can reassign ownership of any character in their campaigns
- [ ] Administrators can reassign ownership of any character system-wide
- [ ] Regular users cannot change character ownership
- [ ] Owner selector shows only users who are members of the campaign
- [ ] Owner selector includes search/filter functionality
- [ ] Ownership changes are logged for audit purposes
- [ ] UI provides clear feedback on successful/failed ownership changes
- [ ] Original owner is notified when their character is reassigned (optional)

## Technical Considerations

### Security
- Ensure proper authorization checks at API level
- Prevent users from reassigning their own characters to others
- Log ownership changes for audit trail

### Performance
- Use efficient user filtering for large campaigns
- Consider pagination for user lists in large systems

### UX Patterns
- Follow existing UserFilter pattern used elsewhere in the application
- Maintain consistency with other editing components
- Consider using autocomplete for user selection

## Testing Requirements

### Backend Tests
- Test authorization for different user roles
- Test validation of new owner as campaign member
- Test rejection of invalid user assignments
- Test audit logging of ownership changes

### Frontend Tests
- Test visibility of edit UI for different user roles
- Test user selection and filtering
- Test error handling for failed assignments
- Test UI feedback for successful changes

### E2E Tests
- Test complete flow of ownership reassignment
- Test authorization boundaries
- Test edge cases (user not in campaign, non-existent user)

## Related Files

- `shot-client-next/src/components/characters/Show.tsx` - Character display page
- `shot-server/app/controllers/api/v2/characters_controller.rb` - Character API
- `shot-server/app/models/character.rb` - Character model
- `shot-client-next/src/components/filters/UserFilter.tsx` - Existing pattern reference

## Priority Justification

This is marked as **High Priority** because:
1. Campaign management requires this functionality for player transitions
2. Currently no workaround exists in the UI
3. Affects core gameplay when players leave/join campaigns
4. Administrative need for system management

## Implementation Estimate

- Backend API changes: 2-3 hours
- Frontend component development: 3-4 hours
- Testing: 2-3 hours
- **Total: 7-10 hours**

## Notes

- Consider extending this pattern to Vehicle ownership as well
- Could be part of a larger "Campaign Management Tools" feature set
- May want to add bulk ownership transfer for multiple characters