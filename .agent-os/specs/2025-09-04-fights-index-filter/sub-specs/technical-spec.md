# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-04-fights-index-filter/spec.md

## Technical Requirements

### Frontend Implementation

#### GenericFilter Component Enhancement
- Update `src/components/shared/GenericFilter.tsx` to accept optional `defaultValue` property in filter configuration
- Modify initialization logic to use `defaultValue` when no URL parameter is present
- Ensure URL parameters always override default values
- Maintain backwards compatibility for filters without defaultValue

#### Filter Configuration Update
- Update `src/config/filterConfigs.ts` for fights index
- Add `defaultValue: "Unstarted"` to the Status filter configuration
- Ensure the existing options remain unchanged: ["Started", "Unstarted", "Ended", "All"]

#### State Management
- Initialize filter state with defaultValue when component mounts
- Apply default only when URL search params don't include the filter key
- Preserve existing URL sync behavior when filter changes

### Implementation Details

#### GenericFilter.tsx Changes
```typescript
// Add to FilterConfig interface
interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: Array<{value: string, label: string}>;
  defaultValue?: string; // New property
}

// Update initialization logic
const getInitialValue = (config: FilterConfig, urlParams: URLSearchParams) => {
  const urlValue = urlParams.get(config.key);
  if (urlValue !== null) return urlValue;
  return config.defaultValue || '';
};
```

#### filterConfigs.ts Changes
```typescript
// Update fights filter configuration
export const fightsFilterConfig: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'Started', label: 'Started' },
      { value: 'Unstarted', label: 'Unstarted' },
      { value: 'Ended', label: 'Ended' },
      { value: 'All', label: 'All' }
    ],
    defaultValue: 'Unstarted' // Add default value
  },
  // ... other filters
];
```

### UI/UX Specifications
- No visual changes to the filter dropdown appearance
- Status filter shows "Unstarted" as selected value on initial page load
- Clear/Reset button should restore filters to default values, not empty
- Maintain existing Material-UI Select component styling

### Testing Requirements
- Verify fights index loads with Status="Unstarted" when accessed without URL params
- Confirm URL parameter `?status=All` overrides the default
- Test that changing filter updates URL and results correctly
- Ensure other filters without defaultValue continue to work as before
- Verify bookmarked URLs with filters still work correctly

### Performance Criteria
- No performance impact expected (frontend-only change)
- Filter initialization should remain instantaneous
- URL parameter parsing should not introduce delays