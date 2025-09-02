# Issue: Campaigns Index Cache Not Refreshing at Proper Times

**Date**: 2025-08-31  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description
The campaigns index page is experiencing caching issues where the displayed data is not refreshing at the appropriate times. This causes users to see stale campaign information and may require manual page refreshes to see updated data.

## Steps to Reproduce
1. Navigate to campaigns index page
2. Perform an action that should update campaign data (e.g., activate/deactivate campaign, modify campaign details)
3. Observe that the index does not reflect the changes immediately
4. Manual refresh may be required to see updated information

## Expected Behavior
The campaigns index should automatically refresh and display updated campaign information when:
- Campaign status changes (activation/deactivation)
- Campaign details are modified
- New campaigns are created
- Campaigns are deleted or archived
- User switches between campaigns

## Actual Behavior
The campaigns index displays cached/stale data and does not refresh automatically when campaign data changes, leading to inconsistent user experience and potential confusion about campaign status.

## Related Files
- `shot-client-next/src/app/campaigns/page.tsx` - Campaigns index page component
- `shot-client-next/src/hooks/useCampaigns.ts` - Campaign data fetching hook (if exists)
- `shot-client-next/src/lib/ApiV2.ts` - API client for campaigns endpoints
- `shot-client-next/src/contexts/CampaignContext.tsx` - Campaign context provider
- `shot-client-next/src/components/campaigns/` - Campaign-related components

## Screenshots/Evidence
- Investigation needed to capture specific examples of cache refresh issues

## Investigation Notes
- Need to investigate the current caching mechanism used for campaigns data
- Check if React Query, SWR, or other caching library is being used
- Examine cache invalidation strategies currently in place
- Review WebSocket integration for real-time updates via CampaignChannel
- Analyze browser network requests to understand data fetching patterns

## Potential Solution
Potential approaches to investigate:
1. Implement proper cache invalidation after campaign mutations
2. Use React Query mutations with cache updates
3. Ensure WebSocket subscriptions properly trigger cache refreshes
4. Add manual refresh capabilities as fallback
5. Review and optimize cache keys and stale-while-revalidate strategies

## Related Issues
- May be related to broader real-time update patterns across the application
- Could impact other index pages with similar caching implementations