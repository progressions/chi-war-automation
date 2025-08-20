# Issue: Integrate Campaign Invitation System into Campaign Show Page

**Date**: 2025-08-20  
**Priority**: Medium  
**Category**: Frontend/UX  
**Status**: Open

## Description

The Campaign show page currently uses a generic Manager component to handle adding users to campaigns, but this directly adds users without utilizing the existing invitation system. The application already has a complete invitation infrastructure (backend models, controllers, mailers, and frontend API clients) that sends invitation emails to users, but it's not integrated into the main campaign management UI.

Gamemasters should be able to invite users to their campaigns through the campaign show page, which should create invitation records and send invitation emails rather than immediately adding users as members.

## Current State Analysis

### Existing Invitation Infrastructure ✅

**Backend (Complete):**
- `Invitation` model with email validation and campaign association
- `Api::V1::InvitationsController` with full CRUD operations  
- `UserMailer#invitation` with HTML email templates
- Database schema with `invitations` table
- Invitation redemption system with email validation

**Frontend API Client (Complete):**
- `campaignClient.ts` has invitation functions: `createInvitation`, `getInvitation`, `deleteInvitation`, `redeemInvitation`, `resendInvitation`
- `Invitation` TypeScript interface defined
- Campaign type includes `invitations: Invitation[]` array

**Missing Integration:**
- Campaign show page Manager component doesn't use invitation system
- No UI for creating, viewing, or managing campaign invitations
- No invitation management interface for gamemasters

## Steps to Reproduce Current Behavior

1. Navigate to a campaign show page as a gamemaster
2. Click "Manage" button in the Members section  
3. Use the GenericFilter to search and add users
4. Users are immediately added to campaign without invitation process
5. No invitation email is sent to the added user
6. No invitation record is created in the database

## Expected Behavior

When a gamemaster manages campaign members:

1. **Invitation Creation**: 
   - Search for users by email address
   - Click to send invitation instead of immediate membership
   - Create `Invitation` record in database
   - Send invitation email via `UserMailer`

2. **Invitation Management**:
   - View pending invitations in the Members section
   - Resend invitations if needed
   - Cancel/delete pending invitations
   - See invitation status (pending, accepted, expired)

3. **User Experience**:
   - Invited users receive email with campaign invitation
   - Users can accept invitation via email link
   - Accepted invitations automatically add users to campaign
   - Gamemasters get feedback on invitation status

4. **Existing Members Management**:
   - Still allow direct removal of existing members
   - Show clear distinction between members and pending invites

## Related Files

**Backend (Already Complete):**
- `shot-server/app/models/invitation.rb` - Invitation model with validations
- `shot-server/app/controllers/api/v1/invitations_controller.rb` - API endpoints
- `shot-server/app/mailers/user_mailer.rb` - Email sending functionality
- `shot-server/app/views/user_mailer/invitation.html.erb` - Email template

**Frontend Components (Need Updates):**
- `shot-client-next/src/components/campaigns/Show.tsx` - Campaign show page using Manager
- `shot-client-next/src/components/ui/lists/Manager.tsx` - Generic manager component
- `shot-client-next/src/components/users/UserManager.tsx` - User-specific manager wrapper
- `shot-client-next/src/components/ListManager.tsx` - List management logic

**Frontend API Client (Already Complete):**
- `shot-client-next/src/lib/client/campaignClient.ts` - Invitation API functions
- `shot-client-next/src/types/resources.ts` - Invitation TypeScript types

**Missing Frontend Components (Need Creation):**
- Invitation-specific components for creation, management, and display
- Enhanced Members section showing both members and pending invitations
- Invitation status indicators and management UI

## Technical Analysis

### Current Manager Component Flow
1. `Campaign Show.tsx` renders `Manager` component with User entity type
2. `Manager` renders `ListManager` component
3. `ListManager` uses `GenericFilter` for user search and selection
4. Users are immediately added to campaign via API update
5. No invitation process is triggered

### Proposed Invitation Flow  
1. **Enhanced Members Section**: Show both existing members and pending invitations
2. **Invite New Users**: Replace generic user addition with invitation creation
3. **Invitation Management**: Add UI for resending, canceling, and monitoring invitations
4. **Status Indicators**: Show invitation status (pending, sent, accepted, expired)

### API Integration Points
- `createInvitation(invitation, campaign)` - Create new invitation
- `resendInvitation(invitation)` - Resend invitation email  
- `deleteInvitation(invitation)` - Cancel pending invitation
- `getInvitation(invitation)` - Check invitation status

## Proposed Solution

### Phase 1: Create Invitation Components

**New Components:**
```typescript
// InvitationManager.tsx - Replacement for UserManager in campaigns
// InvitationList.tsx - Display pending invitations with status
// InvitationForm.tsx - Form for creating new invitations
// InvitationCard.tsx - Individual invitation display with actions
```

### Phase 2: Enhance Campaign Show Page

**Update Campaign Show:**
- Replace generic `Manager` with `InvitationManager` for Members section
- Display both existing members and pending invitations
- Add invitation status indicators and management actions

### Phase 3: Enhanced User Experience

**Invitation Status System:**
- Pending invitations show as "Invited" with email and timestamp
- Accepted invitations automatically become memberships  
- Failed/expired invitations show retry options
- Email status tracking (sent, delivered, opened if available)

### Phase 4: Gamemaster Tools

**Administrative Features:**
- Bulk invitation creation
- Invitation templates or pre-filled campaigns
- Invitation analytics (acceptance rates, response times)
- Integration with campaign membership limits

## Implementation Details

### Database Schema (Already Complete)
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  user_id UUID NOT NULL REFERENCES users(id), -- gamemaster who sent invite
  pending_user_id UUID REFERENCES users(id),   -- user being invited
  email VARCHAR NOT NULL,                      -- invitation email
  maximum_count INTEGER,                       -- for bulk invites
  remaining_count INTEGER,                     -- for bulk invites
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Email Templates (Already Complete)
- HTML invitation email with campaign details
- Configurable sender and branding
- Invitation link with redemption token
- Campaign information and gamemaster details

### TypeScript Interfaces (Already Complete)
```typescript
interface Invitation extends BaseEntity {
  id: string
  email: string
  maximum_count?: number
  remaining_count?: number
  campaign: Campaign
  gamemaster: User
  pending_user?: User
  created_at: string
  updated_at: string
}
```

## User Stories

### Gamemaster Stories
- **As a gamemaster**, I want to invite players via email so they can join my campaign with proper notification
- **As a gamemaster**, I want to see pending invitations so I know who I've invited but hasn't joined yet
- **As a gamemaster**, I want to resend invitations so I can follow up with players who missed the original email
- **As a gamemaster**, I want to cancel invitations so I can revoke access before players accept

### Player Stories  
- **As a player**, I want to receive invitation emails so I know I've been invited to a campaign
- **As a player**, I want campaign details in the invitation so I can decide whether to join
- **As a player**, I want one-click invitation acceptance so joining campaigns is easy

## Acceptance Criteria

- [ ] Campaign show page displays both members and pending invitations in Members section
- [ ] Gamemaster can invite users by email address through campaign show page
- [ ] Invitation creation sends email notification to invited user  
- [ ] Pending invitations display with status indicators (pending, sent, accepted, expired)
- [ ] Gamemaster can resend invitation emails for pending invitations
- [ ] Gamemaster can cancel/delete pending invitations
- [ ] Invited users can accept invitations via email link
- [ ] Accepted invitations automatically create campaign memberships
- [ ] UI clearly distinguishes between existing members and pending invitations
- [ ] Error handling for invalid email addresses and duplicate invitations
- [ ] Mobile-responsive invitation management interface
- [ ] Integration maintains existing direct member removal functionality

## Benefits

**User Experience:**
- Professional invitation process with email notifications
- Clear invitation status tracking for gamemasters
- Better onboarding experience for new players
- Reduced confusion about campaign membership

**System Benefits:**
- Utilizes existing invitation infrastructure instead of bypassing it
- Proper audit trail for campaign invitations and membership
- Email notifications improve user engagement
- Prevents unauthorized campaign access

**Gamemaster Benefits:**
- Better campaign management tools
- Invitation tracking and follow-up capabilities  
- Professional appearance when inviting players
- Reduced manual coordination for campaign invitations

## Testing Strategy

**Unit Tests:**
- Test invitation creation, management, and status updates
- Test email sending and invitation redemption flows
- Test error handling for duplicate/invalid invitations

**Integration Tests:**
- Test full invitation flow from creation to acceptance
- Test campaign membership creation after invitation acceptance
- Test invitation cancellation and resending

**User Interface Tests:**  
- Test invitation management UI for gamemasters
- Test responsive design on mobile devices
- Test invitation status indicators and actions

**End-to-End Tests:**
- Test complete invitation workflow from gamemaster perspective
- Test invitation acceptance from player perspective  
- Test email delivery and link functionality

## Success Criteria

- [ ] Zero campaign membership additions bypass invitation system
- [ ] 100% of campaign invitations send notification emails
- [ ] Invitation management UI provides clear status feedback
- [ ] Email acceptance rate improves campaign onboarding
- [ ] Gamemaster satisfaction with invitation management tools
- [ ] Mobile responsive invitation interface works across devices
- [ ] Integration maintains existing campaign management functionality

This enhancement will transform campaign membership from a direct addition system to a professional invitation-based approach, improving user experience and utilizing the robust invitation infrastructure already built into the application.