# Entity List Filter Pattern - Lite Summary

Implement a reusable checkbox filter pattern for all entity list views to toggle visibility of hidden/inactive items, with URL state persistence and backend standardization to use "active" boolean field consistently. Start with Character list as proof of concept, then roll out to all entity types while maintaining AND logic for multiple filters.

## Key Points
- Create standardized checkbox filter component for toggling hidden/inactive items
- Implement URL state persistence for filter preferences across page refreshes
- Standardize backend to use consistent "active" boolean field across all entity types