# Password Reset Frontend Implementation Specification

**Date**: 2025-08-21  
**Status**: Phase 2 Implementation - Frontend Components  
**Related Issue**: [2025-08-21-modernize-user-password-reset-system.md](../issues/2025-08-21-modernize-user-password-reset-system.md)

## Overview

This specification covers the frontend implementation (Phase 2) of the modernized password reset system. The backend security foundation has been completed in Phase 1, and now we need to create modern React components and pages that provide a secure, user-friendly password reset experience.

## Current State

✅ **Backend Complete (Phase 1):**
- Enhanced `Users::PasswordsController` with rate limiting and security features
- Professional HTML/plaintext email templates 
- Comprehensive RSpec test suite (18 tests passing)
- Rate limiting: 3 per hour per email, 5 per hour per IP
- Password strength validation and email format checking

🔄 **Frontend Implementation Needed (Phase 2):**
- Password reset request page (`/forgot-password`)
- Password reset form page (`/reset-password/[token]`)
- Integration with login page
- React components following current design patterns
- API client methods for password operations

## Frontend Architecture Requirements

### Pages to Implement

#### 1. Forgot Password Request Page
**Route**: `/forgot-password`
**File**: `src/app/(auth)/forgot-password/page.tsx`

**Requirements:**
- Email input with validation
- Rate limiting feedback display
- Clear security messaging
- Link back to login page
- Mobile-responsive design
- Integration with current design system

#### 2. Password Reset Form Page  
**Route**: `/reset-password/[token]`
**File**: `src/app/(auth)/reset-password/[token]/page.tsx`

**Requirements:**
- Token validation and expiry checking
- New password input with strength requirements
- Password confirmation field
- Real-time validation feedback
- Success/error state handling
- Redirect to login after successful reset

### Components to Create

#### 1. ForgotPasswordForm Component
**File**: `src/components/auth/ForgotPasswordForm.tsx`

**Props Interface:**
```typescript
interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
}
```

**Features:**
- Email input with validation
- Submit button with loading state  
- Error/success message display using FormHelperText
- Rate limiting feedback
- Accessibility compliance (ARIA labels)

#### 2. ResetPasswordForm Component
**File**: `src/components/auth/ResetPasswordForm.tsx`

**Props Interface:**
```typescript
interface ResetPasswordFormProps {
  token: string;
  onSubmit: (password: string, passwordConfirmation: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  success?: boolean;
  tokenValid?: boolean;
}
```

**Features:**
- New password input with strength validation
- Password confirmation with matching validation
- Real-time strength indicator
- Submit button with loading state
- Error/success message display
- Token expiry handling

### API Integration

#### API Client Methods
**File**: `src/lib/client/authClient.ts`

**Methods to Add:**
```typescript
// Request password reset
async requestPasswordReset(email: string): Promise<{
  message: string;
  retryAfter?: number;
}>

// Reset password with token
async resetPassword(token: string, password: string, passwordConfirmation: string): Promise<{
  message: string;
  redirect?: string;
}>

// Validate reset token
async validateResetToken(token: string): Promise<{
  valid: boolean;
  expired?: boolean;
  email?: string;
}>
```

#### API Routes Helper
**File**: `src/lib/ApiV2.ts`

**Routes to Add:**
```typescript
export const routes = {
  // ... existing routes
  auth: {
    // ... existing auth routes
    requestPasswordReset: () => '/users/password',
    resetPassword: () => '/users/password',
    validateResetToken: (token: string) => `/users/password/validate/${token}`,
  }
}
```

### Integration Points

#### 1. Login Page Update
**File**: `src/app/(auth)/login/page.tsx`

**Changes Required:**
- Add "Forgot Password?" link below login form
- Link should navigate to `/forgot-password`
- Style consistently with current login page design

#### 2. Middleware Update  
**File**: `src/middleware.ts`

**Changes Required:**
- Add `/forgot-password` to public routes
- Add `/reset-password/[token]` to public routes
- Ensure unauthenticated access is allowed

## User Experience Flow

### 1. Password Reset Request Flow
1. User clicks "Forgot Password?" on login page
2. Navigate to `/forgot-password`
3. User enters email address
4. Form validates email format client-side
5. API request sent to backend
6. Success: Show confirmation message with instructions
7. Error: Show rate limiting or validation message

### 2. Password Reset Completion Flow
1. User clicks reset link in email
2. Navigate to `/reset-password/[token]`
3. Validate token on page load
4. If valid: Show password reset form
5. If invalid/expired: Show error message with option to request new reset
6. User enters new password with confirmation
7. Real-time validation feedback
8. Success: Redirect to login with success message
9. Error: Show validation or server error messages

## Validation Requirements

### Client-Side Validation

#### Email Validation (Forgot Password)
- Required field validation
- Basic email format checking (RFC 5322 patterns)
- Length limits (max 254 characters)
- Clear error messages via FormHelperText

#### Password Validation (Reset Password)
- Minimum 8 characters required
- Must contain letters and numbers
- Password confirmation must match
- Real-time strength indicator
- Clear requirement messaging

### Server Response Handling

#### Success Responses
```typescript
// Request password reset success
{
  message: "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."
}

// Reset password success  
{
  message: "Your password has been changed successfully.",
  redirect: "/login"
}
```

#### Error Responses
```typescript
// Rate limiting
{
  error: "Too many password reset attempts. Please wait before trying again.",
  retry_after: 3600
}

// Invalid email format
{
  error: "Invalid email format",
  field: "email"
}

// Invalid/expired token
{
  error: "Password reset token is invalid or has expired"
}

// Password validation errors
{
  error: "Password is too short (minimum is 8 characters)",
  field: "password"
}
```

## Design System Integration

### Component Styling
- Use Material UI components consistent with current app
- Follow existing form component patterns from invitation system
- Use `FormHelperText` for error/success messages
- Implement responsive design breakpoints
- Dark theme compatibility

### Color and Typography
- Error messages: Use theme error color
- Success messages: Use theme success color  
- Form inputs: Standard Material UI TextField styling
- Headers: Typography variants matching login page
- Loading states: Standard CircularProgress components

## Testing Requirements

### Frontend Component Tests
- Unit tests for ForgotPasswordForm component
- Unit tests for ResetPasswordForm component  
- Integration tests for page components
- API client method testing
- Error state handling tests

### End-to-End Testing
- Complete password reset flow testing
- Rate limiting behavior verification
- Token validation and expiry testing
- Mobile device compatibility testing
- Email link clicking and navigation

## Accessibility Requirements

### ARIA Compliance
- Proper ARIA labels for all form inputs
- Screen reader announcements for error/success states
- Keyboard navigation support
- Focus management between form fields

### Semantic HTML
- Proper form element nesting
- Descriptive button text
- Error message association with form inputs
- Progressive enhancement support

## Security Considerations

### Frontend Security
- No sensitive token information stored in client state
- Proper token handling in URL parameters
- HTTPS-only cookie handling
- XSS prevention in error message display

### Rate Limiting UX
- Clear messaging when rate limits are hit
- Countdown timers for retry availability
- Progressive enhancement if JavaScript disabled
- Graceful fallback for API failures

## Implementation Checklist

### Core Components
- [ ] Create `ForgotPasswordForm.tsx` component
- [ ] Create `ResetPasswordForm.tsx` component  
- [ ] Create `/forgot-password` page component
- [ ] Create `/reset-password/[token]` page component

### API Integration
- [ ] Add password reset methods to `authClient.ts`
- [ ] Update `ApiV2.ts` with password reset routes
- [ ] Implement error response handling
- [ ] Add loading state management

### Integration Points
- [ ] Update login page with "Forgot Password" link
- [ ] Update middleware for public routes
- [ ] Test authentication flow integration
- [ ] Verify mobile responsiveness

### Testing & Polish
- [ ] Write component unit tests
- [ ] Create E2E test scenarios
- [ ] Test email link functionality
- [ ] Verify accessibility compliance
- [ ] Performance optimization

## Success Criteria

### Functional Requirements
- [ ] Users can request password resets via email
- [ ] Users can complete password resets via email links
- [ ] Rate limiting prevents abuse (matches backend limits)
- [ ] Password strength requirements enforced
- [ ] Token validation prevents unauthorized resets

### User Experience Requirements  
- [ ] Mobile-responsive design works on all devices
- [ ] Clear error/success messaging throughout flow
- [ ] Consistent styling with current app design
- [ ] Loading states provide appropriate feedback
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Integration Requirements
- [ ] Seamless integration with existing authentication
- [ ] API responses handled correctly
- [ ] Email templates render properly in email clients
- [ ] Password reset flow completes end-to-end
- [ ] No breaking changes to existing login functionality

## Technical Notes

### URL Structure
- `/forgot-password` - Public route for password reset requests
- `/reset-password/[token]` - Public route for password reset form
- Token parameter extracted from URL for API calls
- Proper error handling for malformed URLs

### State Management
- Local component state for form data
- Loading/error states managed at component level
- Success states trigger navigation to appropriate pages
- No global state requirements for password reset flow

### Error Handling Strategy
- Display user-friendly messages for all error states
- Log technical errors for debugging
- Graceful degradation if API unavailable
- Retry mechanisms for transient failures

This specification ensures the frontend implementation provides a modern, secure, and user-friendly password reset experience that integrates seamlessly with the existing application architecture and design system.