# Character Owner Reassignment Feature Specification

**Date**: 2025-08-22  
**Feature**: Allow administrators and gamemasters to reassign character ownership

## Overview

Enable authorized users (administrators and gamemasters) to reassign character ownership within campaigns. This feature addresses the need to transfer characters when players leave campaigns or when administrative intervention is required.

## Implementation Plan

### Phase 1: Backend API Updates

#### 1.1 Update Character Controller Permissions
**File**: `shot-server/app/controllers/api/v2/characters_controller.rb`

- Add `:user_id` to permitted parameters in `character_params` method
- Add authorization check in `update` action for owner reassignment
- Ensure only admin/gamemaster can change user_id

#### 1.2 Add Character Model Validations
**File**: `shot-server/app/models/character.rb`

- Add validation to ensure new owner is a campaign member
- Add method `can_assign_owner?(new_user)` to validate ownership assignment
- Add callback to log ownership changes

#### 1.3 Create Authorization Service
**File**: `shot-server/app/services/character_ownership_service.rb` (new)

- Create service to handle ownership transfer logic
- Include validation of new owner membership
- Add audit logging for ownership changes
- Handle edge cases (null user, non-existent user)

### Phase 2: Frontend Components

#### 2.1 Create Owner Selector Component
**File**: `shot-client-next/src/components/characters/OwnerSelector.tsx` (new)

- Create component using UserFilter pattern
- Filter users to show only campaign members
- Include search/autocomplete functionality
- Handle loading and error states

#### 2.2 Update Character Show Page
**File**: `shot-client-next/src/components/characters/Show.tsx`

- Replace read-only owner display with conditional edit component
- Show OwnerSelector only for authorized users (admin/gamemaster)
- Add confirmation dialog for ownership changes
- Display success/error feedback

#### 2.3 Add Authorization Hook
**File**: `shot-client-next/src/hooks/useCharacterOwnershipAuth.ts` (new)

- Create hook to check if current user can edit ownership
- Check for admin role or gamemaster status
- Return boolean for UI conditional rendering

### Phase 3: Testing

#### 3.1 Backend Unit Tests
**File**: `shot-server/spec/controllers/api/v2/characters_controller_spec.rb`

- Test authorization for different user roles
- Test successful ownership transfer
- Test validation failures (non-member user)
- Test audit logging

**File**: `shot-server/spec/services/character_ownership_service_spec.rb` (new)

- Test service logic for ownership transfer
- Test edge cases and error handling
- Test campaign membership validation

#### 3.2 Frontend Component Tests
**File**: `shot-client-next/src/components/characters/OwnerSelector.test.tsx` (new)

- Test component rendering for authorized users
- Test user filtering and search
- Test API call handling
- Test error states

#### 3.3 End-to-End Tests
**File**: `test-scripts/test-character-owner-reassignment.js` (new)

- Test complete flow as gamemaster
- Test authorization boundaries (regular user cannot edit)
- Test success feedback
- Test error handling for invalid assignments

## Detailed Implementation Steps

### Step 1: Backend Permission Update
1. Open `shot-server/app/controllers/api/v2/characters_controller.rb`
2. Add `:user_id` to `character_params` method
3. Add authorization check in `update` action:
   ```ruby
   if params[:character][:user_id].present?
     unless can_reassign_owner?
       render json: { error: "Not authorized to reassign ownership" }, status: :forbidden
       return
     end
   end
   ```

### Step 2: Model Validation
1. Open `shot-server/app/models/character.rb`
2. Add validation method:
   ```ruby
   validate :new_owner_is_campaign_member, if: :user_id_changed?
   
   private
   
   def new_owner_is_campaign_member
     return unless campaign.present? && user.present?
     unless campaign.users.include?(user)
       errors.add(:user_id, "must be a member of the campaign")
     end
   end
   ```

### Step 3: Frontend Component Creation
1. Create `OwnerSelector.tsx` component
2. Implement user search and selection
3. Add API call to update character
4. Handle success/error responses

### Step 4: Update Character Show Page
1. Import OwnerSelector component
2. Add conditional rendering based on user permissions
3. Replace static owner display with editable component
4. Add confirmation dialog

### Step 5: Write Tests
1. Create backend controller tests
2. Create service tests
3. Create frontend component tests
4. Create end-to-end test script

## Success Criteria

- [x] Gamemasters can reassign character ownership in their campaigns
- [x] Administrators can reassign ownership system-wide
- [x] Regular users cannot change ownership
- [x] New owner must be campaign member
- [x] UI provides clear feedback
- [x] All tests pass
- [x] Feature is documented

## API Changes

### PATCH /api/v2/characters/:id

**New Parameter**: `user_id` (integer)

**Authorization**: 
- Admin role: Can change any character
- Gamemaster: Can change characters in owned campaigns
- Regular user: Cannot change ownership

**Validation**:
- New user must exist
- New user must be campaign member

**Response**:
- 200 OK: Ownership updated successfully
- 403 Forbidden: Not authorized
- 422 Unprocessable: Validation failed

## UI/UX Considerations

1. **Confirmation Dialog**: Show warning that ownership change is permanent
2. **User Selection**: Use autocomplete with user avatars for better UX
3. **Loading State**: Show spinner during API call
4. **Success Feedback**: Clear message confirming ownership change
5. **Error Handling**: Display specific error messages for different failure cases

## Security Considerations

1. **Backend Authorization**: Never trust frontend, always validate on backend
2. **Audit Trail**: Log all ownership changes with timestamp and actor
3. **Rate Limiting**: Consider adding rate limits for ownership changes
4. **Notification**: Consider notifying original owner of transfer

## Rollback Plan

If issues arise:
1. Remove `:user_id` from permitted parameters
2. Hide OwnerSelector component
3. Revert to read-only owner display
4. Database changes are non-destructive (no migrations needed)

## Timeline

- Backend API: 2 hours
- Frontend components: 3 hours  
- Testing: 2 hours
- Documentation: 1 hour
- **Total: 8 hours**