# JWT Token Handling Mismatch Issue

**Date**: 2025-08-18
**Priority**: High
**Type**: Bug

## Issue Description

There's a mismatch between how JWT tokens are stored during login and how the frontend attempts to read them, causing authentication failures in tests and potentially affecting user experience.

## Current Behavior

**Backend (Devise JWT):**
- Configured to automatically set Authorization header on login responses
- Should set JWT token in response headers for frontend to read

**Frontend Login (src/app/(auth)/login/page.tsx):**
- Expects JWT token in `Authorization` header: `response.headers.get("Authorization")?.split(" ")?.[1]`
- Attempts to store token in cookies: `Cookies.set("jwtToken", token, {...})`

**Frontend App Context (src/contexts/AppContext.tsx):**
- Reads JWT token from cookies: `Cookies.get("jwtToken")`
- Uses this token for all API requests

**Actual Test Behavior:**
- JWT tokens appear in localStorage with keys like `currentUser-<token>`
- No JWT token found in cookies (`jwtToken`)
- Frontend cannot authenticate API requests despite successful login

## Expected Behavior

- Login should store JWT token in cookies as `jwtToken`
- Frontend should be able to read JWT token from cookies
- All subsequent API requests should be authenticated
- Tests should pass authentication flows

## Technical Details

**Files Involved:**
- `src/app/(auth)/login/page.tsx` - Login form and token handling
- `src/contexts/AppContext.tsx` - Token reading and client initialization
- `app/controllers/users/sessions_controller.rb` - Backend login response
- `config/initializers/devise.rb` - Devise JWT configuration

**Root Cause:**
- Custom sessions controller may be interfering with Devise JWT automatic header setting
- Frontend expects Authorization header but backend may not be setting it correctly
- Token storage mechanism inconsistent between cookies and localStorage

## Impact

- **High**: Breaks authentication flow in tests
- **Medium**: May affect user login experience
- **Testing**: Prevents validation of no-campaign and other user flows

## Acceptance Criteria

- [x] JWT token properly set in Authorization header on login response
- [x] Frontend successfully stores JWT token in cookies as `jwtToken`
- [x] AppContext reads JWT token from cookies correctly
- [x] All API requests include valid JWT token
- [x] Playwright tests pass authentication flows
- [x] No-campaign flow tests pass completely

## Resolution

**Status**: ✅ RESOLVED  
**Date**: 2025-08-18  
**Branches**: `fix-jwt-auth` (root, server, client)

### Changes Made

**Backend (`shot-server`):**
- Modified `Users::SessionsController` to manually set Authorization header with JWT token
- Updated both `create` and `respond_with` methods for consistency
- Fixes issue where Devise JWT automatic header setting was bypassed

**Frontend (`shot-client-next`):**
- Added error handling for missing JWT tokens in login response
- Fixed cookie security settings for development (secure: false for localhost)
- Ensures JWT tokens are properly stored in cookies during development

**Testing:**
- Created comprehensive JWT authentication validation test
- Verified JWT token generation, header setting, cookie storage, and login flow
- All authentication flows now working correctly

### Technical Details

The root cause was that the custom sessions controller was overriding Devise JWT's automatic header setting, and the frontend cookie security settings prevented storage on localhost. The fix ensures proper JWT token flow from backend generation to frontend storage and usage.

## Debugging Steps

1. Check if Devise JWT is setting Authorization header correctly
2. Verify custom sessions controller isn't overriding Devise JWT behavior
3. Confirm frontend login code reads Authorization header properly
4. Test cookie setting/reading mechanism
5. Validate that AppContext uses cookies for token retrieval

## Related Files

- `src/app/(auth)/login/page.tsx:37` - Token extraction from header
- `src/app/(auth)/login/page.tsx:38` - Cookie setting
- `src/contexts/AppContext.tsx:84` - Cookie reading
- `app/controllers/users/sessions_controller.rb` - Custom login logic
- `config/initializers/devise.rb` - JWT configuration

## Priority Justification

This blocks testing validation and may affect production authentication. Should be resolved before deployment of no-campaign feature.