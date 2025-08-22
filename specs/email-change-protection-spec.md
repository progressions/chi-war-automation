# Email Change Protection Implementation Specification

## Overview

This specification implements email change protection for user profiles by adding a confirmation dialog that prevents accidental email address changes. The feature ensures users explicitly confirm email modifications before they are applied, protecting against unintended account access issues.

## Goals

- Prevent accidental email address changes
- Provide clear warnings about email change implications
- Maintain user-friendly form editing experience
- Ensure accessibility and mobile responsiveness

## Implementation Plan

### Phase 1: Email Change Detection

#### 1.1 Form State Enhancement

**Location**: `shot-client-next/src/components/users/ProfileForm.tsx`

Add email change detection to the profile form:

```typescript
interface ProfileFormState {
  formData: UserFormData
  originalEmail: string
  emailChanged: boolean
  showEmailConfirmation: boolean
}

const detectEmailChange = (original: string, current: string): boolean => {
  return original.toLowerCase().trim() !== current.toLowerCase().trim()
}
```

#### 1.2 Submission Interception

Modify form submission handler to detect email changes:

```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  
  const emailChanged = detectEmailChange(originalEmail, formData.email)
  
  if (emailChanged) {
    setShowEmailConfirmation(true)
    return // Don't submit yet
  }
  
  // Normal submission for non-email changes
  await updateUser(formData)
}
```

### Phase 2: Confirmation Dialog Component

#### 2.1 EmailChangeConfirmation Component

**Location**: `shot-client-next/src/components/ui/EmailChangeConfirmation.tsx`

Create reusable confirmation dialog:

```typescript
interface EmailChangeConfirmationProps {
  open: boolean
  currentEmail: string
  newEmail: string
  onConfirm: () => void
  onCancel: () => void
}

function EmailChangeConfirmation({
  open,
  currentEmail,
  newEmail,
  onConfirm,
  onCancel
}: EmailChangeConfirmationProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Confirm Email Address Change</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Changing your email address will affect your login credentials and account recovery options.
        </Alert>
        
        <Typography variant="body1" gutterBottom>
          Are you sure you want to change your email address?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Current email: <strong>{currentEmail}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            New email: <strong>{newEmail}</strong>
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          You will need to use the new email address for future logins.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color="warning">
          Confirm Change
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

#### 2.2 Dialog Integration

**Location**: `shot-client-next/src/components/users/ProfileForm.tsx`

Integrate confirmation dialog with form:

```typescript
const handleEmailChangeConfirm = async () => {
  setShowEmailConfirmation(false)
  await updateUser(formData)
}

const handleEmailChangeCancel = () => {
  setShowEmailConfirmation(false)
  setFormData({ ...formData, email: originalEmail }) // Revert to original
}

return (
  <>
    <form onSubmit={handleSubmit}>
      {/* Existing form fields */}
    </form>
    
    <EmailChangeConfirmation
      open={showEmailConfirmation}
      currentEmail={originalEmail}
      newEmail={formData.email}
      onConfirm={handleEmailChangeConfirm}
      onCancel={handleEmailChangeCancel}
    />
  </>
)
```

### Phase 3: Testing Implementation

#### 3.1 Component Testing

**Location**: `shot-client-next/src/components/ui/__tests__/EmailChangeConfirmation.test.tsx`

Unit tests for confirmation dialog:
- Rendering with proper content
- Confirm and cancel button functionality
- Accessibility compliance
- Responsive design

#### 3.2 Integration Testing

**Location**: `shot-client-next/src/components/users/__tests__/ProfileForm.test.tsx`

Integration tests for profile form:
- Email change detection
- Form submission with and without email changes
- Dialog state management
- Form data reversion on cancel

#### 3.3 End-to-End Testing

**Location**: `chi-war/test-scripts/test-email-change-protection-e2e.js`

E2E tests using Playwright:
- Complete email change flow with confirmation
- Cancellation behavior and form state
- Mobile responsiveness testing
- Accessibility testing with screen readers

## Implementation Steps

### Step 1: Email Change Detection
1. [ ] Modify ProfileForm component to track original email
2. [ ] Implement email change detection logic
3. [ ] Add submission interception for email changes
4. [ ] Write unit tests for detection logic

### Step 2: Confirmation Dialog
1. [ ] Create EmailChangeConfirmation component
2. [ ] Implement Material-UI dialog with proper styling
3. [ ] Add accessibility features (ARIA labels, focus management)
4. [ ] Test responsive design on different screen sizes

### Step 3: Form Integration
1. [ ] Integrate confirmation dialog with ProfileForm
2. [ ] Handle confirmation and cancellation flows
3. [ ] Maintain form state throughout the process
4. [ ] Add proper error handling and loading states

### Step 4: Testing Suite
1. [ ] Write comprehensive unit tests
2. [ ] Create integration tests for the complete flow
3. [ ] Implement E2E tests with Playwright
4. [ ] Test accessibility compliance

### Step 5: Final Integration
1. [ ] Ensure compatibility with existing profile page
2. [ ] Test with different user types (gamemaster/player)
3. [ ] Verify API error handling
4. [ ] Conduct user acceptance testing

## Technical Requirements

### Frontend Components
- Material-UI Dialog with responsive design
- Proper focus management for accessibility
- Clear visual hierarchy and messaging
- Mobile-first responsive design

### State Management
- React useState for form and dialog state
- Proper state cleanup on component unmount
- Error state handling

### API Integration
- Maintain existing userClient.updateUser method
- Proper error handling for API failures
- Loading states during form submission

## Acceptance Criteria

- [ ] Form detects email changes accurately (case-insensitive, trimmed)
- [ ] Confirmation dialog appears only when email is changed
- [ ] Dialog displays current and new email addresses clearly
- [ ] Security warning is prominent and understandable
- [ ] "Confirm Change" proceeds with API update
- [ ] "Cancel" reverts email field and closes dialog
- [ ] Form submits normally for non-email changes
- [ ] Dialog is accessible (keyboard navigation, screen readers)
- [ ] Mobile responsive design works properly
- [ ] Loading states are handled during confirmation flow
- [ ] Error handling works after confirmation
- [ ] ESC key cancels the change

## Security Considerations

- Client-side validation only for UX (server validates)
- No sensitive data exposed in dialog content
- Proper input sanitization maintained
- No bypass mechanisms for confirmation

## User Experience Goals

- Minimal friction for non-email changes
- Clear communication of security implications
- Intuitive confirmation flow
- Accessible to users with disabilities
- Consistent with application design language

## Success Metrics

- Zero accidental email changes reported
- User feedback positive on confirmation clarity
- No usability issues with form editing
- Accessibility compliance verified
- Mobile usability maintained

This specification provides a complete roadmap for implementing email change protection while maintaining a smooth user experience and ensuring security best practices.