# Issue: Implement Admin-Aware Users Profile Page with Role Management

**Date**: 2025-08-20  
**Priority**: Medium  
**Category**: Frontend/Authentication  
**Status**: Completed

## Description

The application needs an admin-aware users profile page that properly restricts access based on user permissions and provides administrative functionality for managing user roles. Currently, users can potentially access profile pages without proper authorization checks, and there's no interface for admins to manage user permissions.

The Users Show page should be restricted to admin users only, with non-admin users (including regular users trying to view their own profile) being redirected to the homepage. Additionally, admin users should be able to toggle Admin and Gamemaster flags for users through checkboxes on the user's Show page.

## Current State Analysis

### Existing User Management
- User model has `admin` and `gamemaster` boolean flags
- Authentication system exists with Devise JWT
- Frontend has users routes and components
- No current access control on user profile pages
- No UI for managing user roles

### Missing Functionality
- Admin-only access control for users Show page
- Role management interface for admin users
- Proper redirection for unauthorized access
- User role toggle functionality

## Steps to Reproduce Current Behavior

1. Navigate to any user profile page (e.g., `/users/[user-id]`)
2. Non-admin users can potentially access user profile information
3. No interface exists for admins to modify user permissions
4. No proper access control or redirection mechanism

## Expected Behavior

### Access Control
1. **Admin Users**:
   - Can access any user's profile page via `/users/[user-id]`
   - Can view all user information and role settings
   - Can modify Admin and Gamemaster flags via checkboxes

2. **Non-Admin Users**:
   - Cannot access any user profile pages, including their own
   - Attempting to visit `/users/[user-id]` redirects to homepage (`/`)
   - No access to user management functionality

### User Interface
1. **Admin User Profile Page**:
   - Display user information (name, email, creation date, etc.)
   - Show current role status with visual indicators
   - Provide checkboxes to toggle Admin and Gamemaster flags
   - Save changes with proper feedback and error handling

2. **Access Denied Behavior**:
   - Silent redirect to homepage for unauthorized users
   - No error messages or indication of attempted access
   - Seamless user experience without exposing restricted functionality

## Related Files

**Frontend Components (Need Updates):**
- `shot-client-next/src/app/users/[id]/page.tsx` - User profile page route
- `shot-client-next/src/components/users/Show.tsx` - User profile component
- `shot-client-next/src/components/users/` - Related user components

**Frontend Authentication (Need Updates):**
- `shot-client-next/src/contexts/AuthContext.tsx` - User authentication context
- `shot-client-next/src/hooks/useAuth.tsx` - Authentication hook
- `shot-client-next/src/middleware.ts` - Route protection middleware

**Backend API (May Need Updates):**
- `shot-server/app/controllers/api/v2/users_controller.rb` - User API endpoints
- `shot-server/app/models/user.rb` - User model with role flags
- `shot-server/app/serializers/user_serializer.rb` - User JSON serialization

**Frontend API Client (May Need Updates):**
- `shot-client-next/src/lib/client/userClient.ts` - User API client functions
- `shot-client-next/src/types/resources.ts` - User TypeScript types

## Technical Analysis

### Current User Model Structure
```ruby
# User model has these relevant attributes:
class User < ApplicationRecord
  # ... other attributes
  attribute :admin, :boolean, default: false
  attribute :gamemaster, :boolean, default: false
  # ... rest of model
end
```

### Required Access Control Flow
1. **Route Protection**: Check user admin status before rendering users Show page
2. **Component Guards**: Implement admin checks within user components
3. **API Validation**: Ensure backend validates admin permissions for user updates
4. **Client-Side Routing**: Handle unauthorized access with proper redirects

### Proposed Role Management Interface
```typescript
interface UserRoleManagement {
  userId: string
  isAdmin: boolean
  isGamemaster: boolean
  onAdminToggle: (userId: string, isAdmin: boolean) => Promise<void>
  onGamemasterToggle: (userId: string, isGamemaster: boolean) => Promise<void>
}
```

## Proposed Solution

### Phase 1: Access Control Implementation

**1. Route-Level Protection**
- Add admin check in `users/[id]/page.tsx`
- Implement redirect logic for non-admin users
- Use authentication context to verify admin status

**2. Component-Level Guards**
- Update `Show.tsx` component with admin verification
- Add early return or redirect for unauthorized access
- Ensure proper loading states during auth checks

### Phase 2: Role Management Interface

**1. Admin Controls**
- Add checkboxes for Admin and Gamemaster flags
- Implement toggle functionality with API calls
- Provide visual feedback for role changes

**2. User Interface Updates**
- Display current role status with clear indicators
- Show user information relevant to admin management
- Add proper form validation and error handling

### Phase 3: Backend API Enhancements

**1. Permission Validation**
- Ensure user update endpoints require admin permissions
- Add proper authorization checks for role modifications
- Implement audit logging for role changes

**2. API Response Updates**
- Include role information in user serialization
- Provide proper error responses for unauthorized attempts
- Add success confirmation for role updates

## Implementation Details

### Frontend Access Control
```typescript
// In users/[id]/page.tsx
export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user?.admin) {
      router.replace('/')
      return
    }
  }, [isAuthenticated, user, router])

  if (!user?.admin) {
    return null // Prevent flash of content
  }

  return <UserShow userId={params.id} />
}
```

### Role Management Component
```typescript
interface RoleManagementProps {
  user: User
  onRoleUpdate: (userId: string, updates: Partial<User>) => Promise<void>
}

function RoleManagement({ user, onRoleUpdate }: RoleManagementProps) {
  const handleAdminToggle = async (checked: boolean) => {
    await onRoleUpdate(user.id, { admin: checked })
  }

  const handleGamemasterToggle = async (checked: boolean) => {
    await onRoleUpdate(user.id, { gamemaster: checked })
  }

  return (
    <Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={user.admin}
            onChange={(e) => handleAdminToggle(e.target.checked)}
          />
        }
        label="Admin"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={user.gamemaster}
            onChange={(e) => handleGamemasterToggle(e.target.checked)}
          />
        }
        label="Gamemaster"
      />
    </Box>
  )
}
```

### Backend API Updates
```ruby
# In users_controller.rb
def update
  authorize_admin! # Ensure only admins can modify users
  
  if @user.update(user_params)
    render json: @user, serializer: UserSerializer
  else
    render json: { errors: @user.errors }, status: :unprocessable_entity
  end
end

private

def user_params
  params.require(:user).permit(:admin, :gamemaster) # Only allow role updates
end

def authorize_admin!
  render json: { error: 'Unauthorized' }, status: :forbidden unless current_user.admin?
end
```

## User Stories

### Admin Stories
- **As an admin**, I want to access any user's profile page so I can manage user accounts
- **As an admin**, I want to toggle user Admin flags so I can grant/revoke administrative privileges
- **As an admin**, I want to toggle user Gamemaster flags so I can manage game hosting permissions
- **As an admin**, I want visual feedback when changing user roles so I know the changes were applied

### User Stories
- **As a regular user**, I should be redirected away from user profile pages so I can't access restricted information
- **As a regular user**, I shouldn't see any indication that user profile functionality exists

## Acceptance Criteria

- [ ] Non-admin users cannot access `/users/[id]` routes and are redirected to homepage
- [ ] Admin users can access any user's profile page via `/users/[id]`
- [ ] User Show page displays current Admin and Gamemaster status clearly
- [ ] Admin users can toggle Admin flag via checkbox with immediate API update
- [ ] Admin users can toggle Gamemaster flag via checkbox with immediate API update
- [ ] Role changes provide visual feedback (success/error messages)
- [ ] Unauthorized access attempts redirect silently without error messages
- [ ] Page loading states handle authentication checks properly
- [ ] Backend validates admin permissions for user role modifications
- [ ] Mobile-responsive interface for role management controls
- [ ] Proper error handling for failed role updates

## Benefits

**Security:**
- Prevents unauthorized access to user management functionality
- Ensures only admins can modify user permissions
- Maintains proper access control throughout the application

**User Experience:**
- Clear role management interface for administrators
- Seamless redirection for unauthorized users
- Visual feedback for administrative actions

**Administrative Efficiency:**
- Easy role management without database access
- Clear visibility into user permissions
- Streamlined user administration workflow

## Testing Strategy

**Unit Tests:**
- Test access control logic for admin vs non-admin users
- Test role toggle functionality and API calls
- Test redirect behavior for unauthorized access

**Integration Tests:**
- Test complete user profile access flow
- Test role modification API endpoints with proper authorization
- Test authentication context integration

**End-to-End Tests:**
- Test admin user accessing and modifying user profiles
- Test non-admin user being redirected from user profile routes
- Test role changes persisting across page refreshes

## Success Criteria

- [ ] Zero unauthorized access to user profile pages
- [ ] 100% of role changes properly validated and persisted
- [ ] Admin interface provides clear and intuitive role management
- [ ] Non-admin users have no awareness of restricted functionality
- [ ] Mobile-responsive role management interface
- [ ] Proper audit trail for user role modifications

This enhancement will provide secure, admin-only user management functionality while maintaining a clean user experience for non-administrative users.