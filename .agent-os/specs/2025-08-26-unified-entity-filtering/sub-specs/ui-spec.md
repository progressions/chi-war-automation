# UI Specification

This is the UI specification for the spec detailed in @.agent-os/specs/2025-08-26-unified-entity-filtering/spec.md

## Visual Design

### Accordion Collapsed State
```
┌─────────────────────────────────────────┐
│ ▶ Filters (3 active)  [PC] [Dragon] [x] │
└─────────────────────────────────────────┘
```
- Expand arrow icon on left
- "Filters" label with active count badge
- Active filter chips showing selected values
- Clear all button on right

### Accordion Expanded State
```
┌─────────────────────────────────────────┐
│ ▼ Filters (3 active)           Clear All│
├─────────────────────────────────────────┤
│ 🔍 Search: [_______________]            │
│                                         │
│ Type:      [PC ▼]                      │
│ Archetype: [Dragon ▼]                  │
│ Faction:   [Select... ▼]               │
│ Visibility: [Visible ▼]                │
│                                         │
│ [Additional filter dropdowns...]        │
└─────────────────────────────────────────┘
```

## Interaction Patterns

### Filter Application
1. User clicks accordion to expand
2. Selects/modifies filters
3. Filters apply immediately (or with debounce)
4. URL updates with query parameters
5. Data refreshes based on filters

### Active Filter Management
- Clicking chip in collapsed view expands accordion and highlights that filter
- Clicking 'x' on chip removes that specific filter
- "Clear All" button resets all filters

## Responsive Behavior

### Desktop (>960px)
- Full-width accordion with filters in 2-3 column grid
- All filter options visible when expanded

### Tablet (600-960px)  
- Full-width accordion with filters in 2 column grid
- Maintains all functionality

### Mobile (<600px)
- Full-width accordion with single column filter layout
- Optimized for touch interaction with larger tap targets
- Used primarily in Grid view components