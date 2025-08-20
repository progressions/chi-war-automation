# Issue: Clear Current Campaign When User Leaves Their Active Campaign

**Date**: 2025-08-20  
**Priority**: High  
**Category**: Backend/Data Consistency  
**Status**: Open

## Description

When a user leaves a campaign that is currently set as their active campaign, the system does not properly clear the user's `current_campaign_id` field in the database or update the frontend state. This creates a data inconsistency where users appear to be "in" a campaign they have actually left, potentially causing access issues and UI confusion.

## Steps to Reproduce

1. Log in as a user who is a member of multiple campaigns
2. Set one campaign as the current active campaign
3. Navigate to the profile page and leave the active campaign
4. Observe that the user's `current_campaign_id` in the database is not cleared
5. The frontend may still show the user as being "in" the campaign they left

## Expected Behavior

When a user leaves a campaign that is their current active campaign:

1. **Backend should**:
   - Check if the campaign being left is the user's current campaign
   - Clear the `current_campaign_id` field in the database if it matches
   - Update the Redis cache via the CurrentCampaign service
   - Ensure data consistency across all storage layers

2. **Frontend should**:
   - Detect if the leaving campaign is the currently active campaign
   - Call `setCurrentCampaign(null)` to clear the AppContext state
   - Update the UI to reflect that no campaign is currently active
   - Remove the "Active" indicator from campaign badges

3. **User Experience should**:
   - Immediately reflect the change in the UI
   - Show no active campaign after leaving
   - Require the user to select a new campaign to continue working
   - Not show stale "Active" status on left campaigns

## Actual Behavior

Currently when a user leaves their active campaign:
- ❌ The `current_campaign_id` field remains set in the database
- ❌ The Redis cache is not updated to reflect the change
- ❌ The frontend AppContext still shows the left campaign as active
- ❌ The UI may display inconsistent campaign status
- ❌ User may encounter access issues trying to use campaign-specific features

## Impact

**Data Consistency**: Creates inconsistency between user's actual campaign memberships and their active campaign setting.

**User Experience**: Confusing UI state where users appear to be in campaigns they've left.

**Security Concerns**: Potential access issues if code tries to use the stale current campaign reference.

**Support Burden**: Users may report bugs about being "stuck" in campaigns they've left.

## Related Files

**Backend Implementation:**
- `shot-server/app/controllers/api/v1/campaign_memberships_controller.rb` - Campaign membership removal logic
- `shot-server/app/models/campaign_membership.rb` - Model for campaign memberships  
- `shot-server/app/models/user.rb` - User model with current_campaign relationship
- `shot-server/app/services/current_campaign.rb` - Service for managing current campaign state

**Frontend Implementation:**
- `shot-client-next/src/components/users/profile/CampaignsList.tsx` - Component handling leave campaign functionality
- `shot-client-next/src/contexts/AppContext.tsx` - Global state management for current campaign
- `shot-client-next/src/components/badges/CampaignBadge.tsx` - Shows "Active" status for current campaign
- `shot-client-next/src/lib/client/campaignClient.ts` - API client for campaign operations

## Technical Analysis

### Backend Flow Issue
1. `CampaignMembershipsController#destroy` removes the membership
2. No check if the removed campaign was the user's current campaign  
3. `current_campaign_id` field remains stale
4. CurrentCampaign service is not called to clear the state

### Frontend Flow Issue  
1. `CampaignsList#handleLeaveCampaign` calls `removePlayer` API
2. Updates local `player_campaigns` list but not current campaign state
3. AppContext maintains stale current campaign reference
4. UI continues showing "Active" status on left campaign

## Proposed Solution

### Phase 1: Backend Data Consistency
1. **Update CampaignMembershipsController**:
   - Add check in `destroy` method if leaving campaign is user's current campaign
   - Call `CurrentCampaign.set(user: user, campaign: nil)` if match found
   - Ensure both database and Redis are properly updated

2. **Add Safety Net to CampaignMembership Model**:
   - Add `after_destroy` callback to check current campaign status
   - Provides protection against direct model deletions
   - Ensures consistency even if controller logic is bypassed

### Phase 2: Frontend State Management
1. **Update CampaignsList Component**:
   - Access current campaign from AppContext
   - Check if leaving campaign matches current campaign
   - Call `setCurrentCampaign(null)` to clear frontend state
   - Ensure immediate UI feedback

2. **Enhance ProfilePageClient**:
   - Pass current campaign context to CampaignsList
   - Enable component to make informed decisions about state changes

### Phase 3: Testing and Validation
1. **Create Comprehensive Tests**:
   - Test leaving active campaign clears state properly
   - Test leaving non-active campaign doesn't affect current campaign
   - Test both frontend and backend state consistency
   - Verify UI immediately reflects changes

## Acceptance Criteria

- [ ] When user leaves their active campaign, `current_campaign_id` is cleared in database
- [ ] Redis cache is properly updated when current campaign is cleared
- [ ] Frontend AppContext state is cleared when active campaign is left
- [ ] UI immediately shows no active campaign after leaving
- [ ] "Active" badge is removed from campaign user just left
- [ ] Leaving a non-active campaign does not affect current campaign setting
- [ ] Backend and frontend state remain consistent after leave operation
- [ ] User can select a new current campaign after leaving the active one
- [ ] No access errors occur after leaving active campaign
- [ ] Email notifications work properly for campaign leaving

## Testing Strategy

**Unit Tests**:
- Test CampaignMembership model callback
- Test CampaignMembershipsController current campaign clearing
- Test CurrentCampaign service state management

**Integration Tests**:  
- Test full leave campaign flow from API to database
- Test frontend state management via component testing
- Test Redis cache consistency

**End-to-End Tests**:
- Test user leaving active campaign via UI
- Verify both backend and frontend state are properly cleared
- Test user selecting new campaign after leaving active one

## Priority Justification

**High Priority** because:
- Creates data inconsistency that could lead to access errors
- Affects user experience with confusing UI state  
- Potentially impacts security if stale campaign references are used
- Relatively straightforward fix with clear solution path
- Foundation for reliable campaign management functionality