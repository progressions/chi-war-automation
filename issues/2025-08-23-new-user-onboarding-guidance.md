# New User Onboarding Guidance Dashboard

**Date**: 2025-08-23  
**Priority**: High  
**Category**: UI/UX  
**Status**: Open

## Description

New users who sign up are immediately redirected to `/campaigns` where they see an empty table with only a speed dial create button. This provides no context about what campaigns are, what they should do next, or how to get started with the platform.

**UPDATE**: This issue has been expanded into a comprehensive progressive onboarding system with milestone tracking. See `/specs/progressive-onboarding-system.md` for full technical specification.

## Problem Statement

- New users land on empty campaigns page with no guidance
- No explanation of what campaigns are or why they need one
- No onboarding flow to help users understand the platform
- Missing calls-to-action for common first-time user tasks

## Expected Behavior

Progressive onboarding system with milestone-based tracking:

**Phase 1 - Pre-Campaign:**
- Single CTA module: "Ready to start your first campaign?"
- Context about what campaigns are and why they're needed

**Phase 2 - Post-Campaign (Carousel):**
- Adaptive carousel showing remaining milestones: Character, Fight, Faction, Party, Site
- Visual completion indicators for achieved milestones
- Contextual guidance with pointers to relevant UI elements

**Phase 3 - Graduation:**
- Congratulations module when all milestones complete
- Dismissible celebration that permanently exits onboarding
- "Congratulations shown" milestone tracked with timestamp

## Related Files

**Backend (shot-server/):**
- `app/models/onboarding_progress.rb` - New model for milestone tracking
- `app/models/concerns/onboarding_trackable.rb` - Reusable concern for automatic milestone tracking
- `app/serializers/onboarding_progress_serializer.rb` - API serialization
- `app/controllers/api/v2/onboarding_controller.rb` - API endpoints
- `db/migrate/*_create_onboarding_progresses.rb` - Database migration

**Frontend (shot-client-next/):**
- `src/components/onboarding/OnboardingModule.tsx` - Main onboarding component
- `src/components/onboarding/OnboardingCarousel.tsx` - Milestone carousel
- `src/components/onboarding/CongratulationsModule.tsx` - Graduation celebration
- `src/components/onboarding/OnboardingPointer.tsx` - Visual UI pointers
- `src/app/(main)/layout.tsx` - Layout integration
- `src/lib/onboarding.ts` - Milestone configuration and utilities

## Investigation Notes

**Current State:**
- Users with no campaigns get redirected to `/campaigns` via `requireCampaign()`
- The campaigns page shows empty table with speed dial create button
- No contextual help or onboarding guidance exists

**Progressive Onboarding Requirements:**
- Track 7 milestones with timestamps: Campaign, Character, Fight, Faction, Party, Site, plus Congratulations Dismissed
- Automatic milestone detection via model callbacks regardless of user path
- Contextual carousel interface that adapts based on current page and completion state
- Visual pointers directing attention to SpeedDial and relevant UI elements
- Graduation flow with dismissible congratulations module

## Implementation Strategy

**Phase 1: Backend Infrastructure (2-3 days)**
1. Create OnboardingProgress model with timestamp fields for all milestones
2. Build OnboardingTrackable concern for automatic milestone detection 
3. Add User association and update serializers to include onboarding data
4. Create API endpoint for congratulations dismissal

**Phase 2: Frontend Onboarding Module (3-4 days)**
1. Create OnboardingModule component with conditional rendering logic
2. Build CampaignOnboarding single CTA for pre-campaign users
3. Implement OnboardingCarousel with milestone navigation and completion indicators
4. Create CongratulationsModule with dismissal functionality
5. Integrate module into main layout

**Phase 3: Contextual Guidance & Pointers (2-3 days)**
1. Implement OnboardingPointer component with CSS animations
2. Add page-aware messaging system that adapts based on current route
3. Create visual highlighting system for SpeedDial and other UI targets
4. Ensure responsive design across mobile and desktop

**Phase 4: Testing & Polish (1-2 days)**
1. Create end-to-end tests for complete onboarding journey
2. Handle edge cases (entity deletion, concurrent creation, etc.)
3. Performance optimization and bundle size considerations
4. Documentation and code review

## Success Criteria

- New users see contextual guidance instead of empty tables
- All 7 milestones tracked automatically regardless of completion path
- Carousel interface provides clear progression through platform features
- Congratulations celebration provides satisfying completion experience
- System gracefully handles edge cases and user variations
- No performance impact on existing application functionality