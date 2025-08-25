# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-25-auth-conflict-resolution/spec.md

> Created: 2025-08-25
> Version: 1.0.0

## Technical Requirements

- **Conflict Detection Logic**: Implement comparison between localStorage user data and `/api/v2/users/current` API response within AppContext initialization
- **Frontend Storage Cleanup**: Clear localStorage authentication tokens, sessionStorage data, browser cookies, and reset AppContext user state
- **Backend Logout Integration**: Execute the same stateless logout API call that the "Logout" button uses to clear backend session
- **Silent Redirection**: Use Next.js router to navigate to `/login` page without user-visible notifications or error messages
- **AppContext Integration**: Add conflict detection to existing authentication context provider, likely in the user initialization or token validation flow
- **Error Handling**: Gracefully handle cases where backend logout request fails due to network issues or token invalidity
- **Development Environment Support**: Ensure functionality works consistently across test environment (port 3004) and development environment (port 3000)
- **State Management**: Properly reset all React Context state related to authentication and user data

## Approach

### Implementation Strategy

**Phase 1: Detection Implementation**
- Modify AppContext initialization to compare stored user data with `/api/v2/users/current` response
- Add conflict detection logic that compares user ID, email, and authentication state
- Implement detection trigger points during app initialization and route changes

**Phase 2: Cleanup Implementation**
- Create utility function to clear all authentication-related storage (localStorage, sessionStorage, cookies)
- Integrate with existing backend logout API endpoint used by current logout functionality
- Implement AppContext state reset to clear user, campaign, and related authentication data

**Phase 3: Silent Resolution**
- Use Next.js router for seamless redirection to `/login` without error notifications
- Ensure no toast messages, alert dialogs, or user-visible error states during conflict resolution
- Maintain clean user experience with immediate redirect and fresh authentication flow

**Phase 4: Error Handling & Edge Cases**
- Handle network failures during backend logout gracefully with fallback cleanup
- Manage token expiration scenarios and invalid token states
- Ensure consistent behavior across development and test environments

### Technical Implementation Details

**AppContext Modifications:**
```typescript
// In src/contexts/AppContext.tsx
const detectAuthConflict = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
  try {
    const currentUser = await ApiV2.getCurrentUser();
    return storedUser?.id !== currentUser?.id || storedUser?.email !== currentUser?.email;
  } catch (error) {
    // API call failed - likely invalid token
    return true;
  }
};
```

**Storage Cleanup Function:**
```typescript
const performSilentLogout = async () => {
  try {
    // Execute backend logout
    await ApiV2.logout();
  } catch (error) {
    // Continue with cleanup even if backend call fails
  }
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  document.cookie.split(";").forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  });
  
  // Reset AppContext state
  setUser(null);
  setCurrentCampaign(null);
  // Reset other auth-related state...
  
  // Silent redirect
  router.push('/login');
};
```

**Integration Points:**
- AppContext initialization hook
- Route change handlers in Next.js app
- API response interceptors for authentication errors

## External Dependencies

### Existing Chi War Infrastructure
- **Devise JWT Backend**: Leverage existing token-based authentication system
- **ApiV2 Client**: Use established API client for `/api/v2/users/current` and logout endpoints
- **AppContext**: Extend current React context provider for authentication state management
- **Next.js Router**: Utilize existing routing system for seamless redirection

### No Additional Dependencies Required
- Solution uses only existing Chi War infrastructure
- No new packages or external services needed
- Leverages established patterns in codebase

### Environment Compatibility
- **Development Environment**: Port 3000/3001 configuration
- **Test Environment**: Port 3004/3005 configuration  
- **Backend API**: Both V1 and V2 endpoint compatibility maintained
- **Frontend Routing**: Works with existing Next.js App Router structure