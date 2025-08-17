# Issue: It should be possible to start or end the current campaign, selecting which campaign to run

**Date**: 2025-08-17  
**Priority**: Medium  
**Category**: UI/UX  
**Status**: Open

## Description
Users should have the ability to start or end campaign sessions and switch between different campaigns they have access to. This would provide better campaign management functionality, allowing users to actively manage which campaign is currently running and switch context between multiple campaigns.

## Steps to Reproduce
1. Login as a user who is a member of multiple campaigns
2. Look for campaign session management options
3. Try to start/end a campaign session
4. Try to switch between different campaigns

## Expected Behavior
Users should be able to:
1. **Start a campaign session** - Mark a campaign as actively running
2. **End a campaign session** - Mark a campaign as paused/ended
3. **Select which campaign to run** - Switch between campaigns they're a member of
4. **View campaign status** - See which campaigns are active/inactive
5. **Campaign session indicators** - Clear visual feedback about session state

## Actual Behavior
Currently, campaign management may lack these session controls, making it difficult for users to:
- Manage multiple campaigns effectively
- Track which campaigns are actively being played
- Switch context between different game sessions

## Related Files
- `shot-server/app/models/campaign.rb` - Campaign model (may need session state fields)
- `shot-server/app/models/user.rb` - User model with current_campaign_id
- `shot-client-next/src/components/campaigns/` - Campaign management components
- `shot-client-next/src/contexts/AppContext.tsx` - Campaign context management
- `shot-server/app/controllers/api/v*/campaigns_controller.rb` - Campaign API endpoints
- `shot-client-next/src/app/(main)/layout.tsx` - Campaign selection UI
- `shot-server/app/services/current_campaign.rb` - Campaign context service

## Screenshots/Evidence
- Would benefit from campaign management UI screenshots
- Current campaign selection interface (if exists)

## Investigation Notes
This feature would enhance the user experience for gamemasters and players who participate in multiple campaigns. It would provide:
- Better organization for users with multiple active games
- Clear session state management
- Improved context switching between campaigns
- Better tracking of active vs inactive campaigns

This is particularly valuable for gamemasters who might run multiple campaigns or players who participate in several different games.

## Potential Solution
1. **Database changes**:
   - Add session state fields to Campaign model (active, started_at, ended_at)
   - Track campaign session history
   
2. **Backend API**:
   - Add endpoints for starting/ending campaign sessions
   - Update campaign switching logic
   - Add session state to campaign serializers
   
3. **Frontend UI**:
   - Campaign switcher component in header/navigation
   - Start/End session buttons for gamemasters
   - Visual indicators for active/inactive campaigns
   - Campaign selection modal/dropdown
   
4. **User Experience**:
   - Clear visual feedback about current campaign
   - Session timer/duration tracking
   - Quick campaign switching interface

## Related Issues
- Related to campaign management improvements
- Connected to user onboarding for multi-campaign users
- May relate to Discord bot integration for session management