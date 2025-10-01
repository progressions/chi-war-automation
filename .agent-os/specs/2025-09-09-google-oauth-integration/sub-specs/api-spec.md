# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-09-google-oauth-integration/spec.md

## Endpoints

### GET /api/v2/auth/google

**Purpose:** Initiate Google OAuth flow from the frontend
**Parameters:** 
- `redirect_uri` (optional): Custom redirect after successful auth
- `state` (optional): Client state to preserve through OAuth flow
**Response:** 
```json
{
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=...&state=..."
}
```
**Errors:** 
- 500: Google OAuth not configured
- 503: Google service unavailable

### GET /users/auth/google/callback

**Purpose:** Handle OAuth callback from Google (Devise OmniAuth route)
**Parameters:** 
- `code`: Authorization code from Google
- `state`: Security state parameter
**Response:** Redirect to frontend with JWT token in cookies
**Errors:** 
- 401: Invalid authorization code
- 422: Email already exists (redirect to login with message)
- 403: OAuth state mismatch (CSRF protection)

### POST /api/v2/auth/google/link

**Purpose:** Link Google account to existing authenticated user
**Parameters:** 
```json
{
  "authorization_code": "code_from_google_oauth_flow"
}
```
**Response:** 
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "provider": "google",
    "oauth_linked_at": "2025-09-09T12:00:00Z",
    "google_avatar_url": "https://..."
  }
}
```
**Errors:** 
- 401: User not authenticated
- 409: Google account already linked to another user
- 422: This account already has Google linked

### DELETE /api/v2/auth/google/unlink

**Purpose:** Remove Google authentication from user account
**Parameters:** None (uses current authenticated user)
**Response:** 
```json
{
  "success": true,
  "message": "Google account unlinked successfully"
}
```
**Errors:** 
- 401: User not authenticated
- 422: Cannot unlink - no password set (would lock out user)
- 404: No Google account linked

### POST /api/v2/auth/google/refresh

**Purpose:** Refresh Google OAuth tokens
**Parameters:** 
```json
{
  "refresh_token": "encrypted_refresh_token"
}
```
**Response:** 
```json
{
  "access_token": "new_access_token",
  "expires_in": 3600,
  "refresh_token": "new_refresh_token"
}
```
**Errors:** 
- 401: Invalid refresh token
- 403: Refresh token expired or revoked
- 503: Google service unavailable

### GET /api/v2/auth/status

**Purpose:** Check current authentication status and available methods
**Parameters:** None
**Response:** 
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "authentication_methods": ["password", "google"],
    "oauth_providers": [{
      "provider": "google",
      "linked_at": "2025-09-09T12:00:00Z",
      "last_used": "2025-09-09T14:00:00Z"
    }]
  }
}
```
**Errors:** 
- 401: Not authenticated

## Controllers

### Users::OmniauthCallbacksController

**Actions:**
- `google`: Handle successful Google OAuth callback
- `failure`: Handle OAuth failures with appropriate error messages

**Business Logic:**
```ruby
def google
  # Extract OAuth data from request
  # Check if user exists by email
  # If exists and has password:
  #   - Sign in and optionally link Google
  # If exists without password:
  #   - Update with Google provider info and sign in
  # If new user:
  #   - Create account with Google data
  #   - Auto-confirm email
  #   - Generate JWT token
  # Set cookies and redirect to frontend
end
```

**Error Handling:**
- OAuth denial: Redirect to login with message
- Email conflict: Redirect to login with account exists message
- Provider error: Log and show generic error message

### Api::V2::Auth::GoogleController

**Actions:**
- `initiate`: Generate OAuth authorization URL
- `link`: Link Google to authenticated account
- `unlink`: Remove Google authentication
- `refresh`: Refresh OAuth tokens
- `status`: Get authentication status

**Business Logic:**
```ruby
class Api::V2::Auth::GoogleController < Api::V2::BaseController
  before_action :authenticate_user!, except: [:initiate]
  
  def link
    # Validate authorization code
    # Exchange for tokens
    # Get Google user info
    # Check for conflicts
    # Update user with OAuth data
    # Create audit log entry
    # Return success with user data
  end
  
  def unlink
    # Check if user has password
    # Remove OAuth fields
    # Revoke refresh token with Google
    # Create audit log entry
    # Return success
  end
end
```

## Purpose

### OAuth Flow Integration
- Provides secure OAuth 2.0 flow with CSRF protection
- Supports both new registrations and existing user authentication
- Enables account linking for flexibility

### Token Management
- Integrates with existing JWT authentication system
- Implements refresh token rotation for enhanced security
- Maintains session continuity across authentication methods

### User Experience
- Reduces friction in registration process
- Provides single sign-on convenience
- Maintains user choice with multiple auth options

### Security & Compliance
- Audit logging for all OAuth events
- Secure token storage with encryption
- Rate limiting and abuse prevention
- GDPR-compliant data handling