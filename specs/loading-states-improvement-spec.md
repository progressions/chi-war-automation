# Loading States Improvement Specification

**Date**: 2025-08-21  
**Issue Reference**: 2025-08-20-improve-loading-states-across-entities.md  
**Priority**: Medium  
**Category**: UI/UX Enhancement  

## Overview

This specification outlines the implementation plan for improving loading states across all entity pages in the Chi War application. The current system shows poor loading feedback with empty content areas, creating a jarring user experience. This will be replaced with professional skeleton loading states that preserve page structure and provide clear visual feedback.

## Current State Analysis

**Problems:**
- Empty content area during initial load (only menu bar and footer visible)
- Basic `CircularProgress` components provide minimal feedback
- Abrupt transition from empty to fully loaded content
- Inconsistent loading patterns across different pages
- Users may think pages are broken or stuck

**Affected Pages:**
- All entity list pages: campaigns, characters, fights, vehicles, schticks, weapons, sites, parties, factions, junctures, users
- All entity detail pages with `[id]/page.tsx` structure
- Form components during data operations

## Implementation Strategy

### Phase 1: Core Skeleton Infrastructure

#### 1.1 Create Base Skeleton Components

**File**: `src/components/ui/skeletons/BaseSkeleton.tsx`
```typescript
// Reusable skeleton primitives
export const SkeletonCard: React.FC<{ height?: string; className?: string }>
export const SkeletonText: React.FC<{ width?: string; height?: string }>  
export const SkeletonAvatar: React.FC<{ size?: number }>
export const SkeletonButton: React.FC<{ width?: string; height?: string }>
```

#### 1.2 Create List Page Skeleton

**File**: `src/components/ui/skeletons/ListPageSkeleton.tsx`
```typescript
interface ListPageSkeletonProps {
  entityType: string;
  showSearch?: boolean;
  showFilters?: boolean;
  itemCount?: number;
  viewMode?: 'table' | 'cards';
}

export const ListPageSkeleton: React.FC<ListPageSkeletonProps>
```

**Features:**
- Header breadcrumb skeleton
- Search bar skeleton (conditional)
- Filter controls skeleton (conditional)
- Table/card layout skeletons (configurable count)
- Pagination skeleton
- Action buttons skeleton

#### 1.3 Create Detail Page Skeleton

**File**: `src/components/ui/skeletons/DetailPageSkeleton.tsx`
```typescript
interface DetailPageSkeletonProps {
  entityType: string;
  hasAvatar?: boolean;
  fieldCount?: number;
  hasActions?: boolean;
}

export const DetailPageSkeleton: React.FC<DetailPageSkeletonProps>
```

**Features:**
- Header with breadcrumb skeleton
- Entity title skeleton
- Avatar skeleton (conditional)
- Form field skeletons (configurable count)
- Action button skeletons
- Related entity sections skeleton

### Phase 2: Entity-Specific Skeletons

#### 2.1 High-Priority Entity Skeletons

**File**: `src/components/ui/skeletons/entity/CampaignSkeleton.tsx`
- Campaign name, description, member count
- Recent activity skeleton
- Quick action buttons

**File**: `src/components/ui/skeletons/entity/CharacterSkeleton.tsx`  
- Avatar, name, archetype
- Key stats (Body, Chi, Mind, Reflexes)
- Weapon and schtick previews

**File**: `src/components/ui/skeletons/entity/FightSkeleton.tsx`
- Fight name, status badge
- Participant count and avatars
- Initiative order preview

#### 2.2 Generic Entity Skeletons

**File**: `src/components/ui/skeletons/entity/GenericEntitySkeleton.tsx`
- Fallback for entities without specific skeletons
- Configurable field layouts
- Standard action patterns

### Phase 3: ResourcePage Integration

#### 3.1 Enhanced ResourcePage Component

**File**: `src/components/ResourcePage.tsx`

**Current:**
```typescript
<Suspense fallback={<CircularProgress />}>
```

**Enhanced:**
```typescript
<Suspense fallback={
  <ListPageSkeleton 
    entityType={resourceName}
    showSearch={hasSearch}
    showFilters={hasFilters}
    viewMode={initialViewMode}
    itemCount={skeletonCount}
  />
}>
```

#### 3.2 Dynamic Loading States

Add loading states for dynamic operations:
- Search/filter operations
- Pagination navigation
- Data refresh actions
- Real-time updates

### Phase 4: Individual Component Integration

#### 4.1 List Components

Update all List components in `src/components/[entity]/List.tsx`:
- Show skeletons during data fetching
- Smooth transitions from skeleton to content
- Maintain skeleton structure consistency

#### 4.2 Detail Components

Update detail page components:
- Form loading states during save operations
- Action button loading states
- Inline edit loading feedback

#### 4.3 Table Components

Enhanced table loading states:
- Table header always visible
- Skeleton rows matching table structure
- Pagination controls with loading states

### Phase 5: Advanced Features

#### 5.1 Progressive Loading

- Stagger skeleton animations for natural feel
- Progressive content revelation
- Optimistic UI updates

#### 5.2 Error State Integration

- Graceful fallback from loading to error states
- Retry functionality with loading feedback
- Error recovery patterns

#### 5.3 Accessibility Enhancements

- ARIA live regions for loading announcements
- Screen reader friendly loading descriptions
- Keyboard navigation during loading states

## Implementation Priority

### High Priority (Immediate)
1. **Campaigns** (`/campaigns`) - Navigation hub, most frequently accessed
2. **Characters** (`/characters`) - Core gameplay entities
3. **Fights** (`/fights`) - Active game sessions

### Medium Priority (Next Sprint)
4. **Vehicles** (`/vehicles`) - Chase scenes
5. **Weapons** (`/weapons`) - Character equipment  
6. **Schticks** (`/schticks`) - Character abilities

### Lower Priority (Future)
7. **Sites, Parties, Factions** - World building entities
8. **Junctures, Users** - Administrative entities

## Technical Requirements

### Dependencies
- Material-UI `Skeleton` components (already available)
- React `Suspense` and loading states
- Next.js App Router compatibility

### Performance Considerations
- Skeleton components must render quickly (< 100ms)
- No performance degradation from skeleton rendering
- Efficient cleanup and memory management

### Browser Support
- Modern browsers with ES6+ support
- Mobile responsive skeleton layouts
- Consistent behavior across device sizes

## Testing Strategy

### Visual Testing
- Screenshot comparison tests for all skeletons
- Visual regression testing for loading state transitions
- Cross-browser skeleton rendering verification

### Functional Testing
- Loading state duration and timing tests
- Skeleton-to-content transition smoothness
- Error state handling during loading

### Accessibility Testing
- Screen reader compatibility for loading states
- Keyboard navigation during loading
- ARIA label and live region functionality

### Performance Testing
- Skeleton rendering performance benchmarks
- Memory usage during extended loading states
- Network request handling during skeleton display

## Success Criteria

### User Experience
- [ ] No more empty content areas during loading
- [ ] Professional loading experience across all entity pages
- [ ] Consistent loading patterns throughout application
- [ ] Smooth transitions from loading to loaded states
- [ ] Perceived performance improvement (faster feeling pages)

### Technical
- [ ] Skeleton components match loaded content structure
- [ ] Reusable skeleton components reduce code duplication
- [ ] Loading states work across all supported devices
- [ ] No performance degradation from skeleton implementation
- [ ] Full accessibility compliance for loading states

### Coverage
- [ ] All 11 entity list pages have skeleton loading
- [ ] All entity detail pages have appropriate loading states  
- [ ] Search, filter, and pagination operations show loading feedback
- [ ] Form operations and data mutations have loading states
- [ ] Error recovery includes proper loading state management

## Implementation Notes

### Code Organization
```
src/components/ui/skeletons/
├── BaseSkeleton.tsx           # Primitive skeleton components
├── ListPageSkeleton.tsx       # Generic list page skeleton
├── DetailPageSkeleton.tsx     # Generic detail page skeleton
├── entity/                    # Entity-specific skeletons
│   ├── CampaignSkeleton.tsx
│   ├── CharacterSkeleton.tsx
│   ├── FightSkeleton.tsx
│   └── GenericEntitySkeleton.tsx
└── index.ts                   # Barrel exports
```

### Design Consistency
- Follow Material-UI skeleton patterns
- Match existing card and table layouts
- Consistent animation timing and easing
- Preserve responsive breakpoints

### Development Workflow
1. Create skeleton component
2. Integrate with ResourcePage or individual component
3. Test skeleton structure matches loaded content
4. Verify responsive behavior
5. Add accessibility features
6. Create visual tests
7. Update documentation

This specification provides a comprehensive roadmap for implementing professional loading states throughout the Chi War application, significantly improving user experience and perceived performance.