# Dismissable Onboarding Progress Modules

**Date**: 2025-08-24  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description

The user onboarding process should allow users to manually dismiss progress modules by clicking a checkmark button. Each milestone module needs a check mark button that sets the corresponding milestone to true when clicked, allowing users to mark steps as complete even if they haven't technically completed them through the normal flow.

## Steps to Reproduce
1. Navigate through the onboarding process as a new user
2. View the onboarding progress modules/milestones
3. Look for way to manually dismiss or mark modules as complete
4. Notice there's no manual dismissal option

## Expected Behavior
- Each onboarding progress module should have a checkmark button
- Clicking the checkmark button marks that milestone as completed (sets milestone to true)
- Users can manually dismiss modules they don't want to see anymore
- Dismissed modules should not reappear in subsequent sessions
- Visual indication that module has been manually completed

## Actual Behavior
- Onboarding progress modules are not dismissable
- Users must complete the actual flow to progress milestones
- No manual override option for users who want to skip certain guidance

## Related Files
**Frontend (shot-client-next/):**
- Onboarding progress components and milestone tracking
- User milestone/progress state management
- Onboarding flow components
- API calls for updating user milestone status

**Backend (shot-server/):**
- User milestone/progress model and endpoints
- API endpoints for updating milestone completion status

## Investigation Notes

**Implementation Requirements:**
- Add checkmark/dismiss button to each onboarding progress module
- Button should call API to update user milestone status
- Visual feedback when milestone is manually marked complete
- Ensure manually completed milestones don't revert or reappear
- Consider different styling for manually vs naturally completed milestones

**UI/UX Considerations:**
- Checkmark button should be clearly visible but not intrusive
- Confirmation dialog or immediate action (consider user preference)
- Consistent styling with rest of onboarding system
- Accessible button labeling and keyboard navigation

**Backend Requirements:**
- API endpoint to update individual milestone status
- Validation that user can only update their own milestones
- Proper response handling for frontend state updates

## Potential Solution

**Frontend Changes:**
- Add dismiss/checkmark button to onboarding progress modules
- Implement click handler to call milestone update API
- Update local state after successful API response
- Add appropriate loading states and error handling

**Backend Changes:**
- Ensure PATCH/PUT endpoint exists for updating user milestones
- Add any missing validation for milestone updates

## Related Issues
- **Parent Feature**: `/issues/2025-08-23-new-user-onboarding-guidance.md`
- User onboarding system improvements