# Issue: Combined Defense Not Including Effects for Multiple Targets

**Date**: 2025-09-02
**Priority**: High
**Category**: Backend

## Description
When multiple targets are selected in the Attack Panel, the combined defense calculation does not include character effects (like "+5 from effects"), resulting in an incorrect defense value being used for combat calculations.

## Steps to Reproduce
1. Start a fight/encounter
2. Open the Attack Panel
3. Select an attacker (non-mook)
4. Select multiple targets (2 or more)
5. Observe the Defense field display

## Expected Behavior
- Penelope Andrews has Defense: 19 (14 base + 5 from effects)
- Shen Chang has Defense: 13
- Combined defense should be: 19 (highest) + 2 (number of targets) = 21

## Actual Behavior
- The defense calculation uses `CS.defense(t)` which only gets base defense without effects
- Penelope's base defense is 14 (without the +5 from effects)
- Calculation incorrectly uses: 14 + 2 = 16
- This incorrect value (16) is displayed and used in combat calculations

## Root Cause
The bug occurs because:
1. Single target defense correctly uses `CharacterEffectService.adjustedActionValue()` to include effects
2. Multiple target defense incorrectly uses `CS.defense(t)` which excludes effects
3. This inconsistency causes wrong defense values when characters have active effects

## Related Files
- `/shot-client-next/src/components/encounters/AttackPanel.tsx`:
  - Lines 437-454: Mook attacker with multiple targets
  - Lines 461-487: Multiple mook groups as targets
  - Lines 472-492: Mixed or non-mook targets
  - Lines 599-620: Recalculation when mook counts change

## Fix Applied
Changed all instances where `CS.defense(t)` was used to instead use `CharacterEffectService.adjustedActionValue()`:

```typescript
// Before (incorrect - excludes effects):
let defense = CS.defense(t)

// After (correct - includes effects):
const [_defenseChange, defense] = 
  CharacterEffectService.adjustedActionValue(
    t,
    "Defense", 
    encounter,
    false // don't ignore impairments
  )
```

This ensures that character effects are consistently applied to defense calculations for both single and multiple target scenarios.