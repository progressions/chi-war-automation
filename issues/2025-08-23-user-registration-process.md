# User Registration Process Implementation

**Date:** 2025-08-23  
**Priority:** Medium  
**Category:** Authentication  
**Status:** Open  

## Description

The application currently lacks a user registration process. Users can only be created through admin actions or seeded data. We need to implement a complete registration flow that allows new users to sign up for accounts and join campaigns.

## Problem Statement

- No public registration endpoint exists in the backend API
- Frontend has no registration form or signup flow
- New users cannot create accounts independently
- Campaign invitation system exists but requires pre-existing users

## Expected Behavior

Users should be able to:
- Visit a registration page
- Fill out a signup form (email, password, first name, last name)
- Receive email confirmation (if configured)
- Be redirected to login or dashboard after successful registration
- Join campaigns via invitation links

## Related Files

**Backend (shot-server/):**
- `app/controllers/api/v2/registrations_controller.rb` (new)
- `config/routes.rb` (add registration routes)
- `app/models/user.rb` (may need validation updates)
- `spec/requests/api/v2/registrations_spec.rb` (new tests)

**Frontend (shot-client-next/):**
- `src/app/register/page.tsx` (new registration page)
- `src/components/auth/RegistrationForm.tsx` (new component)
- `src/lib/ApiV2.ts` (add registration API calls)
- `src/types/auth.ts` (registration types)

## Investigation Notes

- Devise gem is already configured for authentication
- Need to ensure registration endpoints follow existing API v2 patterns
- Consider email confirmation requirements
- Registration should integrate with existing JWT token system
- May need to update CORS settings for registration endpoints

## Next Steps

1. Create detailed specification in `specs/` directory
2. Implement backend registration API endpoints
3. Add frontend registration form and flow
4. Write comprehensive tests for registration process
5. Update authentication documentation