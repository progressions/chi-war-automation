# TypeScript Types Consolidation Specification

**Date**: 2025-01-22  
**Priority**: High  
**Category**: Frontend Development  

## Overview
This specification outlines the comprehensive consolidation and reorganization of TypeScript types in the shot-client-next frontend to eliminate duplication, improve maintainability, and establish clear organizational patterns.

## Current State Analysis

### Problems Identified
1. **FormStateData Interface Duplication**: Identical interfaces defined in 12+ Table components
2. **Scattered Component Props**: 50+ component prop types defined inline instead of centralized
3. **Misplaced Types**: Types defined in `src/reducers/` and `src/lib/` instead of `src/types/`
4. **Inconsistent Naming**: Mix of `*Properties` and `*Props` conventions
5. **Oversized Type Files**: `src/types/types.ts` is 378 lines and contains mixed concerns

### Files Requiring Changes

#### Components with FormStateData duplication (12 files):
- `src/components/weapons/Table.tsx:8-15`
- `src/components/schticks/Table.tsx:8-15`
- `src/components/sites/Table.tsx:13-20`
- `src/components/junctures/Table.tsx:8-15`
- `src/components/vehicles/Table.tsx:9-16`
- `src/components/factions/Table.tsx:8-15`
- `src/components/parties/Table.tsx:13-20`
- `src/components/campaigns/Table.tsx:12-19`
- `src/components/characters/Table.tsx:15-22`
- `src/components/fights/Table.tsx:8-15`
- `src/components/users/Table.tsx:8-15`

#### Files with misplaced types (4 files):
- `src/reducers/formState.ts:78-101` → move to `src/types/state.ts`
- `src/reducers/userState.ts:11-28` → move to `src/types/state.ts`
- `src/lib/filterConfigs.ts:1-14` → move to `src/types/utilities.ts`
- `src/lib/paginateArray.ts:3-7` → move to `src/types/utilities.ts`

## Target State Architecture

### New Type File Organization
```
src/types/
├── index.ts           # Central exports
├── forms.ts           # Form and table state types
├── props.ts           # Component prop types
├── state.ts           # Reducer and context state types  
├── utilities.ts       # Utility types
├── api.ts             # API-related types (split from types.ts)
├── ui.ts              # UI-specific types (split from types.ts)
├── character.ts       # (existing, well-organized)
├── resources.ts       # (existing, core entities)
├── responses.ts       # (existing, API responses)
├── defaults.ts        # (existing, default values)
└── encounters.ts      # (existing, small and focused)
```

### Naming Conventions
- **Component Props**: Use `*Props` suffix consistently (no `*Properties`)
- **State Types**: Use descriptive names like `FormState`, `UserState`
- **Generic Types**: Use clear generic parameters like `TableFormState<T>`

## Implementation Plan

### Phase 1: Create New Type Files
**Goal**: Establish new type file structure
**Files Created**: 4 new files
**Frontend Tests**: Run after creating each file

1. Create `src/types/forms.ts` with consolidated form types
2. Create `src/types/props.ts` for component prop types
3. Create `src/types/state.ts` for reducer/context types
4. Create `src/types/utilities.ts` for utility types

### Phase 2: Consolidate FormStateData
**Goal**: Eliminate 12 duplicate FormStateData interfaces
**Files Modified**: 12 Table components + 1 new type file
**Frontend Tests**: Run after each Table component update

1. Define generic `TableFormState<T>` in `src/types/forms.ts`
2. Update each Table component to import the centralized type
3. Remove duplicate interface definitions from each component
4. Verify functionality with frontend tests

### Phase 3: Relocate Misplaced Types
**Goal**: Move types to appropriate locations
**Files Modified**: 4 existing files + 2 new type files
**Frontend Tests**: Run after each relocation

1. Move reducer types from `src/reducers/` to `src/types/state.ts`
2. Move utility types from `src/lib/` to `src/types/utilities.ts`
3. Update all import statements in affected files
4. Test functionality to ensure no breaking changes

### Phase 4: Standardize Component Props
**Goal**: Centralize component prop types and standardize naming
**Files Modified**: 50+ component files + 1 new type file
**Frontend Tests**: Run after each batch of updates

1. Identify all inline component prop types
2. Extract to `src/types/props.ts` with standardized names
3. Convert all `*Properties` to `*Props` naming
4. Update import statements across components

### Phase 5: Split Oversized Type Files
**Goal**: Break down large files into focused modules
**Files Modified**: `src/types/types.ts` + 2 new files + `src/types/index.ts`
**Frontend Tests**: Run comprehensive test suite

1. Analyze `src/types/types.ts` (378 lines) content
2. Split into `src/types/api.ts` and `src/types/ui.ts`
3. Maintain backward compatibility through re-exports
4. Update `src/types/index.ts` to export from new modules

### Phase 6: Update Central Exports
**Goal**: Ensure clean import paths throughout codebase
**Files Modified**: `src/types/index.ts`
**Frontend Tests**: Final comprehensive test suite

1. Update `src/types/index.ts` to export all new types
2. Verify all imports work correctly
3. Run complete frontend test suite
4. Verify no TypeScript compilation errors

## Testing Strategy

### After Each Phase
1. **Immediate Testing**: Run frontend tests to catch any immediate issues
2. **TypeScript Compilation**: Ensure no TypeScript errors
3. **Build Verification**: Verify project builds successfully

### Test Commands
```bash
cd shot-client-next
npm run dev              # Start development server
npm run build            # Verify production build
npm run lint             # Check for linting issues
npm run fl               # Format and lint together
```

### Critical Test Areas
- **Table Components**: Verify all 12 Table components still function correctly
- **Form States**: Test form functionality across all entity types
- **Component Rendering**: Ensure no prop type mismatches
- **Import Resolution**: Verify all type imports resolve correctly

## Success Criteria

### Completion Checklist
- [ ] No duplicate `FormStateData` interfaces in Table components
- [ ] All component prop types centralized in `src/types/props.ts`
- [ ] No types defined outside `src/types/` directory
- [ ] Consistent `*Props` naming convention throughout
- [ ] No type files larger than 200 lines
- [ ] All tests passing
- [ ] No TypeScript compilation errors
- [ ] Clean development server startup
- [ ] Successful production build

### Quality Metrics
- **Duplication Elimination**: 0 duplicate type definitions
- **Centralization**: 100% of types in `src/types/` directory
- **Consistency**: 100% use of `*Props` naming convention
- **Maintainability**: No type files exceeding 200 lines
- **Test Coverage**: All frontend tests passing

## Risk Mitigation

### Potential Issues
1. **Breaking Changes**: Type refactoring could break existing functionality
2. **Import Errors**: Moving types may create circular dependencies
3. **Test Failures**: Component updates might break existing tests

### Mitigation Strategies
1. **Incremental Testing**: Run tests after each phase
2. **Backward Compatibility**: Maintain re-exports during transition
3. **Rollback Plan**: Keep branch history for easy rollback if needed

## Timeline
**Estimated Duration**: 4-6 hours  
**Recommended Approach**: Complete all phases in one session to avoid conflicts

This specification provides a clear roadmap for consolidating TypeScript types while maintaining functionality and improving code organization.