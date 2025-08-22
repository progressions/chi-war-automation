# Admin-Aware Users Profile Page Implementation Specification

## Overview

This specification outlines the implementation of an admin-only user management system that allows administrators to view and manage user profiles, including role modifications. The system enforces strict access control where only admin users can access user profile pages, and non-admin users are redirected to prevent unauthorized access.

## Core Requirements

### Access Control Rules
1. **Admin Users**: Can access any user's profile page via `/users/[id]`
2. **Non-Admin Users**: Cannot access any user profile pages, including their own
3. **Unauthorized Access**: Redirect to homepage (`/`) without error messages
4. **Role Management**: Admin users can toggle Admin and Gamemaster flags

## Phase 1: Frontend Access Control Implementation

### 1.1 Route Protection

**File**: `shot-client-next/src/app/users/[id]/page.tsx`

Implement admin-only access control:
```typescript
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

### 1.2 Component-Level Guards

**File**: `shot-client-next/src/components/users/Show.tsx`

Update the Show component with:
- Admin verification checks
- Early return for unauthorized access  
- Proper loading states during auth checks
- Role management interface for admin users

### 1.3 Role Management Interface

Create role management components:

**RoleManagement Component**:
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

## Phase 2: Backend API Enhancements

### 2.1 Authorization Middleware

**File**: `shot-server/app/controllers/api/v2/users_controller.rb`

Add admin authorization:
```ruby
class Api::V2::UsersController < Api::V2::BaseController
  before_action :authenticate_user!
  before_action :authorize_admin!, only: [:show, :update]

  def show
    @user = User.find(params[:id])
    render json: @user, serializer: UserSerializer
  end

  def update
    @user = User.find(params[:id])
    
    if @user.update(user_params)
      render json: @user, serializer: UserSerializer
    else
      render json: { errors: @user.errors }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    params.require(:user).permit(:admin, :gamemaster)
  end

  def authorize_admin!
    render json: { error: 'Unauthorized' }, status: :forbidden unless current_user.admin?
  end
end
```

### 2.2 User Serializer Updates

**File**: `shot-server/app/serializers/user_serializer.rb`

Ensure proper serialization includes role information:
```ruby
class UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :name, :email, :admin, :gamemaster,
             :created_at, :updated_at, :active
end
```

## Phase 3: Frontend API Client Updates

### 3.1 User API Client

**File**: `shot-client-next/src/lib/client/userClient.ts`

Add methods for user management:
```typescript
export const userClient = {
  // ... existing methods

  getUser: async (id: string): Promise<User> => {
    const response = await ApiV2.get(`/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    const response = await ApiV2.patch(`/users/${id}`, { user: updates })
    return response.data
  }
}
```

### 3.2 React Hooks

**File**: `shot-client-next/src/hooks/users/useUser.ts`

Create hook for user management:
```typescript
export function useUser(id: string) {
  const { data: user, error, mutate } = useSWR(
    id ? `/users/${id}` : null,
    () => userClient.getUser(id)
  )

  const updateUser = async (updates: Partial<User>) => {
    const updatedUser = await userClient.updateUser(id, updates)
    mutate(updatedUser, false)
    return updatedUser
  }

  return {
    user,
    error,
    isLoading: !error && !user,
    updateUser
  }
}
```

## Implementation Steps

### Step 1: Frontend Access Control
1. [ ] Update `users/[id]/page.tsx` with admin-only access control
2. [ ] Add redirect logic for non-admin users
3. [ ] Update `Show.tsx` component with admin verification
4. [ ] Test access control with different user types

### Step 2: Role Management Interface
1. [ ] Create RoleManagement component with checkboxes
2. [ ] Implement role toggle functionality
3. [ ] Add visual feedback for role changes
4. [ ] Integrate role management into Show component

### Step 3: Backend API Security
1. [ ] Add admin authorization to users controller
2. [ ] Update user update endpoint for role modifications
3. [ ] Add proper error handling for unauthorized access
4. [ ] Test API security with different user roles

### Step 4: Frontend API Integration
1. [ ] Update user API client with new methods
2. [ ] Create React hooks for user management
3. [ ] Integrate API calls with role management interface
4. [ ] Add proper error handling and loading states

### Step 5: Testing and Validation
1. [ ] Test complete user access flow for admin users
2. [ ] Test redirect behavior for non-admin users
3. [ ] Test role modification functionality
4. [ ] Verify API security and authorization

## Acceptance Criteria

### Access Control
- [ ] Non-admin users cannot access `/users/[id]` routes and are redirected to homepage
- [ ] Admin users can access any user's profile page via `/users/[id]`
- [ ] Unauthorized access attempts redirect silently without error messages
- [ ] Page loading states handle authentication checks properly

### Role Management
- [ ] User Show page displays current Admin and Gamemaster status clearly
- [ ] Admin users can toggle Admin flag via checkbox with immediate API update
- [ ] Admin users can toggle Gamemaster flag via checkbox with immediate API update
- [ ] Role changes provide visual feedback (success/error messages)

### Security
- [ ] Backend validates admin permissions for user role modifications
- [ ] API returns proper error responses for unauthorized attempts
- [ ] All role modifications are properly authorized and logged

### User Experience
- [ ] Mobile-responsive interface for role management controls
- [ ] Proper error handling for failed role updates
- [ ] Clear visual indicators for current user roles
- [ ] Smooth user flow without flickering or layout shifts

## Security Considerations

### Frontend Security
- Client-side access control is for UX only
- All security enforcement happens on the backend
- Silent redirects prevent information disclosure
- No caching of sensitive user data

### Backend Security
- All endpoints require authentication
- Admin-only endpoints have proper authorization
- Role modifications validate admin permissions
- Audit trail for administrative actions

## Testing Strategy

### Unit Tests
- Test access control logic for admin vs non-admin users
- Test role toggle functionality and API calls
- Test redirect behavior for unauthorized access
- Test component rendering based on user permissions

### Integration Tests
- Test complete user profile access flow
- Test role modification API endpoints with proper authorization
- Test authentication context integration
- Test error handling and edge cases

### End-to-End Tests
- Test admin user accessing and modifying user profiles
- Test non-admin user being redirected from user profile routes
- Test role changes persisting across page refreshes
- Test mobile responsiveness of role management interface

## Success Criteria

- [ ] Zero unauthorized access to user profile pages
- [ ] 100% of role changes properly validated and persisted
- [ ] Admin interface provides clear and intuitive role management
- [ ] Non-admin users have no awareness of restricted functionality
- [ ] Mobile-responsive role management interface
- [ ] Proper audit trail for user role modifications

This implementation will provide secure, admin-only user management functionality while maintaining a clean user experience for non-administrative users.