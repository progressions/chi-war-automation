# New User Onboarding Guidance Dashboard

**Date**: 2025-08-23  
**Priority**: High  
**Category**: UI/UX  
**Status**: Open

## Description

New users who sign up are immediately redirected to `/campaigns` where they see an empty table with only a speed dial create button. This provides no context about what campaigns are, what they should do next, or how to get started with the platform.

## Problem Statement

- New users land on empty campaigns page with no guidance
- No explanation of what campaigns are or why they need one
- No onboarding flow to help users understand the platform
- Missing calls-to-action for common first-time user tasks

## Expected Behavior

When a user has no campaigns, the homepage/dashboard should show an onboarding experience with:
- Welcome message explaining the platform
- Guided calls-to-action for getting started
- Links to create first campaign, characters, or join existing campaigns
- Brief explanation of core concepts (campaigns, fights, characters)

## Related Files

**Frontend (shot-client-next/):**
- `src/app/(main)/page.tsx` - Add onboarding state detection
- `src/components/dashboard/OnboardingDashboard.tsx` - New onboarding component
- `src/components/dashboard/Dashboard.tsx` - Conditional rendering logic
- `src/lib/getCampaignGuard.ts` - Update redirect behavior for onboarding
- `src/components/campaigns/List.tsx` - Enhanced empty state with guidance

## Investigation Notes

Currently:
- Users with no campaigns get redirected to `/campaigns` via `requireCampaign()`
- The campaigns page shows empty table with speed dial create button
- No contextual help or onboarding guidance exists
- Need to detect "first-time user" state (no campaigns created)

## Potential Solution

1. Modify homepage to detect users with no campaigns
2. Show dedicated onboarding dashboard instead of regular dashboard
3. Include guided actions: create campaign, learn concepts, join campaign
4. Transition to normal dashboard after first campaign is created
5. Enhance campaigns empty state with better guidance

## Next Steps

1. Create OnboardingDashboard component with calls-to-action
2. Update homepage routing logic to show onboarding for new users
3. Add helpful messaging and links to get started
4. Test user flow from registration through first campaign creation