# Issue: Mobile/Table View Switcher Shows Skeleton Loading After Switch Back

**Date**: 2025-01-22  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description
When using the SpeedDial on List pages to switch from Table View to Mobile View and then back to Table View, the table shows only the skeleton loading screen instead of the actual table contents. This affects all Table components across the application.

## Steps to Reproduce
1. Navigate to any List page (e.g., /characters, /campaigns, /fights, etc.)
2. Ensure you're in Table View initially (data should be visible)
3. Click the SpeedDial button (floating action button)
4. Select "Mobile View" from the speed dial options
5. Wait for the mobile view to load
6. Click the SpeedDial button again
7. Select "Table View" to switch back
8. Observe that only skeleton loading components are shown, not the actual table data

## Expected Behavior
When switching back to Table View, the table should display the actual data that was previously loaded, not remain in a skeleton loading state.

## Actual Behavior
The table shows only skeleton loading components indefinitely after switching back from Mobile View, even though the data was previously loaded and should be available.

## Related Files
All Table components that use the view switcher functionality:
- `src/components/characters/Table.tsx`
- `src/components/campaigns/Table.tsx`
- `src/components/fights/Table.tsx`
- `src/components/users/Table.tsx`
- `src/components/parties/Table.tsx`
- `src/components/factions/Table.tsx`
- `src/components/junctures/Table.tsx`
- `src/components/sites/Table.tsx`
- `src/components/vehicles/Table.tsx`
- `src/components/weapons/Table.tsx`
- `src/components/schticks/Table.tsx`
- `src/components/ui/BaseDataGrid.tsx` (if view switching logic is centralized)
- `src/components/ui/SpeedDial.tsx` or similar view switching component

## Screenshots/Evidence
- Screenshots needed to document the issue visually
- Should capture: initial table view, mobile view, and broken skeleton state after switching back

## Investigation Notes
This appears to be a state management issue where the view switching mechanism doesn't properly restore the table's data state when returning from Mobile View to Table View. The skeleton loading state suggests the component thinks it's still loading data even though the data should already be available in state.

Possible causes:
1. View switching triggers a re-render that resets loading state incorrectly
2. Data state is being cleared when switching views
3. The table component isn't properly checking if data is already available before showing loading state
4. Race condition between view switching and data loading state management

## Potential Solution
1. **Investigate view switching state management**: Check how the SpeedDial component manages view state and whether it's causing unnecessary re-renders or state resets
2. **Review data persistence**: Ensure that switching views doesn't clear or invalidate the loaded data
3. **Fix loading state logic**: Update table components to properly check if data is available before showing skeleton loading
4. **Add view switching tests**: Create E2E tests to prevent regression of this functionality

Potential approaches:
- Preserve data state during view transitions
- Implement proper loading state checks that consider existing data
- Use memoization or caching to avoid re-fetching data on view switches
- Review the BaseDataGrid component for centralized fixes if applicable

## Related Issues
This may be related to recent TypeScript types consolidation work if it affected state management types or component prop interfaces.