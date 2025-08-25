# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/spec.md

## Existing API Usage

### PATCH /api/v2/onboarding (Standard Update Action)

**Purpose:** Update onboarding progress fields using standard Rails controller update action
**Authentication:** Required (JWT token)
**Current Usage:** This endpoint already exists and handles all onboarding progress updates

**Request Format:**
```javascript
// Example dismiss call
await apiClient.patch('/api/v2/onboarding', {
  onboarding_progress: {
    carousel_dismissed: true,
    milestone_characters_completed: true
  }
})
```

### Module Dismissal Strategy

**Frontend Implementation:**
- Use existing standard PATCH /api/v2/onboarding endpoint with standard Rails update action
- Send PATCH requests with specific field updates to mark modules as dismissed/completed
- Map each onboarding module to appropriate existing boolean fields in OnboardingProgress model
- No new API endpoints needed - leverage existing standard RESTful update functionality

### Field Mapping for Module Dismissal

**Onboarding Carousel Module:**
- Dismiss action: Set appropriate milestone completion flags to `true`
- Check existing fields like milestone completion booleans to determine visibility

**Individual Milestone Modules:**
- Map each milestone module to its corresponding boolean field
- Use existing milestone completion tracking to hide dismissed modules

### Restore Functionality

**Settings Reset:**
- Use existing PATCH /api/v2/onboarding endpoint to reset progress fields to `false`
- Provide bulk reset functionality through existing API structure
- No new endpoints required for restore operations

## Implementation Notes

**No New Backend Changes Required:**
- All necessary API endpoints already exist
- OnboardingProgress model fields are already available
- Current serialization includes all needed fields for frontend state management

**Frontend API Integration:**
- Use existing onboarding API client methods
- Update onboarding context to handle dismissal state through existing progress fields
- Leverage current error handling and success response patterns