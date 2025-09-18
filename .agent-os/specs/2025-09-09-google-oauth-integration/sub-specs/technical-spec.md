# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-09-google-oauth-integration/spec.md

## Technical Requirements

### Google Cloud Setup Requirements
- Create Google Cloud Project with OAuth 2.0 credentials
- Configure authorized redirect URIs for development (http://localhost:3000/users/auth/google/callback) and production
- Enable Google+ API for user profile access
- Store Client ID and Client Secret in Rails credentials

### Backend Implementation Requirements

#### Authentication Flow
- Implement OmniAuth Google OAuth2 strategy in Devise configuration
- Handle OAuth callback in OmniauthCallbacksController with JWT token generation
- Support account linking for existing email/password users
- Implement refresh token rotation with secure storage
- Maintain existing JWT expiration and renewal patterns

#### User Model Enhancements
- Add OAuth provider fields (provider, uid) to User model
- Support multiple authentication methods per user account
- Handle Google profile data mapping (name, email, avatar_url)
- Implement account linking/unlinking logic with validation
- Auto-confirm email for Google OAuth registrations

#### Security Requirements
- Validate OAuth state parameter to prevent CSRF attacks
- Implement nonce verification for OAuth requests
- Secure storage of refresh tokens with encryption
- Rate limiting on OAuth callback endpoint
- Audit logging for authentication events

### Frontend Implementation Requirements

#### UI/UX Specifications
- Google Sign-In button following Google's branding guidelines
- Prominent placement on login/registration pages and upper right navigation
- Loading states during OAuth redirect flow
- Error handling for OAuth failures with user-friendly messages
- Success notifications after successful authentication

#### Authentication Flow Management
- Initiate OAuth flow with proper redirect URI
- Handle OAuth callback with JWT token extraction
- Update user context with OAuth user data
- Manage refresh token rotation in background
- Preserve campaign context during OAuth flow

#### Account Management Interface
- Profile settings section for Google account linking/unlinking
- Visual indicator showing linked authentication methods
- Confirmation dialogs for account linking operations
- Clear messaging about authentication options available

### Integration Requirements

#### API Endpoint Modifications
- Extend `/api/v2/users/current` to include OAuth provider information
- Add `/api/v2/auth/google` endpoint for initiating OAuth flow
- Implement `/api/v2/auth/google/link` for account linking
- Create `/api/v2/auth/google/unlink` for removing Google authentication

#### Session Management
- Maintain JWT cookie structure for OAuth users
- Handle refresh token rotation transparently
- Support concurrent sessions across devices
- Implement proper logout flow for OAuth sessions

#### Error Handling
- Graceful handling of Google service outages
- Clear messaging for duplicate email scenarios
- Recovery flow for expired refresh tokens
- Fallback to password authentication when needed

### Performance Criteria
- OAuth flow completion in under 3 seconds (excluding Google's time)
- JWT token generation within 100ms of callback
- No blocking operations during OAuth callback processing
- Efficient caching of Google user profile data
- Minimal impact on existing authentication performance

## External Dependencies

**omniauth-google-oauth2** (version ~> 1.1)
- Purpose: Google OAuth 2.0 strategy for OmniAuth
- Justification: Official and well-maintained gem for Google OAuth integration with Rails/Devise

**omniauth-rails_csrf_protection** (version ~> 1.0)
- Purpose: CSRF protection for OmniAuth endpoints
- Justification: Required security enhancement for OmniAuth in Rails 7+

**google-id-token** (version ~> 1.4)
- Purpose: Verify and decode Google ID tokens
- Justification: Needed for secure token validation and refresh token rotation