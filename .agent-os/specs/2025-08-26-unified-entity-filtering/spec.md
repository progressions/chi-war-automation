# Spec Requirements Document

> Spec: Unified Entity Filtering
> Created: 2025-08-26

## Overview

Consolidate the dual filtering UI on entity index pages by moving the filter bar (GenericFilter) into the existing filter accordion, creating a single, unified filtering interface. This change will reduce UI clutter and provide a consistent filtering experience across all entity types while maintaining current URL-based filter persistence.

## User Stories

### Streamlined Filtering Experience

As a gamemaster, I want to access all filtering options in one location, so that I can quickly filter my entity lists without confusion between two separate filter interfaces.

Currently, users encounter both a filter accordion and a separate filter bar with dropdowns at the top of entity lists, which creates visual clutter and confusion about where to apply filters. By consolidating these into a single accordion interface, users will have a cleaner view of their data with all filtering controls organized in one expandable panel. The accordion will show active filter indicators when collapsed, ensuring users always know when filters are applied.

### Mobile-Optimized Filter Management

As a mobile user, I want to manage filters through a responsive accordion interface, so that I can effectively filter content on smaller screens without excessive scrolling.

Mobile users currently struggle with limited screen space when both filter interfaces are visible. The unified accordion approach will provide a tap-to-expand interface that preserves screen real estate while maintaining full filtering capabilities in the Grid view, which serves as the standard mobile layout.

## Spec Scope

1. **Filter Bar Migration** - Move GenericFilter component and all its controls from View.tsx into the filter accordion for each entity type
2. **Active Filter Indicators** - Display chips or badges showing selected filters when accordion is collapsed
3. **Search Integration** - Relocate search/text input from filter bar into the accordion structure
4. **Consistent Implementation** - Apply changes uniformly across all entity types (characters, fights, vehicles, weapons, etc.)
5. **Responsive Behavior** - Ensure proper responsive display in both Table and Grid views while maintaining current functionality

## Out of Scope

- Changes to filter logic or backend filtering implementation
- Modifications to URL parameter structure or behavior
- Addition of new filter types or options
- Local storage persistence (maintaining current URL-based approach)
- Changes to filter performance or caching mechanisms

## Expected Deliverable

1. Single accordion-based filtering interface functional across all entity index pages with filter bar components successfully integrated
2. Active filter indicators visible when accordion is collapsed, providing clear feedback about applied filters
3. All existing filter functionality preserved with identical URL parameter updates and no regression in current features