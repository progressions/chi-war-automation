# Campaign Invitation System Integration Specification

**Date**: 2025-08-20  
**Status**: Approved  
**Version**: 1.0

## Executive Summary

This specification defines the integration of the existing invitation infrastructure into the Campaign Show page, replacing the current direct user addition system with a professional email-based invitation workflow. The implementation will reuse existing components and patterns while creating a seamless invitation management experience for gamemasters.

## Goals

1. **Replace direct user addition** with invitation-based membership system
2. **Utilize existing infrastructure** (models, mailers, API clients)
3. **Maintain UI consistency** by reusing existing components
4. **Provide comprehensive testing** with Rails specs and Playwright E2E tests
5. **Create foundation** for future invitation redemption system

## Technical Architecture

### Backend Architecture

#### API v2 Invitations Controller
```ruby
# app/controllers/api/v2/invitations_controller.rb
class Api::V2::InvitationsController < ApplicationController
  before_action :authenticate_user!
  before_action :require_current_campaign
  before_action :require_gamemaster, only: [:create, :destroy, :resend]
  before_action :set_invitation, only: [:destroy, :resend]
  
  # GET /api/v2/invitations
  # Returns pending invitations for current campaign
  def index
    @invitations = current_campaign.invitations
                                  .includes(:pending_user)
                                  .order(created_at: :desc)
    render json: @invitations, each_serializer: InvitationSerializer
  end
  
  # POST /api/v2/invitations
  # Creates new invitation and sends email
  def create
    @invitation = current_user.invitations.build(invitation_params)
    @invitation.campaign = current_campaign
    @invitation.pending_user = User.find_by(email: @invitation.email)
    
    if @invitation.save
      UserMailer.with(invitation: @invitation).invitation.deliver_later!
      render json: @invitation, serializer: InvitationSerializer, status: :created
    else
      render json: { errors: @invitation.errors }, status: :unprocessable_entity
    end
  end
  
  # POST /api/v2/invitations/:id/resend
  # Resends invitation email
  def resend
    UserMailer.with(invitation: @invitation).invitation.deliver_later!
    render json: @invitation, serializer: InvitationSerializer
  end
  
  # DELETE /api/v2/invitations/:id
  # Cancels pending invitation
  def destroy
    @invitation.destroy!
    head :no_content
  end
  
  private
  
  def set_invitation
    @invitation = current_campaign.invitations.find(params[:id])
  end
  
  def invitation_params
    params.require(:invitation).permit(:email)
  end
  
  def require_gamemaster
    unless current_user.gamemaster? || current_campaign.user_id == current_user.id
      render json: { error: "Unauthorized" }, status: :forbidden
    end
  end
end
```

#### Routes Configuration
```ruby
# config/routes.rb
namespace :api do
  namespace :v2 do
    resources :invitations, only: [:index, :create, :destroy] do
      member do
        post :resend
      end
    end
    # ... existing routes
  end
end
```

#### Invitation Serializer
```ruby
# app/serializers/invitation_serializer.rb
class InvitationSerializer < ActiveModel::Serializer
  attributes :id, :email, :created_at, :updated_at
  
  belongs_to :user, serializer: UserSerializer # gamemaster who sent
  belongs_to :pending_user, serializer: UserSerializer, if: :pending_user?
  belongs_to :campaign, serializer: CampaignLiteSerializer
  
  def pending_user?
    object.pending_user.present?
  end
end
```

### Frontend Architecture

#### Component Structure
```
src/components/
├── invitations/
│   ├── InvitationManager.tsx    # Main invitation management component
│   ├── InvitationForm.tsx       # Email input and send form
│   ├── InvitationList.tsx       # List of pending invitations
│   └── index.ts                 # Exports
├── badges/
│   └── InvitationBadge.tsx      # Badge display for invitations
└── campaigns/
    └── Show.tsx                  # Updated to use InvitationManager
```

#### InvitationManager Component
```typescript
// src/components/invitations/InvitationManager.tsx
"use client"

import { useState, useEffect } from "react"
import { Box, Stack, TextField, Button, Alert } from "@mui/material"
import { SectionHeader, Icon, ManageButton } from "@/components/ui"
import { InvitationList } from "./InvitationList"
import { useClient, useToast } from "@/contexts"
import type { Campaign, Invitation } from "@/types"

interface InvitationManagerProps {
  campaign: Campaign
  onUpdate: (campaign: Campaign) => void
}

export function InvitationManager({ campaign, onUpdate }: InvitationManagerProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { client } = useClient()
  const { toastSuccess, toastError } = useToast()

  useEffect(() => {
    if (open) {
      fetchInvitations()
    }
  }, [open])

  const fetchInvitations = async () => {
    try {
      const response = await client.getInvitations()
      setInvitations(response.data.invitations || [])
    } catch (error) {
      console.error("Failed to fetch invitations:", error)
    }
  }

  const handleSendInvitation = async () => {
    if (!email) {
      setError("Please enter an email address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await client.createInvitation({ email })
      setInvitations([response.data, ...invitations])
      setEmail("")
      toastSuccess(`Invitation sent to ${email}`)
    } catch (error: any) {
      const message = error.response?.data?.errors?.email?.[0] || 
                     "Failed to send invitation"
      setError(message)
      toastError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (invitation: Invitation) => {
    try {
      await client.resendInvitation(invitation.id)
      toastSuccess(`Invitation resent to ${invitation.email}`)
    } catch (error) {
      toastError("Failed to resend invitation")
    }
  }

  const handleCancel = async (invitation: Invitation) => {
    try {
      await client.deleteInvitation(invitation.id)
      setInvitations(invitations.filter(i => i.id !== invitation.id))
      toastSuccess("Invitation cancelled")
    } catch (error) {
      toastError("Failed to cancel invitation")
    }
  }

  const actionButton = (
    <ManageButton open={open} onClick={setOpen} />
  )

  return (
    <Box sx={{ my: 4 }}>
      <SectionHeader
        title="Members"
        icon={<Icon keyword="User" size="24" />}
        actions={actionButton}
        sx={{ mb: 2 }}
      >
        Manage campaign members and pending invitations
      </SectionHeader>

      {open && (
        <Stack spacing={2}>
          {/* Invitation Form */}
          <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Enter email address to invite"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendInvitation()}
                error={!!error}
                helperText={error}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={handleSendInvitation}
                disabled={loading || !email}
              >
                Send Invitation
              </Button>
            </Stack>
          </Box>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Pending Invitations ({invitations.length})
              </Typography>
              <InvitationList
                invitations={invitations}
                onResend={handleResend}
                onCancel={handleCancel}
              />
            </Box>
          )}

          {/* Existing Members */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Current Members ({campaign.players?.length || 0})
            </Typography>
            <BadgeList
              items={campaign.players || []}
              collection="users"
              open={false}
              meta={{ current_page: 1, total_pages: 1 }}
              handleDelete={() => {}}
              handlePageChange={() => {}}
            />
          </Box>
        </Stack>
      )}
    </Box>
  )
}
```

#### InvitationBadge Component
```typescript
// src/components/badges/InvitationBadge.tsx
"use client"

import { Badge } from "@/components/badges"
import { IconButton, Stack, Chip } from "@mui/material"
import { Email as EmailIcon, Cancel as CancelIcon } from "@mui/icons-material"
import type { Invitation } from "@/types"
import { formatDistanceToNow } from "date-fns"

interface InvitationBadgeProps {
  invitation: Invitation
  onResend: (invitation: Invitation) => void
  onCancel: (invitation: Invitation) => void
}

export function InvitationBadge({ 
  invitation, 
  onResend, 
  onCancel 
}: InvitationBadgeProps) {
  const timeSince = formatDistanceToNow(new Date(invitation.created_at), 
    { addSuffix: true })

  return (
    <Badge
      entity={{ 
        name: invitation.email, 
        email: invitation.email,
        id: invitation.id 
      }}
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{invitation.email}</span>
          <Chip 
            label="Pending" 
            size="small" 
            color="warning" 
            variant="outlined" 
          />
        </Stack>
      }
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <span>Invited {timeSince}</span>
        <IconButton 
          size="small" 
          onClick={() => onResend(invitation)}
          title="Resend invitation"
        >
          <EmailIcon fontSize="small" />
        </IconButton>
        <IconButton 
          size="small" 
          color="error"
          onClick={() => onCancel(invitation)}
          title="Cancel invitation"
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Badge>
  )
}
```

### API Client Updates
```typescript
// src/lib/client/invitationClient.ts
import { AxiosResponse } from "axios"
import { createBaseClient } from "@/lib/client/baseClient"
import type { Invitation } from "@/types"

interface ClientDependencies {
  jwt?: string
  apiV2: import("@/lib").ApiV2
}

export function createInvitationClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { get, post, delete_ } = createBaseClient(deps)

  async function getInvitations(): Promise<AxiosResponse<{ invitations: Invitation[] }>> {
    return get(apiV2.invitations())
  }

  async function createInvitation(data: { email: string }): Promise<AxiosResponse<Invitation>> {
    return post(apiV2.invitations(), { invitation: data })
  }

  async function resendInvitation(id: string): Promise<AxiosResponse<Invitation>> {
    return post(`${apiV2.invitations()}/${id}/resend`)
  }

  async function deleteInvitation(id: string): Promise<AxiosResponse<void>> {
    return delete_(`${apiV2.invitations()}/${id}`)
  }

  return {
    getInvitations,
    createInvitation,
    resendInvitation,
    deleteInvitation
  }
}
```

## Testing Strategy

### Rails RSpec Tests

#### Invitations Controller Spec
```ruby
# spec/requests/api/v2/invitations/invitations_spec.rb
require "rails_helper"

RSpec.describe "Api::V2::Invitations", type: :request do
  before(:each) do
    User.destroy_all
    Campaign.destroy_all
    Invitation.destroy_all
    
    @gamemaster = User.create!(
      email: "gamemaster@example.com",
      gamemaster: true,
      confirmed_at: Time.now
    )
    @player = User.create!(
      email: "player@example.com", 
      confirmed_at: Time.now
    )
    @campaign = @gamemaster.campaigns.create!(
      name: "Test Campaign",
      description: "Campaign for testing invitations"
    )
    
    @gamemaster_headers = Devise::JWT::TestHelpers.auth_headers({}, @gamemaster)
    @player_headers = Devise::JWT::TestHelpers.auth_headers({}, @player)
    
    set_current_campaign(@gamemaster, @campaign)
  end

  describe "POST /api/v2/invitations" do
    context "as gamemaster" do
      it "creates invitation and sends email" do
        expect {
          post "/api/v2/invitations", 
               params: { invitation: { email: "newplayer@example.com" } },
               headers: @gamemaster_headers
        }.to change { Invitation.count }.by(1)
          .and have_enqueued_mail(UserMailer, :invitation)
        
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["email"]).to eq("newplayer@example.com")
      end

      it "prevents duplicate invitations" do
        @campaign.invitations.create!(
          user: @gamemaster,
          email: "existing@example.com"
        )
        
        post "/api/v2/invitations",
             params: { invitation: { email: "existing@example.com" } },
             headers: @gamemaster_headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]["email"]).to include("has already been taken")
      end

      it "prevents inviting existing members" do
        @campaign.players << @player
        
        post "/api/v2/invitations",
             params: { invitation: { email: @player.email } },
             headers: @gamemaster_headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]["email"]).to include("is already a player")
      end
    end

    context "as player" do
      it "returns forbidden" do
        post "/api/v2/invitations",
             params: { invitation: { email: "someone@example.com" } },
             headers: @player_headers
        
        expect(response).to have_http_status(:forbidden)
      end
    end
  end

  describe "GET /api/v2/invitations" do
    before do
      @invitation1 = @campaign.invitations.create!(
        user: @gamemaster,
        email: "player1@example.com"
      )
      @invitation2 = @campaign.invitations.create!(
        user: @gamemaster,
        email: "player2@example.com"
      )
    end

    it "returns campaign invitations" do
      get "/api/v2/invitations", headers: @gamemaster_headers
      
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(2)
      emails = body.map { |i| i["email"] }
      expect(emails).to contain_exactly("player1@example.com", "player2@example.com")
    end
  end

  describe "POST /api/v2/invitations/:id/resend" do
    before do
      @invitation = @campaign.invitations.create!(
        user: @gamemaster,
        email: "player@example.com"
      )
    end

    it "resends invitation email" do
      expect {
        post "/api/v2/invitations/#{@invitation.id}/resend",
             headers: @gamemaster_headers
      }.to have_enqueued_mail(UserMailer, :invitation)
      
      expect(response).to have_http_status(:ok)
    end
  end

  describe "DELETE /api/v2/invitations/:id" do
    before do
      @invitation = @campaign.invitations.create!(
        user: @gamemaster,
        email: "player@example.com"
      )
    end

    it "cancels invitation" do
      expect {
        delete "/api/v2/invitations/#{@invitation.id}",
               headers: @gamemaster_headers
      }.to change { Invitation.count }.by(-1)
      
      expect(response).to have_http_status(:no_content)
    end
  end
end
```

### Playwright E2E Test

```javascript
// test-scripts/test-campaign-invitations.js
const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting Campaign Invitation Test');

    // Step 1: Login as gamemaster
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });

    // Step 2: Navigate to campaign page
    console.log('📍 Navigating to campaigns page...');
    await page.goto('http://localhost:3001/campaigns');
    await page.waitForLoadState('networkidle');

    // Find and click on Test Campaign
    const campaignCard = page.locator('text=Test Campaign').first();
    await campaignCard.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to Test Campaign');

    // Step 3: Open Members manager
    console.log('👥 Opening Members manager...');
    const manageButton = page.locator('button:has-text("Manage")').first();
    await manageButton.click();
    await page.waitForTimeout(1000);

    // Step 4: Send invitation
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`📧 Sending invitation to ${testEmail}...`);
    
    const emailInput = page.locator('input[placeholder*="email"]');
    await emailInput.fill(testEmail);
    
    const sendButton = page.locator('button:has-text("Send Invitation")');
    await sendButton.click();

    // Wait for success message
    await page.waitForSelector(`text=Invitation sent to ${testEmail}`, { timeout: 5000 });
    console.log('✅ Invitation sent successfully');

    // Step 5: Verify invitation appears in list
    const invitationBadge = page.locator(`text=${testEmail}`);
    await expect(invitationBadge).toBeVisible();
    console.log('✅ Invitation appears in pending list');

    // Step 6: Test resend functionality
    console.log('🔄 Testing resend functionality...');
    const resendButton = invitationBadge.locator('button[title*="Resend"]').first();
    await resendButton.click();
    
    await page.waitForSelector('text=Invitation resent', { timeout: 5000 });
    console.log('✅ Resend successful');

    // Step 7: Test cancel functionality
    console.log('❌ Testing cancel functionality...');
    const cancelButton = invitationBadge.locator('button[title*="Cancel"]').first();
    await cancelButton.click();

    // Confirm cancellation if dialog appears
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible({ timeout: 1000 })) {
      await confirmButton.click();
    }

    await page.waitForSelector('text=Invitation cancelled', { timeout: 5000 });
    console.log('✅ Cancel successful');

    // Step 8: Verify backend state via API
    console.log('🔍 Verifying backend state...');
    const apiResponse = await page.evaluate(async () => {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:3000/api/v2/invitations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.json();
    });

    console.log(`📊 Backend shows ${apiResponse.length} pending invitations`);

    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/invitation-test-complete.png', 
      fullPage: true 
    });

    console.log('✅ All invitation tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: 'test-results/invitation-test-error.png', 
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
})();
```

## Implementation Phases

### Phase 1: Backend Implementation (2 hours)
1. Create API v2 invitations controller
2. Add routes configuration
3. Create/update serializers
4. Write and run RSpec tests
5. Verify email delivery in development

### Phase 2: Frontend Components (3 hours)
1. Create InvitationBadge component
2. Create InvitationManager component
3. Create InvitationForm component
4. Create InvitationList component
5. Update Campaign Show page
6. Update API client

### Phase 3: Integration Testing (2 hours)
1. Manual testing of complete flow
2. Run Playwright E2E tests
3. Test error scenarios
4. Verify mobile responsiveness
5. Cross-browser testing

### Phase 4: Documentation & Polish (1 hour)
1. Update API documentation
2. Create user guide for invitation system
3. Add loading states and error handling
4. Performance optimization
5. Final QA pass

## Success Criteria

### Functional Requirements
- ✅ Gamemasters can send invitations by email
- ✅ Duplicate invitations are prevented
- ✅ Existing members cannot be invited
- ✅ Invitations can be resent
- ✅ Invitations can be cancelled
- ✅ Email notifications are sent
- ✅ UI shows both members and invitations

### Non-Functional Requirements
- ✅ Response time < 200ms for invitation creation
- ✅ Email delivery within 30 seconds
- ✅ Mobile responsive design
- ✅ Accessible UI with ARIA labels
- ✅ 90%+ test coverage
- ✅ Consistent with existing UI patterns

### Quality Metrics
- Zero regression in existing functionality
- All tests passing (RSpec and Playwright)
- No console errors in production
- Proper error messages for all failure scenarios
- Clean code following Rails and React best practices

## Future Enhancements

### Invitation Redemption System (Next Issue)
- Public redemption endpoint
- User registration through invitation
- Automatic campaign membership on acceptance
- Redemption tracking and analytics
- Expiration dates for invitations

### Advanced Features
- Bulk invitation sending
- Invitation templates
- Role assignment during invitation
- Custom invitation messages
- Invitation reminders
- Analytics dashboard for invitation metrics

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email delivery failures | High | Implement retry logic, provide manual resend |
| Duplicate invitation attempts | Medium | Database constraints, clear error messages |
| Performance with many invitations | Low | Pagination, database indexing |
| User confusion about process | Medium | Clear UI labels, help text, success messages |

## Approval and Sign-off

This specification has been reviewed and approved for implementation.

**Approved by**: User  
**Date**: 2025-08-20  
**Version**: 1.0

---

## Appendix A: Database Schema

Existing invitation table structure (no changes needed):
```sql
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  pending_user_id UUID REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  maximum_count INTEGER,
  remaining_count INTEGER,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  UNIQUE(campaign_id, email)
);

CREATE INDEX idx_invitations_campaign_id ON invitations(campaign_id);
CREATE INDEX idx_invitations_email ON invitations(email);
```

## Appendix B: Email Template

Existing email template (no changes needed):
```erb
<!-- app/views/user_mailer/invitation.html.erb -->
<p>Hello,</p>

<p>You have been invited to join <%= @campaign.name %>!</p>

<p><%= link_to("Accept Invitation", "#{@root_url}/invitations/#{@invitation.id}/redeem") %></p>

<p>This invitation was sent by <%= @invitation.user.name %>.</p>

<p>If you don't have an account yet, you'll be able to create one when you accept the invitation.</p>

<p>Best regards,<br>
The Chi War Team</p>
```