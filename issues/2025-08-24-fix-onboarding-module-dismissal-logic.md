# Fix Onboarding Module Dismissal Logic

**Date:** 2025-08-24
**Priority:** Medium
**Category:** Frontend/UI

## Description

The onboarding progress feature is partially implemented but has a critical bug: onboarding modules don't automatically dismiss when their completion milestones are achieved. Users see persistent onboarding prompts even after completing the required actions, creating a poor user experience.

The onboarding system should automatically hide modules when their associated milestone conditions are met (e.g., campaign created, characters added, etc.), but currently the dismissal logic is not working properly.

## Current Behavior

- Onboarding modules remain visible even after milestone completion
- Users must manually dismiss modules that should auto-hide
- Modules persist across page refreshes when they should be gone
- No clear feedback that milestones have been achieved

## Expected Behavior

- Modules automatically disappear when milestone conditions are met
- Clean, progressive onboarding experience 
- Proper state persistence across sessions
- Clear visual feedback for completed milestones

## Steps to Reproduce

1. Start with a new user account (or reset onboarding state)
2. Complete an onboarding milestone (e.g., create first campaign)
3. Observe that the relevant onboarding module remains visible
4. Refresh the page - module should be gone but persists
5. Check multiple milestone scenarios

## Related Files

**Frontend Components:**
- `/src/components/onboarding/OnboardingModule.tsx` - Individual module logic
- `/src/components/onboarding/OnboardingCarousel.tsx` - Container component
- `/src/components/onboarding/CongratulationsModule.tsx` - Completion feedback
- `/src/components/onboarding/CampaignOnboarding.tsx` - Campaign-specific onboarding
- `/src/lib/onboarding.ts` - Core onboarding logic and milestone detection
- `/src/hooks/useOnboardingHighlight.ts` - Highlighting system
- `/src/contexts/AppContext.tsx` - Global state management

**Backend (if needed):**
- User model milestone tracking fields
- Onboarding state persistence endpoints

## Investigation Notes

The issue appears to be in the milestone evaluation logic or state management:

1. **Milestone Detection**: Logic may not properly detect when conditions are met
2. **State Updates**: Component state might not update when milestones change  
3. **Persistence**: Dismissal state may not persist properly across sessions
4. **Race Conditions**: Async milestone checks might have timing issues

From recent changes in `feature/campaign-seed-data` branch, the onboarding system was updated but dismissal logic may have been missed.

## Proposed Solution

1. **Audit Milestone Logic**: Review `onboarding.ts` milestone detection functions
2. **Fix State Management**: Ensure proper state updates in `AppContext.tsx`
3. **Add Debug Logging**: Temporary logging to track milestone evaluation
4. **Test All Milestones**: Verify each onboarding step properly dismisses
5. **Persistence Layer**: Ensure dismissal state saves to backend/localStorage
6. **User Feedback**: Add visual confirmation when milestones are achieved

## Acceptance Criteria

- [ ] Onboarding modules automatically hide when milestones are completed
- [ ] State persists across page refreshes and sessions  
- [ ] No manual dismissal required for completed milestones
- [ ] Clear visual feedback when milestones are achieved
- [ ] Progressive onboarding flow works end-to-end
- [ ] No console errors related to onboarding state

## Screenshots

None currently - issue is behavioral rather than visual.

## Impact

**User Experience**: Poor - creates confusion and frustration with persistent UI elements
**Priority**: Medium - doesn't break core functionality but significantly impacts new user experience
**Effort**: Medium - requires debugging state management and milestone logic