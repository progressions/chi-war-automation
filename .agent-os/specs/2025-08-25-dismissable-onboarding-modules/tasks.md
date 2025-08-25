# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/spec.md

> Created: 2025-08-25
> Status: Ready for Implementation

## Tasks

### Phase 1: Backend API Analysis and Testing Setup

**Task 1.1: Analyze Existing Onboarding API Structure**
- [ ] Review existing OnboardingProgress model fields and structure
- [ ] Document current API endpoints (`PATCH /api/v2/onboarding`) and their payload structure
- [ ] Map onboarding modules to existing boolean fields for dismissal state
- [ ] Create field mapping strategy document in sub-specs/

**Task 1.2: Create Backend Tests for Dismissal Logic**
- [ ] Write RSpec tests for updating specific onboarding progress fields via existing API
- [ ] Test field mapping strategy (module dismissal → appropriate boolean field updates)
- [ ] Verify existing serializer returns updated progress fields correctly
- [ ] Test edge cases for invalid field updates and authorization
- [ ] Run backend tests: `cd shot-server && bundle exec rspec spec/controllers/api/v2/onboarding_controller_spec.rb`

### Phase 2: Frontend Component Development

**Task 2.1: Add Dismiss Button Component**
- [ ] Write Playwright tests for dismiss button visibility and positioning
- [ ] Create reusable DismissButton component with Material-UI Close icon
- [ ] Add dismiss button to OnboardingCarousel component in top-right corner
- [ ] Style dismiss button with consistent positioning and hover states
- [ ] Test component renders properly across different screen sizes
- [ ] Run frontend tests: `cd test-scripts && node test-onboarding-dismissal.js`

**Task 2.2: Implement OnboardingCarousel Dismiss Functionality**
- [ ] Write Playwright tests for carousel dismiss interaction
- [ ] Add handleDismiss function to OnboardingCarousel component
- [ ] Integrate API call to update onboarding progress when carousel is dismissed
- [ ] Update carousel visibility logic to check dismissal state
- [ ] Add loading state during dismiss API call
- [ ] Implement toast notification for successful dismissal
- [ ] Run tests to verify carousel dismissal: `cd test-scripts && node test-carousel-dismiss.js`

**Task 2.3: Add Dismiss Functionality to Individual Milestone Modules**
- [ ] Write Playwright tests for individual module dismiss functionality
- [ ] Identify all dismissible milestone modules (excluding campaign creation)
- [ ] Add dismiss button to each milestone module component
- [ ] Implement module-specific dismiss handlers with appropriate API field mapping
- [ ] Update module visibility logic to respect dismissal state
- [ ] Test module dismissal persists across page refreshes and navigation
- [ ] Run tests to verify milestone dismissals: `cd test-scripts && node test-milestone-dismiss.js`

### Phase 3: State Management and Context Updates

**Task 3.1: Update Onboarding Context for Dismissed State**
- [ ] Write unit tests for context state management with dismissed modules
- [ ] Extend AppContext to track dismissed onboarding modules
- [ ] Update context refresh logic to handle dismissed state from API
- [ ] Modify onboarding visibility calculations to include dismissal checks
- [ ] Test context state persistence across user sessions
- [ ] Verify context updates trigger proper component re-renders
- [ ] Run context tests: `cd shot-client-next && npm run test:context`

**Task 3.2: API Integration for Module Dismissal**
- [ ] Write API integration tests for dismiss functionality
- [ ] Create API service methods for dismissing specific onboarding modules
- [ ] Implement error handling for dismiss API calls
- [ ] Add retry logic for failed dismiss requests
- [ ] Update existing API client methods to handle dismissal field updates
- [ ] Test API integration across different user states and permissions
- [ ] Run API integration tests: `cd test-scripts && node test-dismiss-api-integration.js`

### Phase 4: Settings and Restore Functionality

**Task 4.1: Add Reset Onboarding to User Settings**
- [ ] Write Playwright tests for settings page onboarding reset functionality
- [ ] Add "Reset Onboarding" section to existing user settings page
- [ ] Create reset confirmation dialog component
- [ ] Implement reset API call to clear all dismissal states
- [ ] Add success/error toast notifications for reset actions
- [ ] Update settings page layout to accommodate new section
- [ ] Run settings tests: `cd test-scripts && node test-settings-onboarding-reset.js`

**Task 4.2: Implement Onboarding Restore Logic**
- [ ] Write backend tests for onboarding progress reset functionality
- [ ] Create API endpoint handler for resetting onboarding progress fields
- [ ] Implement frontend logic to refresh onboarding state after reset
- [ ] Add confirmation step before resetting onboarding progress
- [ ] Test restore functionality returns user to initial onboarding state
- [ ] Verify restored modules appear correctly in onboarding flow
- [ ] Run restore tests: `cd test-scripts && node test-onboarding-restore.js`

### Phase 5: Integration Testing and User Experience

**Task 5.1: Comprehensive E2E Testing**
- [ ] Create comprehensive Playwright test covering full dismiss/restore workflow
- [ ] Test onboarding dismissal for new user registration flow
- [ ] Test onboarding dismissal for returning users with existing progress
- [ ] Validate dismissed modules stay hidden across browser sessions
- [ ] Test restore functionality returns proper onboarding state
- [ ] Verify no impact on existing onboarding completion tracking
- [ ] Run full E2E test: `cd test-scripts && node test-dismissable-onboarding-complete.js`

**Task 5.2: Visual and UX Testing**
- [ ] Write visual regression tests for dismiss button positioning
- [ ] Test dismiss button accessibility (keyboard navigation, screen readers)
- [ ] Verify dismiss functionality works across different viewport sizes
- [ ] Test Material-UI theme consistency with dismiss buttons
- [ ] Validate smooth transitions when modules are dismissed
- [ ] Test loading states and error handling UX
- [ ] Run visual tests: `cd test-scripts && node test-onboarding-visual-regression.js`

### Phase 6: Documentation and Deployment Preparation

**Task 6.1: Update Documentation**
- [ ] Document new dismiss functionality in component documentation
- [ ] Update user guide with dismiss and restore instructions
- [ ] Document API field mapping for future maintenance
- [ ] Create troubleshooting guide for dismiss functionality issues
- [ ] Update changelog with dismissable onboarding feature

**Task 6.2: Final Testing and Verification**
- [ ] Run complete test suite to verify no regressions
- [ ] Test dismiss functionality in development environment
- [ ] Verify all onboarding modules respect dismissal state
- [ ] Test cross-browser compatibility for dismiss functionality
- [ ] Run performance tests to ensure no impact on page load
- [ ] Final verification: `cd test-scripts && node test-complete-user-journey.js`

**Task 6.3: Deployment Preparation**
- [ ] Verify all tests pass in CI/CD pipeline
- [ ] Check database migration compatibility (none required for this feature)
- [ ] Confirm no breaking changes to existing onboarding flow
- [ ] Prepare deployment checklist and rollback plan
- [ ] Schedule deployment window for dismissable onboarding feature

## Success Criteria

- [ ] Users can dismiss individual onboarding modules with persistent state
- [ ] Dismissed modules remain hidden across browser sessions and page refreshes
- [ ] Users can restore all onboarding modules through settings page
- [ ] No impact on existing onboarding progress tracking or completion logic
- [ ] All existing tests continue to pass
- [ ] New functionality is fully tested with Playwright E2E tests
- [ ] UI maintains Material-UI design consistency
- [ ] Feature works across all supported browsers and viewport sizes