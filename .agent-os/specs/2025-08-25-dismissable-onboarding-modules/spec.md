# Spec Requirements Document

> Spec: Dismissable Onboarding Modules
> Created: 2025-08-25
> Status: Planning

## Overview

Enhance the existing onboarding system by adding dismiss buttons to each module, allowing users to hide individual components while maintaining their progress state. This feature will improve user control over their onboarding experience by letting them focus on relevant content without losing their overall progress tracking.

## User Stories

### Experienced User Onboarding Control

As an experienced gamemaster who has used similar RPG tools before, I want to dismiss specific onboarding modules that I don't need, so that I can focus on the features that are new or relevant to my workflow without cluttering my interface.

The user can see a small "×" button in the top-right corner of each dismissible onboarding module. Clicking this button permanently hides that specific module while preserving their overall onboarding progress. They can restore dismissed modules through their user settings if needed later.

### Returning User Experience

As a returning user who completed some onboarding steps previously, I want to dismiss modules I've already learned from, so that I can see a cleaner interface focused on completing remaining setup tasks.

When the user returns to the application, they see their remaining active onboarding modules without the ones they've dismissed, allowing them to continue their setup journey with reduced visual complexity.

## Spec Scope

1. **Dismiss Button Integration** - Add dismiss buttons to the OnboardingCarousel component and individual milestone modules
2. **API Integration** - Use existing onboarding API endpoints to set appropriate progress fields to true when modules are dismissed
3. **Frontend State Management** - Update component logic to hide dismissed modules based on existing onboarding progress fields
4. **Settings Recovery Option** - Provide a way for users to restore dismissed modules by resetting relevant progress fields
5. **Visual State Management** - Hide dismissed modules while maintaining progress state using existing backend fields

## Out of Scope

- Creating new database fields, migrations, or API endpoints
- Modifying the campaign creation module (remains non-dismissible as it's foundational)
- Changing existing backend onboarding logic or data structures
- Adding dismiss functionality to modules outside the main onboarding flow
- Implementing complex restore functionality beyond simple field resets

## Expected Deliverable

1. Dismissible onboarding modules with persistent state that survives page refreshes and user sessions
2. Clean integration with existing Material-UI design system and onboarding progress tracking
3. Settings panel option allowing users to restore previously dismissed onboarding modules

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-25-dismissable-onboarding-modules/sub-specs/technical-spec.md