# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-entity-list-filter-pattern/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Technical Requirements

### Frontend Requirements

- **Reusable Filter Component** (`components/common/EntityFilters.tsx`)
  - Generic component accepting filter configuration props
  - Checkbox rendering with Material-UI components
  - Collapsible panel using MUI Accordion
  - URL state synchronization using Next.js router
  - TypeScript interfaces for filter definitions

- **Filter Hook** (`hooks/useEntityFilters.ts`)
  - Custom hook managing filter state
  - URL query parameter parsing and updating
  - Debounced URL updates to prevent history spam
  - Filter application logic (AND operation)
  - Clear filters functionality

- **List Component Integration**
  - Modify existing List components to incorporate EntityFilters
  - Pass filter configuration to define available filters
  - Apply filters to data fetching hooks
  - Update API calls with filter parameters

### Backend Requirements

- **Database Migration**
  - Add `active` boolean field to all entity tables (default: true)
  - Migrate existing `hidden` fields: `hidden = true` → `active = false`
  - Migrate existing `secret` fields: `secret = true` → `active = false`
  - Remove deprecated hidden/secret columns after migration

- **API Parameter Handling**
  - Update all V2 index controllers to accept `show_hidden` parameter
  - Modify query scopes to filter by active status
  - Default behavior: return only `active: true` records
  - When `show_hidden=true`: return all records
  - Maintain backward compatibility during transition

- **Model Scopes**
  - Add `active` and `inactive` scopes to all models
  - Create `visible` scope that respects show_hidden parameter
  - Ensure scopes work with existing query chains

### Component Architecture

```typescript
interface FilterConfig {
  id: string
  label: string
  field: string
  type: 'boolean' | 'select' | 'multiselect'
  defaultValue?: any
}

interface EntityFiltersProps {
  filters: FilterConfig[]
  onFilterChange: (filters: FilterState) => void
  urlKey?: string // for URL persistence
}
```

### URL State Pattern

- Query parameters format: `?show_hidden=true&other_filter=value`
- Use shallow routing to update URL without page reload
- Parse URL on component mount to restore filter state
- Support multiple simultaneous filters with AND logic

## Performance Considerations

- Debounce URL updates (300ms) to prevent excessive history entries
- Use React.memo for filter components to prevent unnecessary re-renders
- Lazy load filter panel content when expanded
- Index database columns used in filter queries