# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-unified-entity-filtering/spec.md

## Technical Requirements

### Component Architecture
- **GenericFilter Migration**: Move GenericFilter component from View.tsx into the accordion component structure
- **Component Hierarchy**: Maintain parent-child relationship between View component and filter controls
- **Props Passing**: Preserve all existing props and callbacks between View and filter components
- **State Management**: Keep filter state management in View.tsx as currently implemented

### UI/UX Specifications
- **Accordion Header**: Display filter count badge (e.g., "3 filters active") when collapsed
- **Active Filter Chips**: Show Material-UI Chip components for each active filter in collapsed state
- **Accordion Content**: Organize filter controls in logical groups within expanded accordion
- **Search Field**: Position search input prominently at top of accordion content
- **Responsive Layout**: Use Material-UI Grid system for responsive filter control layout

### Integration Requirements
- **URL Synchronization**: Maintain existing query parameter updates on filter changes
- **React Router Integration**: Preserve useSearchParams hook usage for URL state
- **Entity Consistency**: Apply changes to all entity View components:
  - characters/View.tsx
  - fights/View.tsx
  - vehicles/View.tsx
  - weapons/View.tsx
  - sites/View.tsx
  - parties/View.tsx
  - factions/View.tsx
  - schticks/View.tsx
  - campaigns/View.tsx
  - users/View.tsx
  - junctures/View.tsx

### Performance Criteria
- **No Additional Re-renders**: Maintain current render optimization patterns
- **Accordion State**: Store accordion open/close state locally without causing data refetch
- **Filter Application**: Keep existing debounced filter application timing
- **Initial Load**: No increase in initial page load time

## Material-UI Components Required

- **Accordion** / **AccordionSummary** / **AccordionDetails**: Core accordion structure
- **Chip**: Display active filters in collapsed state
- **Badge**: Show filter count indicator
- **ExpandMoreIcon**: Accordion expand/collapse indicator
- **Grid**: Responsive layout within accordion
- **Typography**: Consistent text styling

Note: All required Material-UI components are already available in the project; no new dependencies needed.