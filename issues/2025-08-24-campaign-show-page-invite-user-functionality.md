# Campaign Show Page: Add Invite User Functionality

**Date:** 2025-08-24
**Priority:** Medium
**Category:** Frontend/UI

## Description

The campaigns Show page currently tries to fetch all users via `/api/v2/users` to populate a Users dropdown for adding users to campaigns. However, this endpoint requires admin privileges (`require_admin` filter), which prevents gamemaster users from accessing it. This results in a 403 Forbidden error and an empty dropdown.

The application already has a robust invitation system (`/api/v2/invitations`) that allows gamemasters to invite users to campaigns, but the frontend doesn't utilize this system on the campaign Show page.

## Current Behavior

- Campaign Show page attempts to fetch `/api/v2/users` 
- Request fails with 403 Forbidden for gamemaster users
- Users dropdown remains empty
- No way to add users to campaign from the UI

## Expected Behavior

- Campaign Show page should have an "Invite User" feature instead of trying to show all users
- Gamemaster users should be able to invite users by email address
- Invitation system should handle both existing users and new user registration
- UI should show pending invitations and their status

## Steps to Reproduce

1. Login as a gamemaster user (not admin)
2. Navigate to a campaign Show page
3. Observe 403 error in network tab when trying to load users
4. Note that no user invitation functionality is available

## Related Files

**Backend (Working):**
- `/app/controllers/api/v2/invitations_controller.rb` - Complete invitation system
- `/app/controllers/api/v2/users_controller.rb:3` - Admin requirement blocking gamemasters

**Frontend (Needs Update):**
- Campaign Show page component (location TBD)
- User selection/invitation UI components (location TBD)

## Investigation Notes

- Invitation system supports rate limiting (5 invitations per minute per user)
- Handles both existing users and new user registration flows
- Includes email validation and confirmation process
- Quick script available: `./create-invitation.sh [email]` for testing

## Proposed Solution

Replace the user dropdown approach with:

1. **Invite User Form:** Email input field with "Send Invitation" button
2. **Pending Invitations List:** Show outstanding invitations with resend/cancel options
3. **Campaign Members List:** Show current campaign members
4. **Proper Error Handling:** Toast notifications for success/failure states

## Screenshots

None - network error visible in browser developer tools showing 403 on `/api/v2/users` request.

## Security Considerations

- Current invitation system already has proper authorization (gamemaster-only)
- Rate limiting prevents abuse
- Email validation prevents invalid invitations
- More secure than showing full user list to non-admin users