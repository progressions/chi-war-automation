# Issue: View Switcher Not Refreshing List Data on Characters Page

**Date**: 2025-08-21  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description
When using the view switcher (SpeedDial menu) to change between Table View and Mobile View on the Characters List page, the component fails to refresh the list data after filtering. This results in showing only loading skeletons instead of the filtered character data.

## Steps to Reproduce
1. Navigate to `/characters`
2. Select "PC" from the "Type" dropdown filter
3. Confirm that the list of characters now shows only those of type "PC"
4. On the SpeedDial menu, click "Switch to Mobile View"
5. Confirm that it's showing the grid view with PC characters
6. Click "Switch to Table View"
7. Observe that it shows only the loading skeletons instead of the filtered PC characters

## Expected Behavior
When switching between Table View and Mobile View, the component should maintain the current filter state and display the filtered characters in the new view format.

## Actual Behavior
The component shows loading skeletons indefinitely and fails to display the filtered character data when switching back to Table View after applying filters.

## Related Files
- `shot-client-next/src/components/characters/List.tsx`
- `shot-client-next/src/components/characters/Table.tsx` (if separate table component)
- Any shared state management or data fetching hooks used by the Characters List page
- View switcher/SpeedDial component implementation

## Screenshots/Evidence
- Reproduction steps can be tested on the Characters page with the described workflow

## Investigation Notes
This appears to be a state management issue where:
- The view switcher changes the display mode but doesn't properly trigger data refetch
- The filter state may not be preserved or communicated properly between view modes
- Loading states may not be properly managed during view transitions

The issue likely affects other List pages that have similar view switcher functionality and filtering capabilities.

## Potential Solution
- Ensure view mode changes trigger appropriate data refetch with current filter state
- Verify that filter state is properly maintained across view mode changes
- Check if loading states are properly managed during view transitions
- Consider centralizing view mode and filter state management to prevent synchronization issues

## Related Issues
This may be part of a broader pattern affecting other List pages with view switchers and filtering functionality.