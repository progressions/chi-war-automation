# Campaign Invitation Redemption System Specification

**Date**: 2025-08-20  
**Status**: In Development  
**Version**: 1.0  
**Related Issue**: `2025-08-20-complete-invitation-redemption-system.md`

## Executive Summary

This specification defines the complete invitation redemption flow that allows users to accept campaign invitations via email links. Building on the existing invitation creation system, this implementation provides a seamless end-to-end experience from invitation email to campaign membership, utilizing modern v2 API endpoints and Next.js App Router patterns.

## Goals

1. **Complete the invitation workflow** by implementing the user-facing redemption flow
2. **Modernize redemption system** by migrating from v1 to v2 API endpoints  
3. **Enhance email presentation** with improved invitation email templates
4. **Provide seamless UX** with proper authentication handling and error states
5. **Enable real-time updates** for gamemasters when invitations are redeemed
6. **Ensure comprehensive testing** with unit tests, integration tests, and E2E validation

## Technical Architecture

### Backend Implementation (Rails)

#### API v2 Invitations Controller Enhancement
```ruby
# app/controllers/api/v2/invitations_controller.rb
class Api::V2::InvitationsController < ApplicationController
  # Existing actions: index, create, destroy, resend
  
  # POST /api/v2/invitations/:id/redeem
  # Redeems invitation and adds user to campaign
  def redeem
    @invitation = Invitation.find(params[:id])
    
    # Validation
    return render json: { error: "Invitation not found" }, status: :not_found unless @invitation
    return render json: { error: "Campaign no longer exists" }, status: :unprocessable_entity unless @invitation.campaign
    
    # Check if user already in campaign
    if @invitation.campaign.users.include?(current_user)
      return render json: { error: "Already a member of this campaign" }, status: :conflict
    end
    
    # Add user to campaign
    membership = @invitation.campaign.campaign_memberships.build(user: current_user)
    
    if membership.save
      # Clean up invitation
      @invitation.destroy!
      
      # Broadcast update for real-time UI updates
      BroadcastCampaignUpdateJob.perform_later(@invitation.campaign.id)
      
      # Return campaign data
      campaign_data = ActiveModelSerializers::SerializableResource.new(
        @invitation.campaign,
        serializer: CampaignSerializer,
        adapter: :attributes
      ).serializable_hash
      
      render json: { 
        campaign: campaign_data,
        message: "Successfully joined #{@invitation.campaign.name}!"
      }, status: :created
    else
      render json: { errors: membership.errors.as_json }, status: :unprocessable_entity
    end
  end
  
  # GET /api/v2/invitations/:id (for redemption page)
  # Public endpoint to view invitation details
  def show
    @invitation = Invitation.find(params[:id])
    
    return render json: { error: "Invitation not found" }, status: :not_found unless @invitation
    return render json: { error: "Campaign no longer exists" }, status: :unprocessable_entity unless @invitation.campaign
    
    invitation_data = ActiveModelSerializers::SerializableResource.new(
      @invitation,
      serializer: InvitationSerializer,
      adapter: :attributes
    ).serializable_hash
    
    render json: invitation_data
  end
  
  private
  
  # Update to allow show action without authentication for public redemption
  before_action :authenticate_user!, except: [:show]
  before_action :require_current_campaign, except: [:show, :redeem]
end
```

#### Routes Configuration
```ruby
# config/routes.rb
namespace :api do
  namespace :v2 do
    resources :invitations, only: [:index, :create, :destroy, :show] do
      member do
        post :redeem  # POST /api/v2/invitations/:id/redeem
        post :resend  # Existing endpoint
      end
    end
  end
end
```

#### Model Enhancements
```ruby
# app/models/invitation.rb (if needed)
class Invitation < ApplicationRecord
  # Existing validations and associations
  
  # Add method for redemption validation
  def can_be_redeemed_by?(user)
    return false unless campaign&.active?
    return false if campaign.users.include?(user)
    true
  end
  
  def redeem_by!(user)
    ActiveRecord::Base.transaction do
      campaign.campaign_memberships.create!(user: user)
      destroy!
    end
  end
end
```

### Frontend Implementation (Next.js)

#### Redemption Page Route
```typescript
// src/app/redeem/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getServerClient } from '@/lib/getServerClient'
import RedemptionForm from '@/components/invitations/RedemptionForm'
import { Box, Container, Typography, CircularProgress } from '@mui/material'

interface RedemptionPageProps {
  params: { id: string }
}

// Server component to fetch invitation data
export default async function RedemptionPage({ params }: RedemptionPageProps) {
  const { id } = params
  
  try {
    // Fetch invitation data server-side (public endpoint)
    const client = getServerClient()
    const response = await client.get(`/api/v2/invitations/${id}`)
    const invitation = response.data
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" gutterBottom>
            Campaign Invitation
          </Typography>
          <Typography variant="h5" color="text.secondary">
            You've been invited to join "{invitation.campaign.name}"
          </Typography>
        </Box>
        
        <Suspense fallback={<CircularProgress />}>
          <RedemptionForm invitation={invitation} />
        </Suspense>
      </Container>
    )
  } catch (error) {
    // Handle invitation not found or other errors
    if (error.response?.status === 404) {
      notFound()
    }
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" color="error" gutterBottom>
            Invalid Invitation
          </Typography>
          <Typography variant="body1">
            This invitation link is no longer valid or has expired.
          </Typography>
        </Box>
      </Container>
    )
  }
}

// Metadata for SEO
export async function generateMetadata({ params }: RedemptionPageProps) {
  try {
    const client = getServerClient()
    const response = await client.get(`/api/v2/invitations/${params.id}`)
    const invitation = response.data
    
    return {
      title: `Join ${invitation.campaign.name} - Chi War`,
      description: `You've been invited to join the campaign "${invitation.campaign.name}"`,
    }
  } catch {
    return {
      title: 'Campaign Invitation - Chi War',
      description: 'Join a campaign in Chi War',
    }
  }
}
```

#### Redemption Form Component
```typescript
// src/components/invitations/RedemptionForm.tsx
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  LinearProgress
} from '@mui/material'
import { useClient, useToast } from '@/contexts'
import type { Invitation } from '@/types'

interface RedemptionFormProps {
  invitation: Invitation
}

export default function RedemptionForm({ invitation }: RedemptionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { client, user } = useClient()
  const { toastSuccess, toastError } = useToast()
  const router = useRouter()
  
  const handleRedeem = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await client.redeemInvitation(invitation.id)
      
      toastSuccess(`Successfully joined ${invitation.campaign.name}!`)
      
      // Redirect to campaign page
      router.push(`/campaigns/${invitation.campaign.id}`)
    } catch (error) {
      console.error('Redemption failed:', error)
      
      if (error.response?.status === 409) {
        setError('You are already a member of this campaign.')
      } else if (error.response?.status === 401) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(`/redeem/${invitation.id}`)
        router.push(`/login?redirect=${returnUrl}`)
      } else {
        const errorMessage = error.response?.data?.error || 'Failed to join campaign. Please try again.'
        setError(errorMessage)
        toastError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogin = () => {
    const returnUrl = encodeURIComponent(`/redeem/${invitation.id}`)
    router.push(`/login?redirect=${returnUrl}`)
  }
  
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <Card>
        <CardContent>
          <Box textAlign="center" py={2}>
            <Typography variant="h6" gutterBottom>
              Login Required
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Please log in to accept this campaign invitation.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleLogin}
            >
              Login to Chi War
            </Button>
          </Box>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardContent>
        {loading && <LinearProgress />}
        
        {/* Campaign Information */}
        <Box mb={3}>
          <List>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {invitation.campaign.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={invitation.campaign.name}
                secondary={`Invited by ${invitation.user.first_name} ${invitation.user.last_name}`}
              />
            </ListItem>
          </List>
          
          {invitation.campaign.description && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                <strong>Campaign Description:</strong>
              </Typography>
              <Typography variant="body1" paragraph>
                {invitation.campaign.description}
              </Typography>
            </>
          )}
        </Box>
        
        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {/* Action Buttons */}
        <Box display="flex" gap={2} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => router.push('/')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleRedeem}
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Accept Invitation'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}
```

#### API Client Updates
```typescript
// src/lib/client/campaignClient.ts
export function createCampaignClient(deps: ClientDependencies) {
  // ... existing functions
  
  // Update existing redeemInvitation to use v2 endpoint
  async function redeemInvitation(
    invitationId: string
  ): Promise<AxiosResponse<{ campaign: Campaign; message: string }>> {
    return post(`${apiV2.invitations()}/${invitationId}/redeem`)
  }
  
  // New function to get invitation details (public)
  async function getInvitationDetails(
    invitationId: string
  ): Promise<AxiosResponse<Invitation>> {
    return get(`${apiV2.invitations()}/${invitationId}`)
  }
  
  return {
    // ... existing functions
    redeemInvitation,
    getInvitationDetails,
  }
}
```

### Email Template Enhancement

#### Updated Invitation Email
```erb
<!-- app/views/user_mailer/invitation.html.erb -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: #2E7D32; margin: 0;">Chi War Campaign Invitation</h1>
  </div>

  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h2 style="color: #333; margin-top: 0;">Hello <%= @invitation.email.split('@').first.capitalize %>,</h2>
    
    <p style="font-size: 16px; line-height: 1.6; color: #444;">
      You've been invited by <strong><%= @invitation.user.first_name %> <%= @invitation.user.last_name %></strong> 
      to join the campaign "<strong><%= @campaign.name %></strong>" in Chi War!
    </p>
    
    <% if @campaign.description.present? %>
    <div style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
      <p style="margin: 0; font-weight: bold; color: #2E7D32;">Campaign Description:</p>
      <p style="margin: 10px 0 0 0; color: #555;"><%= @campaign.description %></p>
    </div>
    <% end %>
  </div>

  <div style="text-align: center; margin: 40px 0;">
    <% invitation_url = "#{@root_url}/redeem/#{@invitation.id}" %>
    <a href="<%= invitation_url %>" 
       style="background-color: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold; display: inline-block;">
      Accept Invitation
    </a>
  </div>

  <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 30px 0;">
    <p style="margin: 0; color: #2E7D32; font-weight: bold;">📋 What happens next?</p>
    <ul style="color: #444; margin: 10px 0 0 0; padding-left: 20px;">
      <li>Click the button above to accept the invitation</li>
      <li>Log in to your Chi War account (or create one if needed)</li>
      <li>You'll be automatically added to the campaign</li>
      <li>Start creating characters and joining the adventure!</li>
    </ul>
  </div>

  <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 40px;">
    <p style="color: #666; font-size: 14px; margin: 0;">
      <strong>Direct link:</strong> <a href="<%= invitation_url %>" style="color: #4CAF50;"><%= invitation_url %></a>
    </p>
    <p style="color: #666; font-size: 12px; margin: 15px 0 0 0;">
      If you don't want to join this campaign, you can safely ignore this email.
    </p>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;">
    <p style="color: #888; font-size: 14px; margin: 0;">
      Happy gaming!<br>
      <strong>The Chi War Team</strong>
    </p>
  </div>
</div>
```

## User Experience Flows

### Authenticated User Flow
1. User clicks invitation email link → `/redeem/{invitation_id}`
2. Server-side component fetches invitation details
3. RedemptionForm displays campaign information
4. User clicks "Accept Invitation"
5. API call to `POST /api/v2/invitations/{id}/redeem`
6. User added to campaign, invitation deleted
7. Success message and redirect to campaign page

### Unauthenticated User Flow
1. User clicks invitation email link → `/redeem/{invitation_id}`
2. Server-side component fetches invitation details (public endpoint)
3. RedemptionForm detects no authenticated user
4. Shows "Login Required" message with login button
5. Redirects to `/login?redirect=/redeem/{invitation_id}`
6. After successful login, returns to redemption page
7. Continues with authenticated flow

### Error Handling
- **Invalid Invitation**: 404 page with helpful message
- **Already Member**: Conflict message with redirect to campaign
- **Campaign Deleted**: Unprocessable entity with explanation
- **Network Errors**: Retry mechanism with user feedback

## Testing Strategy

### Backend Tests (RSpec)
```ruby
# spec/requests/api/v2/invitations_spec.rb
RSpec.describe "Api::V2::Invitations", type: :request do
  describe "POST /api/v2/invitations/:id/redeem" do
    it "successfully redeems invitation and adds user to campaign"
    it "returns error for invalid invitation ID"
    it "returns conflict if user already in campaign"
    it "returns unauthorized if user not logged in"
    it "cleans up invitation after successful redemption"
    it "broadcasts campaign update after redemption"
  end
  
  describe "GET /api/v2/invitations/:id" do
    it "returns invitation details for valid invitation"
    it "returns 404 for invalid invitation"
    it "works without authentication (public endpoint)"
  end
end
```

### Frontend Tests
- Component tests for RedemptionForm with different states
- Integration tests for redemption page routing
- Error boundary tests for invalid invitations

### End-to-End Tests (Playwright)
```javascript
// test-scripts/test-invitation-redemption.js
const { chromium } = require('playwright')
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper')

async function testInvitationRedemption() {
  // 1. Gamemaster creates invitation
  // 2. Extract invitation ID from UI or API
  // 3. Simulate clicking email link (navigate to /redeem/{id})
  // 4. Handle authentication flow
  // 5. Accept invitation
  // 6. Verify campaign membership
  // 7. Verify gamemaster sees updated member list
}

// Test cases:
// - Authenticated user redemption
// - Unauthenticated user redemption with login
// - Invalid invitation handling
// - Already member scenario
// - Network error handling
```

## Success Criteria

### Functional Requirements
- ✅ Users can click email links and access redemption pages
- ✅ Proper authentication handling with login redirects
- ✅ Successful invitation redemption adds users to campaigns
- ✅ Clear error messages for all edge cases
- ✅ Real-time updates for gamemasters when invitations are redeemed
- ✅ Email templates are professional and informative
- ✅ Mobile-responsive redemption interface

### Technical Requirements
- ✅ All API endpoints use v2 architecture patterns
- ✅ Comprehensive test coverage (unit, integration, E2E)
- ✅ Proper error handling and user feedback
- ✅ SEO-friendly redemption pages
- ✅ Accessible UI components following Material-UI standards

### Performance Requirements
- ✅ Redemption page loads in under 2 seconds
- ✅ API redemption calls complete in under 1 second
- ✅ Email delivery within 30 seconds of invitation creation
- ✅ Real-time UI updates within 2 seconds of redemption

## Migration Strategy

### Phase 1: Implementation
1. Backend API v2 redemption endpoint
2. Frontend redemption page and components
3. Email template enhancement
4. Comprehensive testing

### Phase 2: Deployment
1. Deploy backend changes with new API endpoints
2. Deploy frontend with new redemption pages
3. Update email templates in production
4. Monitor redemption success rates

### Phase 3: Cleanup
1. Monitor v1 redemption endpoint usage
2. Add deprecation warnings to v1 endpoints
3. Eventually remove v1 redemption endpoints
4. Update any remaining v1 references

## Risk Mitigation

### Technical Risks
- **Email deliverability**: Test with multiple email providers
- **Authentication edge cases**: Comprehensive auth flow testing
- **Mobile compatibility**: Test on various device sizes
- **Performance impact**: Monitor API response times

### User Experience Risks
- **Complex authentication flow**: Provide clear messaging
- **Email link confusion**: Use descriptive link text and context
- **Error state confusion**: Provide helpful error messages and recovery paths

This specification provides a complete roadmap for implementing the invitation redemption system that complements the existing invitation creation system, creating a seamless end-to-end workflow for campaign invitations in Chi War.