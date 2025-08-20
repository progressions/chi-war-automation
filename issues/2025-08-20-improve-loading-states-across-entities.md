# Issue: Improve Loading States Across All Entity Pages

**Date**: 2025-08-20  
**Priority**: Medium  
**Category**: UI/UX  
**Status**: Open

## Description

The entity pages (Campaigns, Characters, Fights, Vehicles, etc.) show poor loading states when first loading. Users see only the menu bar and footer with empty content between them, creating a jarring experience where the page appears broken or stuck. This affects user experience across all major entity pages in the application.

The current loading implementation uses basic `CircularProgress` components in `Suspense` fallbacks, but these are insufficient for providing proper feedback during the data fetching process. Users need better visual indicators that content is loading and the page is functioning correctly.

## Steps to Reproduce

1. Navigate to any entity list page (e.g., `/campaigns`, `/characters`, `/fights`)
2. Observe the initial load state - menu bar and footer are visible
3. Notice the empty content area between header and footer
4. Loading spinner may be present but doesn't provide adequate visual structure
5. Page eventually loads with full content but the transition is abrupt

## Expected Behavior

Entity pages should provide rich loading states that:

1. **Skeleton Loading**: Show content structure while data loads
   - Skeleton cards/rows that match the expected layout
   - Preserve page structure and dimensions during loading
   - Smooth transition from skeleton to actual content

2. **Progressive Loading Indicators**: 
   - Header/breadcrumbs load first
   - Content area shows structured loading placeholders
   - Search/filter controls load with skeleton states

3. **Consistent UX**: All entity pages use the same loading pattern
   - Campaigns, Characters, Fights, Vehicles, Schticks, Weapons
   - Sites, Parties, Factions, Junctures, Users
   - Both list views and detail views

4. **Performance Perception**: Users perceive faster loading with proper visual feedback

## Actual Behavior

Currently:
- ❌ Empty content area during initial load
- ❌ Basic circular progress spinners provide minimal feedback  
- ❌ Abrupt transition from empty to fully loaded content
- ❌ Inconsistent loading patterns across different pages
- ❌ No visual structure preservation during loading states
- ❌ Users may think the page is broken or stuck

## Related Files

**Core Loading Infrastructure:**
- `shot-client-next/src/components/ResourcePage.tsx` - Generic resource page wrapper with basic Suspense fallbacks
- `shot-client-next/src/app/(main)/layout.tsx` - Main layout with header/footer structure

**Entity List Pages (all need improved loading):**
- `shot-client-next/src/app/(main)/campaigns/page.tsx` - Campaigns list
- `shot-client-next/src/app/(main)/characters/page.tsx` - Characters list  
- `shot-client-next/src/app/(main)/fights/page.tsx` - Fights list
- `shot-client-next/src/app/(main)/vehicles/page.tsx` - Vehicles list
- `shot-client-next/src/app/(main)/schticks/page.tsx` - Schticks list
- `shot-client-next/src/app/(main)/weapons/page.tsx` - Weapons list
- `shot-client-next/src/app/(main)/sites/page.tsx` - Sites list
- `shot-client-next/src/app/(main)/parties/page.tsx` - Parties list
- `shot-client-next/src/app/(main)/factions/page.tsx` - Factions list
- `shot-client-next/src/app/(main)/junctures/page.tsx` - Junctures list
- `shot-client-next/src/app/(main)/users/page.tsx` - Users list

**Entity Detail Pages:**
- All `[id]/page.tsx` files for entity detail views
- Individual entity components that may need loading states

**Component Infrastructure:**
- Entity List components in `src/components/[entity]/List.tsx` 
- Table components that may need skeleton states
- Form components that could benefit from loading indicators

## Investigation Notes

### Current Loading Architecture
The current system uses Next.js 15 App Router with Server Components:
- `ResourcePage.tsx` provides generic wrapper for entity pages
- Uses `Suspense` with `CircularProgress` fallbacks
- Server-side data fetching with `fetchData` functions
- Client-side hydration happens after server rendering

### Loading State Analysis
1. **Initial Page Load**: Server renders with no data, then hydrates with data
2. **Suspense Boundaries**: Currently only show basic circular progress
3. **Layout Preservation**: Header/footer render immediately, content area empty
4. **User Perception**: Empty state makes page appear broken

### Material-UI Loading Components Available
- `Skeleton` - Perfect for content structure preservation
- `LinearProgress` - Good for process indicators
- `CircularProgress` - Current fallback, but insufficient alone
- `Card` + `CardContent` with Skeleton - For card-based layouts

## Proposed Solution

### Phase 1: Create Skeleton Loading Components

Create reusable skeleton components:

```typescript
// src/components/ui/skeletons/ListPageSkeleton.tsx
// - Table/card skeleton structure
// - Search bar skeleton
// - Pagination skeleton

// src/components/ui/skeletons/DetailPageSkeleton.tsx  
// - Detail view skeleton structure
// - Form field skeletons
// - Action button skeletons

// src/components/ui/skeletons/EntitySpecificSkeletons.tsx
// - Campaign-specific skeleton (name, description, member count)
// - Character-specific skeleton (avatar, name, archetype, stats)
// - Fight-specific skeleton (name, participant count, status)
```

### Phase 2: Update ResourcePage Component

Enhance `ResourcePage.tsx` to use rich loading states:

```typescript
<Suspense fallback={<ListPageSkeleton entityType={resourceName} />}>
  <ListComponent 
    initialFormData={initialFormData}
    initialIsMobile={initialIsMobile}
  />
</Suspense>
```

### Phase 3: Entity-Specific Loading States

Update individual List components to show loading states during:
- Search/filter operations
- Pagination navigation  
- Data refresh actions
- Real-time updates

### Phase 4: Detail Page Loading

Enhance individual entity detail pages:
- Form loading states during data fetching
- Action button loading states during operations
- Real-time update loading indicators

### Phase 5: Progressive Enhancement

Add advanced loading features:
- Optimistic UI updates
- Stale-while-revalidate loading patterns
- Error state recovery with retry actions

## Benefits

**User Experience:**
- Professional loading experience across all pages
- Users understand content is loading, not broken
- Smooth transitions between loading and loaded states
- Consistent UX patterns throughout the application

**Performance Perception:**
- Pages feel faster with proper loading feedback
- Structure preservation maintains visual continuity
- Progressive loading reduces perceived wait time

**Development:**
- Reusable skeleton components reduce code duplication
- Consistent patterns easier to maintain
- Better error handling with structured loading states

## Success Criteria

- [ ] All entity list pages show skeleton loading instead of empty content
- [ ] Loading skeletons match the structure of loaded content
- [ ] Smooth transitions from skeleton to actual content
- [ ] Consistent loading patterns across all entity types
- [ ] Detail pages show appropriate loading states
- [ ] Search/filter operations show loading feedback
- [ ] Pagination changes show loading states
- [ ] Mobile responsive loading states
- [ ] No more "empty content" loading experience
- [ ] Improved perceived performance across all pages

## Testing Strategy

**Visual Regression Testing:**
- Screenshot comparison of loading states before/after
- Verify skeleton structure matches loaded content layout
- Test across different screen sizes and devices

**Performance Testing:**
- Measure perceived loading time improvement
- Test loading state duration and transitions
- Verify no performance degradation from skeleton rendering

**User Experience Testing:**
- A/B test user perception of loading speed
- Gather feedback on loading state clarity
- Test loading states under slow network conditions

**Accessibility Testing:**
- Ensure loading states work with screen readers
- Test keyboard navigation during loading states
- Verify ARIA labels and loading announcements

## Implementation Priority

**High Priority Entities (most commonly used):**
1. Campaigns - Core navigation hub
2. Characters - Primary game entities
3. Fights - Active gameplay sessions

**Medium Priority Entities:**
4. Vehicles - Chase scene management
5. Weapons - Character equipment
6. Schticks - Character abilities

**Lower Priority Entities:**
7. Sites, Parties, Factions - World building
8. Junctures, Users - Administrative

## Related Issues

This issue relates to overall UX improvement efforts and could impact:
- Page load performance optimization
- Real-time update user experience
- Mobile responsive design improvements
- Accessibility compliance across the application