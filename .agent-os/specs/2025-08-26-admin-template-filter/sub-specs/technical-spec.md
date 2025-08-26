# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-admin-template-filter/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Technical Requirements

### Frontend Implementation

- **Component Updates**: Modify `EntityFilters.tsx` to conditionally render a new template filter dropdown for admin users
- **Filter Type**: Add new filter type "dropdown" to support select-based filtering alongside existing checkbox filters
- **Hook Enhancement**: Update `useEntityFilters` hook to handle dropdown filter values and URL synchronization
- **User Context**: Access user admin status from AuthContext to conditionally show filter
- **URL Parameters**: Add `template_filter` parameter with values: "all", "templates", "non-templates"
- **Default Behavior**: Non-admin users always have implicit `template_filter=non-templates` applied

### Backend Implementation

- **Controller Update**: Modify `characters_controller.rb` to parse and apply `template_filter` parameter
- **Query Logic**: 
  - `template_filter=all`: No template filtering
  - `template_filter=templates`: `where(is_template: true)`
  - `template_filter=non-templates`: `where(is_template: [false, nil])`
- **Security Layer**: Enforce template hiding for non-admin users regardless of parameter presence
- **Parameter Validation**: Reject invalid template_filter values and default to "non-templates"

### UI/UX Specifications

- **Dropdown Options**: 
  - "All Characters" (value: "all")
  - "Templates Only" (value: "templates")
  - "Non-Templates Only" (value: "non-templates")
- **Default Selection**: "Non-Templates Only" for consistency
- **Material-UI Components**: Use MUI Select component matching existing filter styling
- **Accordion Integration**: Place within existing EntityFilters accordion as new filter section

### Performance Criteria

- **Query Optimization**: Ensure is_template column is indexed for efficient filtering
- **State Management**: Minimize re-renders when filter changes
- **URL Updates**: Debounce URL parameter updates to prevent excessive history entries
- **Cache Invalidation**: Clear character list cache when template filter changes

## Approach

The implementation will extend the existing filter system rather than creating a new mechanism. This ensures consistency with the current filtering patterns and maintains compatibility with existing URL parameter handling.

## External Dependencies

- Material-UI Select component for dropdown rendering
- Existing AuthContext for admin user detection
- Current EntityFilters component structure and styling
- Backend is_template column and indexing