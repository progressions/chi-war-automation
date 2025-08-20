# Current Campaign Clearing Specification

## Overview

This specification defines the implementation for automatically clearing a user's current campaign when they leave that campaign, ensuring data consistency between backend database state and frontend application state.

## Problem Statement

When users leave a campaign that is currently set as their active campaign, the system fails to:
- Clear the `current_campaign_id` field in the database
- Update the Redis cache via CurrentCampaign service  
- Clear the frontend AppContext campaign state
- Update the UI to reflect the change

This creates data inconsistencies and potential access issues.

## Technical Requirements

### Backend Requirements

#### 1. CampaignMembershipsController Enhancement

**File**: `shot-server/app/controllers/api/v1/campaign_memberships_controller.rb`

**Changes Needed**:
```ruby
def destroy
  # ... existing code to find membership ...
  
  if @campaign_membership
    # NEW: Check if leaving campaign is user's current campaign
    user = User.find(params[:user_id])
    leaving_current_campaign = user.current_campaign_id == params[:campaign_id]
    
    @campaign_membership.destroy!
    
    # NEW: Clear current campaign if user is leaving their active campaign
    if leaving_current_campaign
      CurrentCampaign.set(user: user, campaign: nil)
    end
    
    # ... existing email and render logic ...
  end
end
```

**Behavior**:
- Check if the campaign being left matches the user's `current_campaign_id`
- If yes, call `CurrentCampaign.set(user: user, campaign: nil)` to clear state
- This updates both database (`user.current_campaign_id = nil`) and Redis cache
- Existing email notifications and response logic remain unchanged

#### 2. CampaignMembership Model Safety Net

**File**: `shot-server/app/models/campaign_membership.rb`

**Changes Needed**:
```ruby
class CampaignMembership < ApplicationRecord
  belongs_to :user
  belongs_to :campaign

  validates :user, presence: true, uniqueness: { scope: :campaign_id }
  validates :campaign, presence: true
  
  # NEW: Safety net for direct model deletions
  after_destroy :clear_current_campaign_if_needed

  private

  def clear_current_campaign_if_needed
    if user&.current_campaign_id == campaign_id
      CurrentCampaign.set(user: user, campaign: nil)
    end
  end
end
```

**Purpose**:
- Provides safety net for direct model deletions outside controller
- Ensures consistency even if membership is removed via console, rake tasks, etc.
- Only triggers if the destroyed membership was for the user's current campaign

### Frontend Requirements

#### 1. CampaignsList Component Enhancement  

**File**: `shot-client-next/src/components/users/profile/CampaignsList.tsx`

**Changes Needed**:
```typescript
// Add current campaign from context
interface CampaignsListProps {
  user: User
  onUserUpdate: (user: User) => void
  currentCampaign?: Campaign | null  // NEW: Pass current campaign
}

export default function CampaignsList({ 
  user, 
  onUserUpdate, 
  currentCampaign  // NEW: Receive current campaign
}: CampaignsListProps) {
  const { setCurrentCampaign } = useApp()  // NEW: Access context setter
  
  const handleLeaveCampaign = useCallback(async (campaign: Campaign) => {
    if (!campaign) return
    
    setIsLeaving(true)
    try {
      await client.removePlayer(user, campaign)
      
      // NEW: Check if leaving the current active campaign
      const leavingCurrentCampaign = currentCampaign?.id === campaign.id
      
      // Update user object by removing the campaign from player_campaigns
      const updatedUser = {
        ...user,
        player_campaigns: playerCampaigns.filter(c => c.id !== campaign.id)
      }
      
      // NEW: Clear current campaign in frontend if needed
      if (leavingCurrentCampaign) {
        await setCurrentCampaign(null)
      }
      
      onUserUpdate(updatedUser)
      toastSuccess(`Left campaign "${campaign.name}"`)
      setLeavingCampaign(null)
    } catch (error: any) {
      console.error("Failed to leave campaign:", error)
      toastError("Failed to leave campaign")
    } finally {
      setIsLeaving(false)
    }
  }, [client, user, playerCampaigns, currentCampaign, onUserUpdate, setCurrentCampaign, toastSuccess, toastError])
  
  // ... rest of component unchanged ...
}
```

**Key Changes**:
- Accept `currentCampaign` prop to know which campaign is active
- Import `setCurrentCampaign` from AppContext
- Check if leaving campaign matches current campaign
- Call `setCurrentCampaign(null)` if leaving the active campaign
- This ensures frontend state is immediately cleared

#### 2. ProfilePageClient Integration

**File**: `shot-client-next/src/components/users/profile/ProfilePageClient.tsx`

**Changes Needed**:
```typescript
export default function ProfilePageClient({ user: initialUser }: ProfilePageClientProps) {
  const { campaign: currentCampaign } = useApp()  // NEW: Get current campaign
  
  // ... existing state and handlers ...
  
  return (
    <Stack direction="column" spacing={4}>
      <ProfileForm user={user} onUserUpdate={handleUserUpdate} />
      <CampaignsList 
        user={user} 
        onUserUpdate={handleUserUpdate}
        currentCampaign={currentCampaign}  // NEW: Pass current campaign
      />
    </Stack>
  )
}
```

**Purpose**:
- Pass current campaign from AppContext to CampaignsList component
- Enables CampaignsList to make informed decisions about clearing state

## Data Flow

### Current State (Problematic)
1. User clicks "Leave Campaign" on active campaign
2. Frontend calls `removePlayer(user, campaign)` API
3. Backend removes CampaignMembership record
4. Backend does NOT clear `user.current_campaign_id` 
5. Frontend updates local `player_campaigns` list
6. Frontend does NOT clear AppContext current campaign
7. **Result**: Database and frontend have stale current campaign reference

### New State (Fixed)
1. User clicks "Leave Campaign" on active campaign  
2. Frontend calls `removePlayer(user, campaign)` API
3. Backend removes CampaignMembership record
4. **NEW**: Backend checks if removed campaign was current campaign
5. **NEW**: Backend calls `CurrentCampaign.set(user: user, campaign: nil)` if needed
6. Frontend updates local `player_campaigns` list
7. **NEW**: Frontend checks if leaving campaign was current campaign
8. **NEW**: Frontend calls `setCurrentCampaign(null)` if needed
9. **Result**: Database and frontend are consistent with no current campaign

## State Transitions

### User's Current Campaign State
- `current_campaign_id: campaign_123` → `current_campaign_id: null` (when leaving campaign_123)
- `current_campaign_id: campaign_456` → `current_campaign_id: campaign_456` (when leaving campaign_123)

### AppContext Campaign State  
- `campaign: { id: "campaign_123", ... }` → `campaign: null` (when leaving current campaign)
- `campaign: { id: "campaign_456", ... }` → `campaign: { id: "campaign_456", ... }` (when leaving different campaign)

### UI Indicators
- Campaign badges show "Active" chip for current campaign
- After leaving current campaign, no badges show "Active" 
- User must select a new campaign to see "Active" indicator again

## Edge Cases and Considerations

### Backend Edge Cases
1. **Concurrent Operations**: If user changes current campaign while leave request is processing
   - Solution: Check current campaign at time of deletion, not request start
   - Race condition window is minimal due to single-user operations

2. **Direct Model Deletion**: If CampaignMembership is deleted via console/rake task
   - Solution: `after_destroy` callback provides safety net
   - Ensures consistency regardless of deletion method

3. **User Deletion**: If user is deleted while current campaign references exist
   - Existing foreign key constraints handle this case
   - No additional changes needed

### Frontend Edge Cases  
1. **Simultaneous Campaign Changes**: User changes current campaign in another tab while leaving
   - Solution: AppContext state is shared across tabs via React context
   - `setCurrentCampaign(null)` call ensures consistency

2. **Network Failure**: Leave campaign API succeeds but frontend state update fails
   - Solution: Frontend checks current campaign state on next load
   - Backend state is authoritative and will be reflected on refresh

3. **Component Unmounting**: User navigates away during leave operation
   - Solution: API call completes in background, state will be correct on return
   - No cleanup needed due to async nature of operation

## Testing Strategy

### Backend Tests

**Controller Tests** (`spec/controllers/api/v1/campaign_memberships_controller_spec.rb`):
```ruby
describe "#destroy" do
  context "when leaving current campaign" do
    it "clears the user's current campaign" do
      user.update(current_campaign: campaign)
      delete :destroy, params: { campaign_id: campaign.id, user_id: user.id }
      
      expect(user.reload.current_campaign).to be_nil
    end
  end
  
  context "when leaving non-current campaign" do
    it "does not change the user's current campaign" do
      user.update(current_campaign: other_campaign)
      delete :destroy, params: { campaign_id: campaign.id, user_id: user.id }
      
      expect(user.reload.current_campaign).to eq(other_campaign)
    end
  end
end
```

**Model Tests** (`spec/models/campaign_membership_spec.rb`):
```ruby
describe "after_destroy callback" do
  it "clears current campaign when destroying current campaign membership" do
    user.update(current_campaign: campaign)
    membership = user.campaign_memberships.find_by(campaign: campaign)
    
    membership.destroy
    
    expect(user.reload.current_campaign).to be_nil
  end
end
```

### Frontend Tests

**Component Tests** (`src/components/users/profile/CampaignsList.test.tsx`):
```typescript
describe("CampaignsList", () => {
  describe("when leaving current campaign", () => {
    it("clears the current campaign in context", async () => {
      const setCurrentCampaign = jest.fn()
      const currentCampaign = { id: "campaign_123", name: "Test Campaign" }
      
      render(<CampaignsList 
        user={user} 
        onUserUpdate={jest.fn()}
        currentCampaign={currentCampaign}
      />)
      
      // ... simulate leave campaign action ...
      
      expect(setCurrentCampaign).toHaveBeenCalledWith(null)
    })
  })
})
```

### Integration Tests

**End-to-End Test** (`test-scripts/test-leave-current-campaign.js`):
```javascript
// Test full flow from UI interaction to backend state change
async function testLeaveCurrentCampaign() {
  // 1. Set up user with current campaign
  // 2. Navigate to profile page
  // 3. Click leave on current campaign
  // 4. Verify backend current_campaign_id is cleared
  // 5. Verify frontend shows no active campaign
  // 6. Verify user can select new current campaign
}
```

## Implementation Order

### Phase 1: Backend Foundation
1. Update `CampaignMembership` model with `after_destroy` callback
2. Update `CampaignMembershipsController#destroy` with current campaign check
3. Write backend unit tests
4. Verify backend behavior via API testing

### Phase 2: Frontend Integration  
1. Update `CampaignsList` component to handle current campaign clearing
2. Update `ProfilePageClient` to pass current campaign context
3. Write frontend component tests
4. Verify frontend behavior via component testing

### Phase 3: Integration and Validation
1. Create end-to-end test script
2. Test full user flow with both active and non-active campaign leaving
3. Verify data consistency between backend and frontend
4. Performance testing for any potential impacts

## Performance Considerations

### Backend Performance
- Additional database query to check `current_campaign_id` during leave operation
- Impact: Negligible - single indexed lookup on user table
- CurrentCampaign service already handles database and Redis updates efficiently

### Frontend Performance  
- Additional prop passing to CampaignsList component
- Additional context access for current campaign checking
- Impact: Negligible - simple object reference comparisons
- No additional API calls or heavy operations

### Network Performance
- No additional API calls required
- Existing leave campaign API call handles all backend logic
- Frontend state management is local to component

## Security Considerations

### Data Integrity
- Ensures user's current campaign reference is always valid
- Prevents access attempts to campaigns user has left
- Maintains referential integrity between User and Campaign models

### Access Control
- No changes to existing authorization logic
- Users can still only leave campaigns they're members of
- Current campaign clearing only happens for the leaving user

### Information Disclosure
- No additional information exposure
- Current campaign status already visible to user
- Clearing operation only affects the user's own state

## Rollback Plan

If issues are discovered after deployment:

### Backend Rollback
1. Comment out current campaign check in `CampaignMembershipsController#destroy`
2. Remove `after_destroy` callback from `CampaignMembership` model
3. Deploy hotfix to restore previous behavior
4. Investigate and fix issues before re-deployment

### Frontend Rollback
1. Remove `currentCampaign` prop from `CampaignsList` component
2. Remove `setCurrentCampaign(null)` call from leave handler
3. Deploy frontend hotfix
4. Backend will still clear state, but frontend won't immediately reflect it

### Data Cleanup
- No data migration needed for rollback
- Users with cleared current campaigns can select new ones normally
- No permanent data loss or corruption possible

## Success Metrics

### Functional Metrics
- Zero reports of users being "stuck" in campaigns they've left
- Current campaign consistency between backend and frontend at 100%
- Leave campaign operation success rate remains at current levels

### User Experience Metrics  
- No user confusion about campaign status after leaving
- Immediate UI feedback when leaving current campaign
- Smooth user flow for selecting new current campaign after leaving

### Technical Metrics
- No performance degradation in leave campaign operations
- No increase in campaign-related API errors
- Maintained system reliability and data consistency

This specification provides a comprehensive plan for implementing automatic current campaign clearing when users leave their active campaign, ensuring data consistency and optimal user experience.