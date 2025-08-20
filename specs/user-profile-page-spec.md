# User Profile Page Implementation Specification

## Overview

This specification outlines the implementation of a secure user profile page feature that allows users to view and manage their account information, including personal details and campaign memberships.

## Phase 1: Backend API Setup (Rails)

### 1.1 Profile-Specific Endpoints

Create new endpoints in `shot-server/app/controllers/api/v2/users_controller.rb`:

- `GET /api/v2/users/profile` - Get current user's profile with campaign data
- `PATCH /api/v2/users/profile` - Update current user's profile (enforces self-edit only)

Routes to add:
```ruby
# config/routes.rb
resources :users do
  get :profile, on: :collection
  patch :profile, on: :collection, to: "users#update_profile"
end
```

### 1.2 UserProfileSerializer

Create `shot-server/app/serializers/user_profile_serializer.rb`:
```ruby
class UserProfileSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :name, :email, :gamemaster, :admin, 
             :created_at, :updated_at, :image_url, :entity_class, :active
  
  has_many :campaigns, serializer: CampaignIndexLiteSerializer # As gamemaster
  has_many :player_campaigns, through: :campaign_memberships, source: :campaign
  
  def campaigns_count
    object.campaigns.count
  end
  
  def player_campaigns_count 
    object.player_campaigns.count
  end
end
```

### 1.3 Security Enhancements

- Profile endpoints use `current_user` only (no ID parameters)
- File upload validation (jpg/png only, max 5MB)
- Rate limiting for profile updates (5 per minute)
- `profile_params` method excludes admin/gamemaster flags

### Frontend Implementation

#### 1. Profile Page Route

Create `shot-client-next/src/app/(main)/profile/page.tsx`:
- Display user information in a clean, organized layout
- Show personal details section
- Include campaign memberships section
- Provide edit capabilities for allowed fields

#### 2. Profile Components

Create the following components:

**ProfileForm Component** (`src/components/users/ProfileForm.tsx`):
- Form for editing name and email
- Proper validation and error handling
- Save/cancel functionality

**CampaignMemberships Component** (`src/components/users/CampaignMemberships.tsx`):
- List all campaigns user belongs to
- Show user role in each campaign (gamemaster/player)
- Display campaign status (active/inactive)
- Provide quick navigation to campaigns

#### 3. Navigation Integration

Update `shot-client-next/src/components/ui/navbar/MainMenu.tsx`:
- Add "Profile" menu item
- Link to `/profile` route

#### 4. API Client Updates

Update `shot-client-next/src/lib/client/userClient.ts`:
- Add getUserProfile() method
- Add updateUserProfile() method

## Implementation Steps

### Step 1: Backend API Setup
1. Create/update users controller with profile endpoints
2. Update user serializer for profile data
3. Add proper authentication and validation
4. Write tests for new endpoints

### Step 2: Frontend Profile Page
1. Create profile page route and layout
2. Implement ProfileForm component with edit capabilities
3. Create CampaignMemberships component
4. Add profile navigation to main menu

### Step 3: Integration Testing
1. Test profile data fetching and display
2. Test profile updates with validation
3. Test campaign memberships display
4. Test navigation and user flow

## Acceptance Criteria

- [ ] User can access profile page from main navigation
- [ ] User can view their current name, email, and account info
- [ ] User can edit and save changes to their name
- [ ] User can update their email address with proper validation
- [ ] User can see all campaigns they belong to with their role in each
- [ ] Profile updates are reflected immediately in the application
- [ ] Form validation prevents invalid data submission
- [ ] Success/error feedback is provided for all actions
- [ ] Profile page is responsive and works on mobile devices

## Technical Requirements

### Backend APIs
- Secure authentication using existing JWT system
- Proper error handling and validation
- Consistent JSON response format

### Frontend Components
- Clean, intuitive user interface
- Proper form validation and error states
- Loading states during API calls
- Responsive design for all screen sizes

## Security Considerations

- Users can only access/modify their own profile
- Email updates require proper validation
- All API endpoints require authentication
- Input sanitization and validation on both frontend and backend

## Future Enhancements (Phase 2 & 3)

- Password change functionality
- Email confirmation flow for email changes
- Account preferences and notification settings
- Profile picture/avatar upload capability