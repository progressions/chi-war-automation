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
  @campaign = current_user.campaigns.find_by(id: params[:campaign_id])

  if @campaign
    # Current user is the Gamemaster, removing a player from their campaign
    @scoped_memberships = @campaign.campaign_memberships
  else
    # Current user is a player, removing their own membership from a campaign
    @campaign = Campaign.find_by(id: params[:campaign_id])
    
    # NEW: Prevent gamemasters from leaving their own campaigns
    if @campaign&.user_id == current_user.id
      render json: { error: "Gamemasters cannot leave their own campaigns. Transfer ownership or archive the campaign instead." }, status: :forbidden
      return
    end
    
    @scoped_memberships = current_user.campaign_memberships
  end
  
  @campaign_membership = @scoped_memberships.find_by(campaign_id: params[:campaign_id], user_id: params[:user_id])

  if @campaign_membership
    # NEW: Use database transaction for data consistency
    ActiveRecord::Base.transaction do
      # NEW: Check if leaving campaign is user's current campaign
      user = User.find(params[:user_id])
      leaving_current_campaign = user.current_campaign_id == params[:campaign_id]
      
      @campaign_membership.destroy!
      
      # NEW: Clear current campaign if user is leaving their active campaign
      if leaving_current_campaign
        CurrentCampaign.set(user: user, campaign: nil)
      end
      
      # NEW: Broadcast campaign update to notify all connected clients
      @campaign.broadcast_campaign_update
      
      user = User.find(params[:user_id])
      UserMailer.with(user: user).removed_from_campaign.deliver_later!
      render :ok
    rescue => e
      Rails.logger.error "Failed to remove user from campaign: #{e.message}"
      render json: { error: "Failed to leave campaign. Please try again." }, status: :internal_server_error
      raise ActiveRecord::Rollback
    end
  else
    render status: 404
  end
end
```

**Behavior**:
- **Gamemaster Protection**: Prevents campaign owners from leaving their own campaigns
- **Transaction Safety**: Wraps all operations in a database transaction for consistency
- **Current Campaign Clearing**: Checks if leaving campaign matches user's `current_campaign_id`
- **State Management**: Calls `CurrentCampaign.set(user: user, campaign: nil)` to clear database and Redis
- **Real-time Updates**: Uses `broadcast_campaign_update` to notify all connected clients via ActionCable
- **Error Handling**: Properly handles failures with rollback and user-friendly error messages

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
    return unless user&.current_campaign_id == campaign_id
    
    begin
      CurrentCampaign.set(user: user, campaign: nil)
      Rails.logger.info "Cleared current campaign for user #{user.id} after membership destruction"
    rescue => e
      Rails.logger.error "Failed to clear current campaign in callback: #{e.message}"
      # Don't re-raise - this is a safety net, not critical path
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
1. **Cross-Tab Synchronization**: User has multiple tabs open when leaving a campaign
   - Solution: The existing ActionCable CampaignChannel subscription in AppContext receives broadcast updates
   - All tabs will automatically update their campaign data when `broadcast_campaign_update` is called
   - React Context is NOT shared across tabs - each tab maintains its own state

2. **Network Failure**: Leave campaign API succeeds but frontend state update fails
   - Solution: The ActionCable broadcast ensures all clients receive the update
   - On reconnection or page refresh, the frontend will sync with authoritative backend state
   - Frontend polls current campaign state to detect and recover from desync

3. **Component Unmounting**: User navigates away during leave operation
   - Solution: API call completes in background, ActionCable broadcasts the update
   - When user returns, AppContext will have the correct state via broadcast subscription
   - No manual cleanup needed due to automatic broadcast system

4. **Gamemaster Protection Error**: User tries to leave their own campaign
   - Solution: Backend returns 403 Forbidden with clear error message
   - Frontend displays error toast: "Gamemasters cannot leave their own campaigns"
   - UI should potentially hide or disable the leave button for owned campaigns

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
    
    it "broadcasts campaign update to all connected clients" do
      user.update(current_campaign: campaign)
      expect(campaign).to receive(:broadcast_campaign_update)
      
      delete :destroy, params: { campaign_id: campaign.id, user_id: user.id }
    end
  end
  
  context "when leaving non-current campaign" do
    it "does not change the user's current campaign" do
      user.update(current_campaign: other_campaign)
      delete :destroy, params: { campaign_id: campaign.id, user_id: user.id }
      
      expect(user.reload.current_campaign).to eq(other_campaign)
    end
  end
  
  context "when gamemaster tries to leave their own campaign" do
    it "prevents the action with forbidden status" do
      delete :destroy, params: { campaign_id: campaign.id, user_id: campaign.user_id }
      
      expect(response).to have_http_status(:forbidden)
      expect(JSON.parse(response.body)['error']).to include('Gamemasters cannot leave')
    end
    
    it "does not destroy the membership" do
      membership_count = campaign.campaign_memberships.count
      delete :destroy, params: { campaign_id: campaign.id, user_id: campaign.user_id }
      
      expect(campaign.campaign_memberships.count).to eq(membership_count)
    end
  end
  
  context "when database error occurs" do
    it "rolls back the transaction and returns error" do
      user.update(current_campaign: campaign)
      allow(CurrentCampaign).to receive(:set).and_raise(StandardError, "Database error")
      
      delete :destroy, params: { campaign_id: campaign.id, user_id: user.id }
      
      expect(response).to have_http_status(:internal_server_error)
      expect(user.campaign_memberships.find_by(campaign: campaign)).to be_present
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
  
  it "does not clear current campaign when destroying non-current campaign membership" do
    user.update(current_campaign: other_campaign)
    membership = user.campaign_memberships.find_by(campaign: campaign)
    
    membership.destroy
    
    expect(user.reload.current_campaign).to eq(other_campaign)
  end
  
  it "handles errors gracefully without raising" do
    user.update(current_campaign: campaign)
    membership = user.campaign_memberships.find_by(campaign: campaign)
    allow(CurrentCampaign).to receive(:set).and_raise(StandardError, "Service error")
    
    expect { membership.destroy }.not_to raise_error
    expect(user.reload.current_campaign).to eq(campaign) # Unchanged due to error
  end
  
  it "logs errors when current campaign clearing fails" do
    user.update(current_campaign: campaign)
    membership = user.campaign_memberships.find_by(campaign: campaign)
    allow(CurrentCampaign).to receive(:set).and_raise(StandardError, "Service error")
    allow(Rails.logger).to receive(:error)
    
    membership.destroy
    
    expect(Rails.logger).to have_received(:error).with(/Failed to clear current campaign in callback/)
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
  
  describe("when leaving non-current campaign", () => {
    it("does not clear the current campaign", async () => {
      const setCurrentCampaign = jest.fn()
      const currentCampaign = { id: "campaign_456", name: "Other Campaign" }
      const leavingCampaign = { id: "campaign_123", name: "Leaving Campaign" }
      
      render(<CampaignsList 
        user={user} 
        onUserUpdate={jest.fn()}
        currentCampaign={currentCampaign}
      />)
      
      // ... simulate leaving leavingCampaign ...
      
      expect(setCurrentCampaign).not.toHaveBeenCalled()
    })
  })
  
  describe("when gamemaster tries to leave own campaign", () => {
    it("displays error message and does not call API", async () => {
      const toastError = jest.fn()
      const removePlayer = jest.fn().mockRejectedValue({ 
        response: { status: 403, data: { error: "Gamemasters cannot leave their own campaigns" }}
      })
      
      // ... simulate gamemaster trying to leave own campaign ...
      
      expect(removePlayer).toHaveBeenCalled()
      expect(toastError).toHaveBeenCalledWith("Gamemasters cannot leave their own campaigns")
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
  // 6. Verify ActionCable broadcast updates all connected clients
  // 7. Verify user can select new current campaign
}

async function testGamemasterProtection() {
  // 1. Set up gamemaster user with their own campaign
  // 2. Navigate to profile page
  // 3. Attempt to leave own campaign
  // 4. Verify error message is displayed
  // 5. Verify campaign membership is not removed
  // 6. Verify current campaign remains unchanged
}

async function testCrossTabSynchronization() {
  // 1. Open application in two browser tabs
  // 2. Set current campaign in tab 1
  // 3. Leave current campaign in tab 2
  // 4. Verify tab 1 automatically updates to show no active campaign
  // 5. Verify ActionCable broadcast synchronizes both tabs
}

async function testTransactionRollback() {
  // 1. Mock CurrentCampaign.set to fail
  // 2. Attempt to leave current campaign
  // 3. Verify campaign membership is not removed (rollback)
  // 4. Verify error message is displayed to user
  // 5. Verify current campaign remains unchanged
}
```

## Implementation Order

### Phase 1: Backend Foundation
1. **Update `CampaignMembership` model** with `after_destroy` callback and error handling
2. **Update `CampaignMembershipsController#destroy`** with:
   - Gamemaster protection logic
   - Database transaction wrapping
   - Current campaign clearing logic
   - ActionCable broadcasting
   - Comprehensive error handling
3. **Write backend unit tests** for all new behaviors
4. **Verify backend behavior** via API testing and manual testing

### Phase 2: Frontend Integration  
1. **Update `CampaignsList` component** to:
   - Handle current campaign clearing in frontend state
   - Display appropriate error messages for gamemaster protection
   - Handle API errors gracefully with user feedback
2. **Update `ProfilePageClient`** to pass current campaign context
3. **Add frontend error handling** for 403 Forbidden responses
4. **Write comprehensive frontend component tests**
5. **Verify frontend behavior** via component testing and manual testing

### Phase 3: Integration and Validation
1. **Create comprehensive end-to-end test scripts**:
   - Leave current campaign flow
   - Gamemaster protection testing
   - Cross-tab synchronization verification
   - Transaction rollback testing
2. **Test real-time ActionCable broadcasting** across multiple clients
3. **Verify data consistency** between backend database and frontend state
4. **Load testing** for ActionCable broadcast performance under high user load
5. **User acceptance testing** with actual users to verify UX flows

## Performance Considerations

### Backend Performance
- **Database Operations**: Additional `current_campaign_id` lookup during leave (indexed, fast)
- **Transaction Overhead**: Minimal impact from wrapping operations in database transaction
- **ActionCable Broadcasting**: Uses existing `broadcast_campaign_update` infrastructure
- **Redis Operations**: CurrentCampaign service already optimized for Redis read/write
- **Impact Assessment**: Negligible performance impact, all operations are lightweight

### Frontend Performance  
- **Component Props**: Additional `currentCampaign` prop passed to CampaignsList
- **Context Access**: Uses existing AppContext, no additional overhead
- **State Comparisons**: Simple object ID comparisons, very fast
- **ActionCable Reception**: Uses existing CampaignChannel subscription
- **Impact Assessment**: No measurable performance impact on frontend operations

### Network Performance
- **API Calls**: No additional API calls required, existing endpoint enhanced
- **ActionCable Traffic**: Minimal increase in broadcast frequency (only on membership changes)
- **WebSocket Usage**: Leverages existing ActionCable infrastructure efficiently
- **Impact Assessment**: Network usage remains essentially unchanged

### Broadcasting Performance Under Load
- **High User Count**: ActionCable can handle hundreds of concurrent connections per campaign
- **Broadcast Efficiency**: Single broadcast triggers update for all connected campaign members
- **Memory Usage**: Each broadcast creates temporary job, cleaned up automatically
- **Monitoring**: Existing ActionCable performance monitoring applies

## Security Considerations

### Data Integrity
- **Referential Integrity**: Database transactions ensure consistent state across all operations
- **Current Campaign Validity**: Guarantees user's current campaign reference is always valid
- **Membership Consistency**: Prevents orphaned current campaign references after leaving
- **Rollback Protection**: Transaction rollback prevents partial state corruption

### Access Control  
- **Existing Authorization**: No changes to current campaign membership authorization rules
- **Gamemaster Protection**: New security rule prevents campaign owners from leaving own campaigns
- **Self-Service Only**: Users can only modify their own current campaign status
- **Admin Override**: Existing admin permissions remain unchanged for emergency situations

### Information Disclosure
- **No New Exposure**: No additional information exposed beyond existing campaign membership data
- **User Scope**: Current campaign clearing only affects the leaving user's state
- **Privacy Maintained**: Other users' current campaign settings remain private
- **Audit Trail**: Database and application logs track campaign leaving actions for security

### ActionCable Security
- **Channel Authorization**: Existing CampaignChannel authorization prevents unauthorized access
- **Broadcast Scope**: Campaign updates only sent to authorized campaign members
- **Connection Security**: Leverages existing JWT-based ActionCable authentication
- **Data Filtering**: Broadcasts only contain appropriate campaign data, no sensitive information

### Attack Vector Analysis
- **Campaign Takeover**: Gamemaster protection prevents hostile takeover via forced GM removal
- **State Manipulation**: Transaction safety prevents race condition exploits
- **DoS Prevention**: Rate limiting on campaign operations (existing) applies to leave actions
- **SQL Injection**: Parameterized queries and ActiveRecord protect against injection attacks

## Rollback Plan

If critical issues are discovered after deployment:

### Immediate Rollback Steps
1. **Feature Flag Disable** (if implemented): Turn off current campaign clearing via feature flag
2. **Backend Hotfix**: Comment out transaction block, revert to original controller logic
3. **Monitor Impact**: Check for any data consistency issues from partial rollback
4. **Communication**: Notify team and users of temporary rollback if user-facing

### Backend Rollback Process
1. **Controller Reversion**:
   - Remove transaction wrapper from `CampaignMembershipsController#destroy`
   - Comment out gamemaster protection check
   - Disable current campaign clearing logic
   - Keep ActionCable broadcasting (safe to leave enabled)
2. **Model Safety**: Leave `after_destroy` callback in place as safety net
3. **Deploy Hotfix**: Fast deployment of controller changes only
4. **Verify Behavior**: Test that campaign leaving works with original behavior

### Frontend Rollback Process  
1. **Component Reversion**:
   - Remove `currentCampaign` prop from `CampaignsList` component
   - Remove `setCurrentCampaign(null)` call from leave handler
   - Remove gamemaster error handling
2. **Deploy Frontend**: Independent frontend deployment
3. **Graceful Degradation**: ActionCable broadcasts still work, just no immediate frontend clearing

### Data Cleanup and Recovery
- **No Migration Needed**: All changes are additive, no schema changes to revert
- **Orphaned State**: Users with cleared current campaigns can select new ones normally
- **No Data Loss**: Campaign memberships and user data remain intact
- **Redis Cleanup**: CurrentCampaign service handles Redis cleanup automatically

### Post-Rollback Investigation
1. **Log Analysis**: Review Rails logs and ActionCable logs for error patterns
2. **Performance Monitoring**: Check if performance issues caused the rollback need
3. **User Impact Assessment**: Survey affected users for UX issues
4. **Root Cause Analysis**: Identify and fix underlying issues before re-deployment

### Re-deployment Strategy
1. **Staged Rollout**: Re-enable feature for small user subset first
2. **Monitoring Dashboard**: Real-time monitoring of key metrics during re-rollout
3. **Quick Rollback Readiness**: Keep rollback scripts ready during re-deployment
4. **User Communication**: Clear communication about feature restoration

## Success Metrics

### Functional Metrics
- **Zero Orphaned References**: No reports of users "stuck" in campaigns they've left
- **Data Consistency**: 100% consistency between backend `current_campaign_id` and frontend state
- **Operation Success**: Leave campaign success rate maintains current 99%+ levels
- **Gamemaster Protection**: 100% prevention of gamemasters leaving own campaigns
- **Transaction Integrity**: Zero partial-failure states due to rollback protection

### User Experience Metrics  
- **User Confusion**: Zero support tickets about confusing campaign status after leaving
- **UI Responsiveness**: Immediate feedback when leaving current campaign (< 500ms)
- **Cross-Tab Sync**: Real-time updates across all browser tabs (< 2 seconds)
- **Error Clarity**: Clear, actionable error messages for all failure scenarios
- **Recovery Flow**: Smooth user experience when selecting new current campaign

### Technical Metrics
- **Performance Impact**: < 50ms additional latency for leave campaign operations
- **Error Rate**: No increase in campaign-related API errors from baseline
- **ActionCable Load**: < 5% increase in broadcast traffic per campaign
- **Transaction Overhead**: < 10ms additional database time for transaction wrapping
- **System Reliability**: Maintained 99.9% uptime during and after deployment

### Monitoring and Alerting
- **Campaign State Mismatches**: Alert if backend/frontend state diverges
- **Failed Transactions**: Alert on rollback frequency exceeding 1% of operations
- **ActionCable Performance**: Monitor broadcast latency and delivery success
- **Gamemaster Protection**: Track blocked attempts to leave own campaigns
- **User Flow Completion**: Monitor successful campaign selection after leaving

This comprehensive specification provides a robust foundation for implementing automatic current campaign clearing when users leave their active campaign, ensuring data consistency, security, and optimal user experience while maintaining system performance and reliability.