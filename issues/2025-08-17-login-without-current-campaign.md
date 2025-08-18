# Issue: Login without a current campaign should be graceful

**Date**: 2025-08-17  
**Priority**: High  
**Category**: Backend/Frontend  
**Status**: ✅ RESOLVED

## Description
Users who login without having a current campaign set should have a graceful experience rather than encountering errors or crashes. The application should handle this scenario properly and guide users to select or create a campaign.

## Steps to Reproduce
1. Create a user account without setting a current_campaign_id
2. Attempt to login with valid credentials
3. Navigate to the homepage after login
4. Observe application behavior

## Expected Behavior
When a user logs in without a current campaign:
1. Login should succeed without errors
2. Homepage should load without crashing or showing errors
3. User should be presented with options to:
   - Select an existing campaign they're a member of
   - Create a new campaign
   - Browse available campaigns to join
4. Clear messaging should explain they need to select a campaign

## Actual Behavior
During testing, users without a current campaign may experience:
- Homepage errors or crashes when trying to load campaign-specific data
- API requests failing with 404 errors
- Poor user experience with unclear error messages

## Related Files
- `shot-server/app/models/user.rb` - User model with current_campaign_id
- `shot-client-next/src/lib/getCurrentUser.ts` - User authentication logic
- `shot-client-next/src/app/(main)/layout.tsx` - Main layout that may depend on campaign data
- `shot-client-next/src/app/(main)/page.tsx` - Homepage component
- `shot-client-next/src/contexts/AppContext.tsx` - Application context handling
- `shot-server/app/controllers/application_controller.rb` - Base controller logic
- `shot-server/app/services/current_campaign.rb` - Campaign context service

## Screenshots/Evidence
- Reference test automation screenshots showing 404 errors on homepage
- `test-results/after-login.png` - Shows application errors after login

## Investigation Notes
This issue was discovered during automated testing when users were created without a current campaign. The application should be robust enough to handle this common scenario, especially for new users who haven't joined any campaigns yet.

This is particularly important for user onboarding and ensuring the application doesn't crash for new users.

## Potential Solution
1. Add graceful null handling for users without current_campaign_id
2. Create a campaign selection/creation flow for users without campaigns
3. Modify homepage to show campaign selection UI when no current campaign
4. Add proper error boundaries and fallback UI components
5. Consider redirecting to a "Select Campaign" page when current_campaign_id is null
6. Update API endpoints to handle missing campaign context gracefully

## Resolution

**Status**: ✅ RESOLVED  
**Date**: 2025-08-18  
**Branches**: `add-campaign-deactivate` (root, server, client)

### Changes Made

**Graceful No-Campaign Handling:**
- Fixed AppContext error handling to only clear JWT tokens on 401 authentication errors, not 404 errors
- Updated `/api/v2/campaigns/current` endpoint to return null (not 404) when user has no current campaign
- Implemented proper null campaign handling throughout the frontend application
- Users without current campaigns now see restricted menu with only "Campaigns" option available

**Backend API Improvements:**
- Added missing `current` method to `CampaignsController` that gracefully returns null when no current campaign
- Fixed `/api/v2/campaigns/set` endpoint to handle null campaign ID for deactivation
- Proper error handling prevents crashes when users don't have current campaigns

**Frontend Error Handling:**
- Updated `AppContext.tsx` to differentiate between authentication errors (401) and missing campaigns (404)
- 404 errors on campaign endpoints now treated as "no current campaign" rather than authentication failure
- Login process maintains JWT tokens even when user has no current campaign
- Redirect logic properly sends users to `/campaigns` when they visit protected pages without current campaign

**User Experience Flow:**
- Users without current campaigns can log in successfully without crashes
- Clear navigation to campaigns page where users can activate a campaign
- No error messages or crashes when accessing the application without an active campaign
- Seamless transition from "no campaign" to "active campaign" state

### Technical Implementation

The core issue was that missing campaign data was being treated as an authentication failure, causing JWT token invalidation and login loops. The fix involved:

1. **Error Classification**: Properly distinguish between authentication (401) and missing resource (404) errors
2. **API Consistency**: Ensure `/api/v2/campaigns/current` returns null rather than 404 for missing campaigns  
3. **Context Management**: Handle null campaign state gracefully in AppContext
4. **User Flow**: Direct users to campaign selection when no current campaign exists

**Key Fixes:**
- ✅ Login succeeds without errors for users without current campaigns
- ✅ Homepage loads without crashing when no current campaign
- ✅ Users see clear path to campaign selection/activation
- ✅ No JWT token invalidation due to missing campaign data
- ✅ Proper redirect flow from protected pages to campaign selection

### Testing Validation

- ✅ Users can log in successfully without current campaigns
- ✅ Application loads without crashes when no campaign is active
- ✅ Users are properly directed to campaigns page for selection
- ✅ Authentication remains valid throughout the no-campaign experience  
- ✅ Campaign activation works seamlessly from the no-campaign state

## Related Issues
- Related to user onboarding experience  
- Connected to authentication flow improvements
- Integrated with JWT authentication and campaign deactivate features