# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/spec.md

> Created: 2025-08-25
> Status: COMPLETED
> Completed: 2025-08-31

## Tasks

### Phase 1: Backend API Analysis and Testing Setup

**Task 1.1: Analyze Existing Onboarding API Structure**
- [x] Review existing OnboardingProgress model fields and structure
- [x] Document current API endpoints (`PATCH /api/v2/onboarding`) and their payload structure
- [x] Map onboarding modules to existing boolean fields for dismissal state
- [x] Create field mapping strategy document in sub-specs/

**Task 1.2: Create Backend Tests for Dismissal Logic**
- [x] Write RSpec tests for updating specific onboarding progress fields via existing API
- [x] Test field mapping strategy (module dismissal → appropriate boolean field updates)
- [x] Verify existing serializer returns updated progress fields correctly
- [x] Test edge cases for invalid field updates and authorization
- [x] Run backend tests: `cd shot-server && bundle exec rspec spec/controllers/api/v2/onboarding_controller_spec.rb`

### Phase 2: Frontend Component Development

**Task 2.1: Add Dismiss Button Component**
- [x] Write Playwright tests for dismiss button visibility and positioning
- [x] Create reusable DismissButton component with Material-UI Close icon
- [x] Add dismiss button to OnboardingCarousel component in top-right corner
- [x] Style dismiss button with consistent positioning and hover states
- [x] Test component renders properly across different screen sizes
- [x] Run frontend tests: `cd test-scripts && node test-onboarding-dismissal.js`

**Task 2.2: Implement OnboardingCarousel Dismiss Functionality**
- [x] Write Playwright tests for carousel dismiss interaction
- [x] Add handleDismiss function to OnboardingCarousel component
- [x] Integrate API call to update onboarding progress when carousel is dismissed
- [x] Update carousel visibility logic to check dismissal state
- [x] Add loading state during dismiss API call
- [x] Implement toast notification for successful dismissal
- [x] Run tests to verify carousel dismissal: `cd test-scripts && node test-carousel-dismiss.js`

**Task 2.3: Add Dismiss Functionality to Individual Milestone Modules**
- [x] Write Playwright tests for individual module dismiss functionality
- [x] Identify all dismissible milestone modules (excluding campaign creation)
- [x] Add dismiss button to each milestone module component
- [x] Implement module-specific dismiss handlers with appropriate API field mapping
- [x] Update module visibility logic to respect dismissal state
- [x] Test module dismissal persists across page refreshes and navigation
- [x] Run tests to verify milestone dismissals: `cd test-scripts && node test-milestone-dismiss.js`

### Phase 3: State Management and Context Updates

**Task 3.1: Update Onboarding Context for Dismissed State**
- [x] Write unit tests for context state management with dismissed modules
- [x] Extend AppContext to track dismissed onboarding modules
- [x] Update context refresh logic to handle dismissed state from API
- [x] Modify onboarding visibility calculations to include dismissal checks
- [x] Test context state persistence across user sessions
- [x] Verify context updates trigger proper component re-renders
- [x] Run context tests: `cd shot-client-next && npm run test:context`

**Task 3.2: API Integration for Module Dismissal**
- [x] Write API integration tests for dismiss functionality
- [x] Create API service methods for dismissing specific onboarding modules
- [x] Implement error handling for dismiss API calls
- [x] Add retry logic for failed dismiss requests
- [x] Update existing API client methods to handle dismissal field updates
- [x] Test API integration across different user states and permissions
- [x] Run API integration tests: `cd test-scripts && node test-dismiss-api-integration.js`

### Phase 4: Settings and Restore Functionality

**Task 4.1: Add Reset Onboarding to User Settings**
- [x] Write Playwright tests for settings page onboarding reset functionality
- [x] Add "Reset Onboarding" section to existing user settings page
- [x] Create reset confirmation dialog component
- [x] Implement reset API call to clear all dismissal states
- [x] Add success/error toast notifications for reset actions
- [x] Update settings page layout to accommodate new section
- [x] Run settings tests: `cd test-scripts && node test-settings-onboarding-reset.js`

**Task 4.2: Implement Onboarding Restore Logic**
- [x] Write backend tests for onboarding progress reset functionality
- [x] Create API endpoint handler for resetting onboarding progress fields
- [x] Implement frontend logic to refresh onboarding state after reset
- [x] Add confirmation step before resetting onboarding progress
- [x] Test restore functionality returns user to initial onboarding state
- [x] Verify restored modules appear correctly in onboarding flow
- [x] Run restore tests: `cd test-scripts && node test-onboarding-restore.js`

### Phase 5: Integration Testing and User Experience

**Task 5.1: Comprehensive E2E Testing**
- [x] Create comprehensive Playwright test covering full dismiss/restore workflow
- [x] Test onboarding dismissal for new user registration flow
- [x] Test onboarding dismissal for returning users with existing progress
- [x] Validate dismissed modules stay hidden across browser sessions
- [x] Test restore functionality returns proper onboarding state
- [x] Verify no impact on existing onboarding completion tracking
- [x] Run full E2E test: `cd test-scripts && node test-dismissable-onboarding-complete.js`

**Task 5.2: Visual and UX Testing**
- [x] Write visual regression tests for dismiss button positioning
- [x] Test dismiss button accessibility (keyboard navigation, screen readers)
- [x] Verify dismiss functionality works across different viewport sizes
- [x] Test Material-UI theme consistency with dismiss buttons
- [x] Validate smooth transitions when modules are dismissed
- [x] Test loading states and error handling UX
- [x] Run visual tests: `cd test-scripts && node test-onboarding-visual-regression.js`

### Phase 6: Documentation and Deployment Preparation

**Task 6.1: Update Documentation**
- [x] Document new dismiss functionality in component documentation
- [x] Update user guide with dismiss and restore instructions
- [x] Document API field mapping for future maintenance
- [x] Create troubleshooting guide for dismiss functionality issues
- [x] Update changelog with dismissable onboarding feature

**Task 6.2: Final Testing and Verification**
- [x] Run complete test suite to verify no regressions
- [x] Test dismiss functionality in development environment
- [x] Verify all onboarding modules respect dismissal state
- [x] Test cross-browser compatibility for dismiss functionality
- [x] Run performance tests to ensure no impact on page load
- [x] Final verification: `cd test-scripts && node test-complete-user-journey.js`

**Task 6.3: Deployment Preparation**
- [x] Verify all tests pass in CI/CD pipeline
- [x] Check database migration compatibility (none required for this feature)
- [x] Confirm no breaking changes to existing onboarding flow
- [x] Prepare deployment checklist and rollback plan
- [x] Schedule deployment window for dismissable onboarding feature

## Success Criteria

- [x] Users can dismiss individual onboarding modules with persistent state
- [x] Dismissed modules remain hidden across browser sessions and page refreshes
- [x] Users can restore all onboarding modules through settings page
- [x] No impact on existing onboarding progress tracking or completion logic
- [x] All existing tests continue to pass
- [x] New functionality is fully tested with Playwright E2E tests
- [x] UI maintains Material-UI design consistency
- [x] Feature works across all supported browsers and viewport sizes

## Completion Notes

**Completed: 2025-08-31**

This specification has been fully implemented and deployed to production. Key accomplishments:

- Successfully implemented dismissable onboarding modules with persistent state management
- Added Material-UI dismiss buttons to all applicable onboarding components
- Integrated dismissal functionality with existing API endpoints without requiring database changes
- Implemented comprehensive settings page integration for onboarding reset
- Created full test coverage with Playwright E2E tests
- Maintained backward compatibility with existing onboarding flow
- Delivered seamless user experience with proper loading states and toast notifications

The feature is now live in production and provides users with improved control over their onboarding experience while maintaining the educational value of the onboarding system for users who choose to complete it.