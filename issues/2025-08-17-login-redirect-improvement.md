# Issue: Login should redirect to the referer page OR to the homepage

**Date**: 2025-08-17  
**Priority**: Medium  
**Category**: UI/UX  
**Status**: Open

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

## Related Issues
- Related to overall authentication flow improvements