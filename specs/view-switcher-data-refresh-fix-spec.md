# View Switcher Data Refresh Bug Fix Specification

**Date**: 2025-08-21  
**Issue**: 2025-08-21-view-switcher-not-refreshing-list-data.md  
**Priority**: Medium  
**Category**: Frontend Bug Fix

## Problem Statement

The Characters List page view switcher (SpeedDial menu) fails to refresh filtered data when switching between "Table View" and "Mobile View". After applying filters and switching views, users see loading skeletons instead of the filtered character data.

## Root Cause Analysis Requirements

### 1. Code Investigation Phase
- **Investigate Characters List component architecture**
  - Examine `shot-client-next/src/components/characters/List.tsx`
  - Identify how view mode state is managed
  - Map data fetching hooks and their triggers
  - Document component lifecycle during view switches

- **Analyze View Switcher Implementation**
  - Locate SpeedDial/view switcher component
  - Understand how view mode changes are propagated
  - Check if view changes trigger data refetch
  - Identify state synchronization patterns

- **Examine Filter State Management**
  - Map how filters are stored and applied
  - Check if filters persist across view mode changes
  - Identify loading state management during transitions
  - Document data flow from filters to API calls

### 2. Bug Reproduction and Testing
- **Set up test environment** with Characters page
- **Reproduce bug systematically** following issue steps
- **Document exact failure points** and component states
- **Test edge cases** (multiple filters, different entity types, etc.)

## Technical Implementation Plan

### Phase 1: Component Architecture Analysis
**Atomic Tasks:**
1. Read and analyze `shot-client-next/src/components/characters/List.tsx`
2. Identify view mode state management approach (useState, context, etc.)
3. Map data fetching patterns (SWR, React Query, useEffect, custom hooks)
4. Document component hierarchy and props flow
5. Locate SpeedDial component and view switching logic

### Phase 2: State Flow Investigation  
**Atomic Tasks:**
1. Trace filter state storage and application
2. Identify loading state management patterns
3. Map data refetch triggers and dependencies
4. Check for race conditions or stale closures
5. Analyze component remounting vs re-rendering behavior

### Phase 3: Bug Fix Implementation
**Atomic Tasks:**
1. Ensure view mode changes trigger proper data refetch
2. Maintain filter state consistency across view switches
3. Fix loading state management during transitions
4. Implement proper cleanup for abandoned requests
5. Add error boundary handling for view switch failures

### Phase 4: Testing and Validation
**Atomic Tasks:**
1. Test basic view switching without filters
2. Test view switching with single filter applied
3. Test view switching with multiple filters
4. Test rapid view switching (race condition handling)
5. Test with different character types and pagination

## Expected Component Architecture Patterns

### Current Problematic Pattern (Hypothesis)
```tsx
// Problematic pattern - separate state management
const [viewMode, setViewMode] = useState('table')
const [filters, setFilters] = useState({})
const { data, loading } = useCharacters(filters) // May not react to viewMode

const switchView = (newMode) => {
  setViewMode(newMode) // Only changes UI, doesn't trigger refetch
}
```

### Target Fixed Pattern
```tsx
// Fixed pattern - coordinated state management
const [viewMode, setViewMode] = useState('table')
const [filters, setFilters] = useState({})
const [refreshKey, setRefreshKey] = useState(0)

const { data, loading } = useCharacters(filters, refreshKey)

const switchView = (newMode) => {
  setViewMode(newMode)
  setRefreshKey(prev => prev + 1) // Force refetch with current filters
}
```

## Success Criteria

### Functional Requirements
1. **Filter Persistence**: Filters remain active when switching between Table and Mobile views
2. **Data Refresh**: View switches trigger appropriate data refetch with current filter state
3. **Loading States**: Loading indicators work correctly during view transitions
4. **Performance**: No unnecessary API calls or excessive re-renders

### Technical Requirements
1. **State Consistency**: View mode and filter state remain synchronized
2. **Error Handling**: View switch failures don't break the component
3. **Memory Management**: No memory leaks from abandoned requests
4. **Race Condition Safety**: Rapid view switches don't cause data inconsistencies

### Testing Requirements
1. **Unit Tests**: Cover view switching logic and state management
2. **Integration Tests**: Test complete filter + view switch workflows
3. **E2E Tests**: Validate user-facing behavior matches expectations
4. **Performance Tests**: Ensure view switches don't cause performance degradation

## Implementation Phases

### Phase 1: Investigation (1-2 hours)
- Analyze current component architecture
- Identify root cause of the bug
- Document findings and create fix strategy

### Phase 2: Fix Implementation (2-3 hours)
- Implement state management improvements
- Add proper data refetch triggers
- Fix loading state handling

### Phase 3: Testing (1-2 hours)
- Write unit tests for fixed functionality
- Add integration tests for view switching
- Validate fix with manual testing

### Phase 4: Documentation and Cleanup (30 minutes)
- Update component documentation
- Add code comments explaining the fix
- Update issue status and create summary

## Potential Risks and Mitigations

### Risk 1: Breaking Other List Components
**Mitigation**: Identify shared patterns first, test other list pages after fix

### Risk 2: Performance Impact from Excessive Refetching
**Mitigation**: Implement intelligent refetch logic that only triggers when necessary

### Risk 3: Complex State Management Refactor Required
**Mitigation**: Start with minimal viable fix, plan larger refactor if needed

### Risk 4: Race Conditions in Data Fetching
**Mitigation**: Implement proper request cancellation and state cleanup

## Definition of Done

1. ✅ Bug reproduction confirmed and documented
2. ✅ Root cause identified and documented
3. ✅ Fix implemented with minimal code changes
4. ✅ All view switching scenarios work correctly
5. ✅ Filter state persists across view changes
6. ✅ Loading states work properly during transitions
7. ✅ Unit tests cover the fixed functionality
8. ✅ E2E test validates the complete user workflow
9. ✅ No performance regressions introduced
10. ✅ Other list components remain unaffected
11. ✅ Code is documented and reviewable
12. ✅ Issue marked as resolved with implementation summary