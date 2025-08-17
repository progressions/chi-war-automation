# Issue: Refactor Repeated Resource List Components into Generic Pattern

**Date**: 2025-08-17  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description
The frontend codebase contains 11+ resource List components (characters, factions, vehicles, parties, weapons, etc.) that follow nearly identical patterns with ~1,200 lines of duplicated code. Each List.tsx component has the same structure, state management, WebSocket subscriptions, and URL handling with only entity-specific details varying.

This pattern duplication creates significant technical debt, makes maintenance difficult, and increases the risk of inconsistent behavior across different resource types.

## Steps to Reproduce
1. Compare any two List components in shot-client-next/src/components/
2. Examine characters/List.tsx vs factions/List.tsx vs vehicles/List.tsx
3. Notice nearly identical code structure with only entity names and types different
4. Count the repeated patterns across all 11+ resource entities

## Expected Behavior
- Single generic resource list implementation that accepts configuration
- Consistent behavior across all resource types
- Minimal code duplication
- Easy addition of new resource types with just configuration objects

## Actual Behavior
- 11+ separate List.tsx files with 95% identical code
- Maintenance requires updating multiple files for any list behavior change
- Risk of inconsistent implementations across resources
- Significant technical debt and development overhead

## Related Files
**Current duplicated List components:**
- `shot-client-next/src/components/characters/List.tsx`
- `shot-client-next/src/components/factions/List.tsx` 
- `shot-client-next/src/components/vehicles/List.tsx`
- `shot-client-next/src/components/parties/List.tsx`
- `shot-client-next/src/components/weapons/List.tsx`
- `shot-client-next/src/components/sites/List.tsx`
- `shot-client-next/src/components/schticks/List.tsx`
- `shot-client-next/src/components/junctures/List.tsx`
- `shot-client-next/src/components/users/List.tsx`
- `shot-client-next/src/components/campaigns/List.tsx`
- Plus additional resource List components

**Files to create:**
- `shot-client-next/src/hooks/useResourceList.ts` - Generic list logic hook
- `shot-client-next/src/components/common/GenericResourceList.tsx` - Reusable component
- `shot-client-next/src/types/resourceConfig.ts` - Configuration type definitions

## Screenshots/Evidence
- Pattern analysis performed by pattern-analyzer agent
- Code comparison showing ~95% similarity between List components
- Estimated ~1,200 lines of duplicated code across all List components

## Investigation Notes
**Repeated patterns identified:**
- Same imports (useRouter, useEffect, useCallback, useState, Box)
- Identical view mode state management 
- Nearly identical fetch functions with only entity names different
- Same WebSocket subscription pattern using `subscribeToEntity`
- Identical URL updating with query params
- Same localStorage saving for view modes
- Nearly identical JSX structure with only title/icon differences

**Benefits of refactoring:**
- Eliminate ~1,200 lines of duplicated code
- Single source of truth for all list behavior
- Easier maintenance - bug fixes in one place
- Consistent behavior across all resource lists
- Faster development for new resource types
- Improved type safety with generics
- Reduced testing surface area

## Potential Solution

### Phase 1: Create Generic Infrastructure
1. **Create `useResourceList<T>` hook** that accepts entity configuration:
   ```typescript
   interface ResourceEntityConfig {
     entityName: string          // "characters"
     displayName: string         // "Characters" 
     clientMethod: string        // "getCharacters"
     subscriptionKey: string     // "characters"
     iconKeyword: string        // "Characters"
     viewModeStorageKey: string // "characterViewMode"
   }
   ```

2. **Create `GenericResourceList<T>` component** that uses the hook and renders based on configuration

### Phase 2: Migrate Existing Components
3. **Incrementally migrate** each resource List component to use the generic pattern
4. **Update entity configurations** for each resource type
5. **Remove old List.tsx files** after successful migration

### Phase 3: Validation
6. **Test all resource lists** to ensure identical behavior
7. **Verify WebSocket subscriptions** work correctly
8. **Validate URL handling and view modes** function as expected

**Estimated Effort:** 2-3 days  
**Risk Level:** Low (can migrate incrementally)  
**Breaking Changes:** None (internal refactor)

## Related Issues
- General technical debt reduction initiative
- Frontend code consistency improvements
- Development velocity enhancement through reduced duplication