# Issue: Add User Profile Page for Account Management

**Date**: 2025-08-18  
**Priority**: Medium  
**Category**: Frontend/UX  
**Status**: ✅ COMPLETED

## Description

Users need a dedicated profile page where they can view and manage their account information, including their personal details and campaign memberships. This would provide better self-service account management and improve the overall user experience.

## Steps to Reproduce

1. Log in as any user
2. Look for profile/account management options in the navigation
3. Try to update personal information like name or email
4. Try to view campaigns the user belongs to

## Expected Behavior

Users should have access to a profile page that allows them to:

1. **View Profile Information**:
   - Display current name, email address
   - Show account creation date and last login
   - Display user role (gamemaster, player)

2. **Edit Personal Information**:
   - Update display name
   - Change email address (with confirmation)
   - Update password (separate secure form)

3. **Campaign Management**:
   - View all campaigns they belong to (as member or gamemaster)
   - See their role in each campaign (gamemaster vs player)
   - Display campaign status (active/inactive)
   - Quick navigation to campaigns they participate in

4. **Account Settings**:
   - Notification preferences
   - Display preferences
   - Account security options

## Actual Behavior

Currently, users have limited options for managing their account information. There may be no centralized profile page or the functionality may be scattered across different parts of the application.

## Related Files

**Backend Implementation:**
- `shot-server/app/controllers/api/v2/users_controller.rb` - User management endpoints
- `shot-server/app/models/user.rb` - User model with profile fields
- `shot-server/app/serializers/user_serializer.rb` - User data serialization
- `shot-server/app/models/campaign.rb` - Campaign relationship data

**Frontend Implementation:**
- `shot-client-next/src/app/(main)/profile/page.tsx` - New profile page (to create)
- `shot-client-next/src/components/users/ProfileForm.tsx` - Profile editing form (to create)
- `shot-client-next/src/components/users/CampaignMemberships.tsx` - Campaign list component (to create)
- `shot-client-next/src/components/ui/navbar/MainMenu.tsx` - Add profile menu item
- `shot-client-next/src/lib/client/userClient.ts` - User update API methods

## Screenshots/Evidence

- Current navigation lacks clear profile/account access
- User settings functionality needs consolidation
- Campaign membership visibility could be improved

## Investigation Notes

This feature would enhance user autonomy and reduce support requests for account changes. It's particularly valuable for:
- Users who want to update their information without admin help
- Players who participate in multiple campaigns and want to see all memberships
- Gamemasters who want to manage their personal info separate from campaign management
- New users who want to complete their profile setup

## Potential Solution

### Phase 1: Basic Profile Page
1. **Create profile route** (`/profile`) with basic user information display
2. **Add profile form** with name and email editing capabilities
3. **Add navigation link** to profile page in main menu
4. **Implement backend endpoints** for profile updates

### Phase 2: Campaign Memberships
1. **Display campaigns list** showing all campaigns user belongs to
2. **Show user role** in each campaign (gamemaster/player)
3. **Add quick navigation** to campaign pages from profile
4. **Campaign status indicators** (active/inactive)

### Phase 3: Advanced Features
1. **Password change** functionality with current password verification
2. **Email confirmation** flow for email address changes
3. **Account preferences** and notification settings
4. **Profile picture/avatar** upload capability

## Acceptance Criteria

- [x] User can access profile page from main navigation
- [x] User can view their current name, email, and account info
- [x] User can edit and save changes to their name
- [x] User can update their email address with proper validation
- [x] User can see all campaigns they belong to with their role in each
- [x] Profile updates are reflected immediately in the application
- [x] Form validation prevents invalid data submission
- [x] Success/error feedback is provided for all actions
- [x] Profile page is responsive and works on mobile devices

## Technical Requirements

**Backend APIs needed:**
- `GET /api/v2/users/profile` - Get current user profile
- `PATCH /api/v2/users/profile` - Update user profile
- `GET /api/v2/users/campaigns` - Get user's campaign memberships

**Frontend Components:**
- Profile page layout with sections for different information types
- Editable form fields with proper validation
- Campaign membership list with role indicators
- Navigation integration

## Impact

- **User Experience**: Provides self-service account management
- **Support Reduction**: Fewer requests for profile changes
- **User Engagement**: Better understanding of campaign participation
- **Account Security**: Centralized place for security-related settings

## Related Issues

- May connect to user onboarding improvements
- Related to campaign management enhancements
- Could integrate with notification system if implemented

## Priority Justification

Medium priority as it improves user experience and reduces administrative overhead, but doesn't block core functionality. Good candidate for post-core-features development.