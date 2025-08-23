# Issue: GenericFilter Prevents Adding Multiple Copies of Same Character via Party-to-Fight

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description
The AddParty component using GenericFilter cannot successfully add multiple copies of the same character to a fight when adding the same party multiple times. This prevents common gameplay scenarios where you need multiple instances of the same character (e.g., multiple mooks).

## Steps to Reproduce
1. Navigate to a fight detail page
2. Use the AddParty component to select a party containing characters
3. Click "Add" to add the party to the fight
4. Select the same party again
5. Click "Add" again
6. Observe that duplicate characters are not properly added to the fight

## Expected Behavior
- Should be able to add the same party multiple times
- Each addition should append all party character_ids to fight.character_ids
- Fight should contain duplicate character IDs (e.g., ["char1", "char2", "char1", "char2"])
- This allows multiple instances of mooks or other characters in the same fight

## Actual Behavior
GenericFilter appears to prevent or interfere with the duplicate character addition process, though the exact mechanism is unclear.

## Related Files
- `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/fights/AddParty.tsx`
- `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/fights/Show.tsx` (handlePartyAdd function)
- `/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next/src/components/ui/filters/GenericFilter.tsx`

## Screenshots/Evidence
- Console logs show correct character_ids being merged in handlePartyAdd function
- UI may not reflect the expected character count increases

## Investigation Notes
- The underlying merge logic in handlePartyAdd appears correct:
  ```typescript
  character_ids: [...(fight.character_ids || []), ...(party.character_ids || [])]
  ```
- Issue suspected to be in GenericFilter component behavior rather than the merge logic
- May be related to form state management or UI update handling within GenericFilter

## Potential Solution
- Investigate GenericFilter component's onChange/selection behavior
- Consider alternative UI pattern that doesn't rely on GenericFilter for this use case
- May need to implement custom party selection component for fight-specific requirements

## Related Issues
None currently identified