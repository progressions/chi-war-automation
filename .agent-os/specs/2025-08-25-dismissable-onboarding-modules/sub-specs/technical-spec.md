# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/spec.md

> Created: 2025-08-25
> Version: 1.0.0

## Technical Requirements

### Frontend Requirements
- Add dismiss IconButton component to OnboardingCarousel and individual milestone modules using Material-UI Close icon
- Implement handleDismiss function to call new API endpoint with module identification
- Update onboarding component conditional rendering to check dismissed_modules array
- Position dismiss button consistently in top-right corner with absolute positioning
- Maintain existing Material-UI theming and Paper component styling

### Backend Requirements  
- Use existing OnboardingProgress fields and API endpoints to mark modules as completed/dismissed
- Leverage existing PATCH /api/v2/onboarding endpoint to update specific progress fields when modules are dismissed
- Map module dismissal to appropriate existing boolean fields (e.g., congratulations_dismissed_at, specific milestone completion flags)
- No new database fields or API endpoints required - work with existing onboarding progress structure

### State Management
- Update AppContext onboarding state to work with existing onboarding progress fields
- Modify onboarding visibility logic to check existing boolean fields for dismissal state
- Map frontend module dismissal to backend field updates (e.g., carousel dismissed → set appropriate milestone flags)
- Use existing context refresh logic to persist state across navigation

### User Settings Integration
- Add "Reset Onboarding" section to existing user settings/profile page
- Use existing PATCH /api/v2/onboarding endpoint to reset relevant progress fields to false
- Provide simple reset functionality to restore all onboarding modules
- Add confirmation dialog for reset action using existing toast notification system

### Field Mapping Strategy
- Map onboarding modules to existing OnboardingProgress boolean fields
- Use existing completion tracking fields to determine module visibility
- Leverage current API structure without requiring new endpoints or database changes

## Approach

### Implementation Strategy
1. **Database Layer**: Start with Rails migration and model updates to establish data structure
2. **Backend API**: Implement controller actions and serializer updates for dismiss/restore functionality
3. **Frontend Components**: Add dismiss UI elements to existing onboarding components
4. **State Management**: Update context and hooks to handle dismissed state
5. **User Interface**: Integrate restore functionality into settings page

### Component Architecture
- Extend existing OnboardingCarousel component with dismiss functionality
- Reuse Material-UI IconButton and Close icon for consistent styling
- Leverage existing toast notification system for user feedback
- Integrate with current user settings page layout and components

### Data Flow
1. User clicks dismiss button → Frontend calls dismiss API → Backend updates database → Frontend updates context
2. Component rendering checks both completion and dismissed state before showing modules
3. Settings page displays dismissed modules → User clicks restore → API clears dismissed state → Context refreshes

## External Dependencies

### Existing Dependencies (No Changes Required)
- Material-UI for UI components and icons
- Rails Active Record with JSONB support in PostgreSQL
- Existing authentication system via Devise JWT
- Current toast notification system
- Existing user settings page infrastructure

### Database Requirements
- PostgreSQL JSONB column type support (already available in current setup)
- No additional gems or packages required for implementation