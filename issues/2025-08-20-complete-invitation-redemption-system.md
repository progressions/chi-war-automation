# Issue: Complete Invitation Redemption System Integration

**Date**: 2025-08-20  
**Priority**: Medium  
**Category**: Backend/Frontend  
**Status**: Open

## Description

The current invitation system allows gamemasters to create and manage invitations via the new v2 API, but the invitation redemption flow (where users accept invitations and join campaigns) still relies on the legacy v1 API system. This creates an incomplete user experience where:

1. Gamemasters can send invitations through the new UI
2. Users receive invitation emails with redemption links
3. The redemption process uses outdated v1 endpoints and UI patterns
4. No integration with the new InvitationBadge/InvitationManager components

The redemption system needs to be updated to provide a cohesive end-to-end invitation workflow.

## Steps to Reproduce

Current incomplete flow:
1. Gamemaster creates invitation via new InvitationManager
2. User receives email with invitation link
3. User clicks link and is taken to legacy redemption page
4. Redemption uses v1 API endpoints
5. User joins campaign but experience is disjointed

## Expected Behavior

Complete invitation redemption flow should:
1. Maintain consistency with new invitation UI/UX design
2. Use v2 API endpoints for all redemption actions
3. Provide clear feedback to users during redemption
4. Update InvitationManager in real-time when invitations are redeemed
5. Include proper error handling for expired/invalid invitations
6. Integrate with the campaign membership system seamlessly

## Actual Behavior

Currently the redemption system:
- Uses legacy v1 API endpoints (`PATCH /api/v1/invitations/:id/redeem`)
- Has outdated UI that doesn't match new design patterns
- Lacks integration with new InvitationManager component
- No real-time updates for gamemasters when invitations are redeemed

## Related Files

**Backend (Rails)**:
- `app/controllers/api/v1/invitations_controller.rb` - Legacy redemption endpoint
- Need new: `app/controllers/api/v2/invitations_controller.rb` - Add redemption endpoint
- `config/routes.rb` - Add v2 redemption route
- `app/models/invitation.rb` - May need redemption logic updates
- `spec/requests/api/v2/invitations/invitations_spec.rb` - Add redemption tests

**Frontend (Next.js)**:
- `src/lib/client/campaignClient.ts` - Update to use v2 redemption endpoint
- `src/components/invitations/InvitationManager.tsx` - Add real-time redemption updates
- Need new: `src/app/invitations/[id]/redeem/page.tsx` - New redemption page
- Need new: `src/components/invitations/RedemptionForm.tsx` - Redemption UI component
- `src/lib/ApiV2.ts` - Add redemption route helper

**Email Templates**:
- Email templates may need URL updates to point to new redemption pages

## Screenshots/Evidence

- New invitation system screenshots available in `test-results/invitation-*` from recent development
- Legacy redemption flow screenshots would be needed for comparison

## Investigation Notes

**Current Implementation Analysis**:
- V1 redemption endpoint works but is isolated from new system
- CampaignClient already has `redeemInvitation` function but uses v1 API
- Invitation model has necessary redemption logic 
- ActionCable channels could provide real-time updates

**Technical Considerations**:
- Need to maintain backwards compatibility during transition
- Email links in existing emails point to old redemption URLs
- Consider whether to create new redemption page or update existing
- Real-time updates require WebSocket integration with InvitationManager

## Potential Solution

**Phase 1: Backend V2 Integration**
1. Add `POST /api/v2/invitations/:id/redeem` endpoint to v2 controller
2. Include proper authentication and validation
3. Return updated invitation and campaign membership data
4. Add comprehensive RSpec tests for redemption endpoint
5. Add ActionCable broadcast on successful redemption

**Phase 2: Frontend Redemption Page**
1. Create new redemption page using App Router: `/invitations/[id]/redeem`
2. Build RedemptionForm component with modern UI patterns
3. Include loading states, error handling, success feedback
4. Update API client to use v2 redemption endpoint
5. Ensure mobile-responsive design

**Phase 3: Real-time Integration**
1. Update InvitationManager to subscribe to redemption events
2. Remove redeemed invitations from pending list in real-time
3. Show "Invitation accepted" notifications to gamemasters
4. Update campaign member counts immediately

**Phase 4: Email Template Updates**
1. Update invitation email templates to use new redemption URLs
2. Consider transition period with fallback to v1 if needed
3. Test email delivery and link functionality

**Phase 5: Testing & Cleanup**
1. Create comprehensive Playwright tests for full redemption flow
2. Test edge cases (expired invitations, already redeemed, etc.)
3. Remove or deprecate v1 redemption endpoints after transition
4. Update documentation

## Related Issues

- Relates to completed invitation system integration (2025-08-20-integrate-campaign-invitation-system.md)
- May relate to future user onboarding improvements
- Consider impact on campaign membership management features

## Implementation Priority

This should be implemented after validating that the current gamemaster invitation functionality works correctly in production. The redemption flow is the user-facing completion of the invitation system and significantly impacts user experience for new campaign members.