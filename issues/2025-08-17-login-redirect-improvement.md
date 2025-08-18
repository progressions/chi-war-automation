# Issue: Login should redirect to the referer page OR to the homepage

**Date**: 2025-08-17  
**Priority**: Medium  
**Category**: UI/UX  
**Status**: ✅ RESOLVED

## Description
Currently, the login functionality should be improved to redirect users to either the page they came from (referer) or to the homepage as a fallback. This would provide a better user experience by taking users back to where they intended to go after authentication.

## Steps to Reproduce
1. Navigate to any protected page while not logged in
2. Get redirected to login page
3. Enter valid credentials and sign in
4. Observe redirect behavior

## Expected Behavior
After successful login, the user should be redirected to:
1. The page they were trying to access (referer page) if available
2. The homepage (/) as a fallback if no referer is available

## Actual Behavior
Current redirect behavior may not properly handle returning users to their intended destination after authentication.

## Related Files
- `shot-client-next/src/app/(auth)/login/page.tsx` - Login page component
- `shot-client-next/src/contexts/AppContext.tsx` - Authentication context
- `shot-client-next/src/lib/getCurrentUser.ts` - User authentication logic
- `shot-client-next/src/middleware.ts` - Route protection middleware

## Screenshots/Evidence
- Reference test automation screenshots showing login flow behavior

## Investigation Notes
This enhancement would improve the user experience by maintaining the user's navigation context across the authentication flow. This is a common UX pattern that prevents users from losing their place in the application.

## Potential Solution
1. Store the referer URL when redirecting to login
2. Use Next.js router to redirect back to stored URL after successful authentication
3. Implement fallback to homepage if no referer is available
4. Consider using URLSearchParams or session storage to maintain the redirect URL

## Resolution

**Status**: ✅ RESOLVED  
**Date**: 2025-08-18  
**Branches**: `add-campaign-deactivate` (root, server, client)

### Changes Made

**Frontend (`shot-client-next`):**
- Updated `src/app/(auth)/login/page.tsx` to use `useSearchParams()` for redirect URL handling
- Login form now reads `redirect` parameter from URL query string
- After successful authentication, users are redirected to the intended page or homepage as fallback
- Implemented proper URL parameter handling: `const redirectTo = searchParams.get("redirect") || "/"`

**Backend & Routing:**
- Updated campaign guard logic in `src/lib/getCampaignGuard.ts` to properly redirect to `/campaigns` when no current campaign
- Fixed redirect flow so users visiting protected pages like `/fights` without current campaign are redirected to `/campaigns` (not `/login`)
- Maintained proper authentication flow while improving campaign-specific redirects

### Technical Details

The login redirect functionality was implemented as part of the campaign deactivate feature development. The login page now properly handles the `redirect` query parameter, ensuring users return to their intended destination after authentication.

**Key Implementation:**
```typescript
const redirectTo = searchParams.get("redirect") || "/"
// ... after successful login
router.push(redirectTo)
```

### Testing Validation

- ✅ Users visiting protected pages are properly redirected through login back to original destination
- ✅ Users without current campaign are redirected to `/campaigns` instead of login loop
- ✅ Login form respects redirect parameter from URL
- ✅ Fallback to homepage works when no redirect parameter provided

## Related Issues
- Related to overall authentication flow improvements
- Connected to campaign deactivate feature development