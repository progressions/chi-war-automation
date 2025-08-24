# Campaign List Reload Fix

**Date**: August 23, 2025  
**Issue**: Campaign list not reloading after campaign creation in onboarding flow  
**Status**: ✅ **RESOLVED** (Frontend Fix + ActionCable Infrastructure Fix)

## Problem Summary

During the complete user journey test (`test-complete-user-journey.js`), the campaign creation step was failing because newly created campaigns were not appearing in the campaigns list without a manual page refresh. The test showed:

```
⏳ Campaign not found, waiting additional 5 seconds for async reload...
🔄 Refreshing page to ensure latest data...
✅ Campaign "My First Epic Campaign" found after page refresh!
```

This indicated that:
1. ✅ Campaign creation was working correctly
2. ❌ Real-time ActionCable reload was not working
3. ✅ Campaign appeared after manual page refresh

## Root Cause Analysis

### Investigation Process

1. **Compared with working factions feature**: User confirmed that factions List reloads properly after faction creation
2. **Analyzed ActionCable setup**: Found that Rails backend has proper `Broadcastable` concern and broadcast jobs
3. **Identified pattern difference**: Factions and campaigns List components used different ActionCable subscription patterns

### Key Findings

**Factions List (Working Pattern)**:
```typescript
// factions/List.tsx - Line 62
useEffect(() => {
  if (!campaignData) return
  if (campaignData.factions === "reload") {
    fetchFactions(filters)
  }
}, [campaignData, fetchFactions, filters])
```

**Campaigns List (Broken Pattern)**:
```typescript
// campaigns/List.tsx - Original
useEffect(() => {
  const unsubscribe = subscribeToEntity("campaigns", data => {
    if (data === "reload") {
      fetchCampaigns(filters)
    }
  })
  return unsubscribe
}, [subscribeToEntity, fetchCampaigns, filters])
```

The campaigns List was using the newer `subscribeToEntity` pattern while factions used the direct `campaignData` approach. The `campaignData` pattern proved to be more reliable for the campaign creation scenario.

## Solution Implementation

### 1. Applied Working Pattern to Campaigns List

**File**: `/shot-client-next/src/components/campaigns/List.tsx`

**Changes**:
- ✅ Added `campaignData` to `useCampaign()` hook imports
- ✅ Added the working factions pattern alongside existing pattern for backwards compatibility

```typescript
// NEW: Subscribe to campaign updates using campaignData (same pattern as factions)
useEffect(() => {
  if (!campaignData) return
  if (campaignData.campaigns === "reload") {
    fetchCampaigns(filters)
  }
}, [campaignData, fetchCampaigns, filters])

// KEPT: Also keep the subscribeToEntity pattern for backwards compatibility
useEffect(() => {
  const unsubscribe = subscribeToEntity("campaigns", data => {
    if (data === "reload") {
      fetchCampaigns(filters)
    }
  })
  return unsubscribe
}, [subscribeToEntity, fetchCampaigns, filters])
```

### 2. Enhanced Login Form Accessibility

**File**: `/shot-client-next/src/app/(auth)/login/page.tsx`

**Changes**:
- ✅ Added `name="email"` attribute to email input
- ✅ Added `name="password"` attribute to password input

This improves:
- Test automation reliability (proper selectors)
- Screen reader accessibility
- Browser autofill functionality
- Form validation

## Backend ActionCable Flow (Already Working)

The Rails backend was already properly configured:

1. **Campaign Model** (`/shot-server/app/models/campaign.rb`):
   - ✅ Includes `Broadcastable` concern
   - ✅ Has `after_create :broadcast_reload` callback
   - ✅ Broadcasts `{ campaigns: "reload" }` message

2. **ActionCable Channel**: 
   - ✅ `CampaignChannel` subscription in frontend AppContext
   - ✅ Messages flow through `campaignData` state

3. **Background Jobs**:
   - ✅ Sidekiq processes `BroadcastCampaignReloadJob`
   - ✅ ActionCable server broadcasts to campaign channels

## Testing Environment Setup

**Required for ActionCable to work in test environment**:

1. **Test Database**: `RAILS_ENV=test rails db:create db:migrate db:seed`
2. **Rails Test Server**: `RAILS_ENV=test rails server -p 3004` 
3. **Next.js Test Server**: `NODE_ENV=test npm run dev -- -p 3005`
4. **Sidekiq Background Jobs**: `RAILS_ENV=test bundle exec sidekiq` ⚠️ **CRITICAL**

**Key Learning**: Sidekiq is required for ActionCable broadcasts in test environment. Without it, the broadcast jobs are queued but never processed.

## Verification

The fix ensures:
- ✅ Campaign creation triggers immediate list reload via ActionCable
- ✅ No page refresh required for newly created campaigns to appear
- ✅ Maintains backwards compatibility with existing subscription patterns
- ✅ Improved login form accessibility and testability

## Files Modified

```
shot-client-next/src/components/campaigns/List.tsx
shot-client-next/src/app/(auth)/login/page.tsx
```

## Commit

```
089e1ce - Fix campaign list reload and improve login form accessibility
```

## August 24, 2025 - ActionCable Infrastructure Fix

**Additional Issue Discovered**: The frontend fix above resolved the issue in development environment, but WebSocket campaign reload still failed in the test environment.

### Root Cause: Missing ActionCable Infrastructure

Investigation revealed that ActionCable WebSocket support was not properly configured for API-only Rails applications:

1. **Missing ActionCable Route**: `/cable` endpoint returned 404 - ActionCable server was not mounted
2. **Missing Middleware**: API-only mode disabled session/cookie middleware required for WebSocket connections  
3. **Test Environment**: ActionCable configuration was incomplete in test environment

### Infrastructure Fixes Applied

**File**: `/shot-server/config/routes.rb`
```ruby
# Mount ActionCable for WebSocket support
mount ActionCable.server => '/cable'
```

**File**: `/shot-server/config/application.rb`
```ruby
# Enable ActionCable for WebSocket support
config.middleware.use ActionDispatch::Cookies
config.middleware.use ActionDispatch::Session::CookieStore
```

**File**: `/shot-server/config/environments/test.rb`
```ruby
# ActionCable configuration for test environment
config.action_cable.disable_request_forgery_protection = true
config.action_cable.url = "/cable"
```

**File**: `/shot-server/app/channels/user_channel.rb` (NEW)
```ruby
class UserChannel < ApplicationCable::Channel
  def subscribed
    stream_from "user_#{params[:id]}"
  end
  
  def unsubscribed
  end
end
```

**File**: `/shot-server/app/models/campaign.rb`
- Enhanced `broadcast_reload` method to use user-specific channels for new users who don't have campaign subscriptions yet

### Verification

After infrastructure fixes:
- ✅ **ActionCable Endpoint**: `/cable` now properly handles WebSocket upgrade requests
- ✅ **Test Environment**: WebSocket connections establish successfully
- ✅ **Real-time Updates**: Campaign table refreshes immediately after creation in both development and test
- ✅ **New User Onboarding**: UserChannel ensures broadcasts reach users creating their first campaigns

### Commit

```
63c99d4 - Fix ActionCable WebSocket support for campaign real-time updates
```

## Impact

- ✅ **User Experience**: Seamless campaign creation during onboarding
- ✅ **Test Reliability**: `test-complete-user-journey.js` now passes campaign creation step in all environments
- ✅ **Accessibility**: Better form inputs for screen readers and automation
- ✅ **Consistency**: Campaign list behavior now matches factions list behavior
- ✅ **Infrastructure**: ActionCable WebSocket support properly configured for API-only Rails app
- ✅ **Environment Parity**: WebSocket functionality works consistently in development and test environments