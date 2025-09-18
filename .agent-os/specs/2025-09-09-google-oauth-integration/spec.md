# Spec Requirements Document

> Spec: Google OAuth Integration
> Created: 2025-09-09

## Overview

Implement Google OAuth authentication to allow users to sign in or create accounts using their Google credentials, reducing friction in the registration process and providing a convenient single sign-on option. This feature will integrate with the existing JWT-based authentication system while maintaining all current security features.

## User Stories

### New User Registration via Google

As a new user, I want to sign up using my Google account, so that I can quickly create an account without filling out forms and remembering another password.

The user visits the Chi War application and clicks "Continue with Google" on the registration page. They are redirected to Google's OAuth consent screen where they authorize the application to access their basic profile information (name and email). Upon successful authorization, they are automatically registered, their email is confirmed, and they are logged into the application with a JWT token. They are then directed to the campaign selection or creation flow as a new gamemaster.

### Existing User Login via Google

As an existing user, I want to sign in using my Google account, so that I can access my account quickly without entering my password.

The user clicks "Continue with Google" on the login page and is redirected to Google for authentication. After successful Google authentication, the system matches their Google email with their existing account and logs them in with their current campaign context preserved. If their account was originally created with email/password, they are prompted to link their Google account for future convenience.

### Account Linking for Existing Users

As an existing email/password user, I want to link my Google account, so that I can use either authentication method to access my account.

The user signs in with their existing email/password credentials and navigates to their profile settings. They click "Link Google Account" and complete the OAuth flow. Their account is now accessible via both their original password and Google OAuth, providing flexibility in how they access the platform.

## Spec Scope

1. **Google OAuth Button Integration** - Add "Continue with Google" button prominently on login and registration pages, including the upper right navigation area for unsigned users
2. **OAuth Flow Implementation** - Complete OAuth 2.0 flow with Google including authorization, callback handling, and token exchange
3. **Account Creation & Linking** - Support both new account creation via Google and linking Google to existing accounts
4. **JWT Token Management** - Integrate Google OAuth users with existing JWT authentication system including refresh token rotation
5. **Auto-Confirmation** - Automatically confirm email addresses for users registering via Google OAuth

## Out of Scope

- Other OAuth providers (Facebook, Discord, etc.)
- Google API access beyond basic profile/email
- Migration of existing users to Google-only authentication
- Removal of email/password authentication option
- Social features using Google contacts or profile data

## Expected Deliverable

1. Users can click "Continue with Google" to register or sign in, completing the entire flow in under 10 seconds
2. Existing users can link/unlink their Google account from profile settings
3. JWT tokens are properly issued and refreshed for Google OAuth users maintaining session continuity