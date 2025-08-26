# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-26-visibility-filter-dropdown/spec.md

> Created: 2025-08-26
> Status: Implementation Complete - Ready for Testing

## Tasks

### Phase 1: Frontend Component Implementation ✅ COMPLETED

**1.1 Update EntityFilters Component**
- [x] Replace "Show Hidden" checkbox with visibility dropdown
- [x] Implement three-option dropdown: "Visible", "Hidden", "All"
- [x] Update component props and state management
- [x] Maintain existing styling and layout consistency

**1.2 Update Filter State Management**
- [x] Modify filter state to use string values instead of boolean
- [x] Update URL parameter handling for new visibility values
- [x] Ensure filter state persistence across page navigation
- [x] Update filter clearing logic to handle dropdown selection

**1.3 Test Frontend Integration**
- [x] Verify dropdown behavior with all entity list pages
- [x] Test filter combinations with existing filters (name, type, etc.)
- [x] Validate URL parameter synchronization
- [ ] Test responsive behavior on mobile devices

### Phase 2: Backend API Enhancement ✅ COMPLETED

**2.1 Update Controller Filter Logic**
- [x] Enhance `apply_visibility_filter` methods in all affected controllers
- [x] Support three-state parameter handling: default, 'true', 'all'
- [x] Maintain backward compatibility with existing parameter usage
- [x] Apply consistent filtering pattern across all entity controllers

**2.2 Affected Controllers to Update**
- [x] `Api::V2::CharactersController`
- [x] `Api::V2::CampaignsController`
- [x] `Api::V2::FightsController`
- [x] `Api::V2::SitesController`
- [x] `Api::V2::PartiesController`
- [x] `Api::V2::FactionsController`
- [x] `Api::V2::VehiclesController`
- [x] Additional controllers: `JuncturesController`, `SchtucksController`, `UsersController`, `WeaponsController`

**2.3 Test Backend Implementation**
- [ ] Write/update controller tests for new parameter handling
- [ ] Test backward compatibility with existing API usage
- [ ] Verify filtering works correctly with pagination
- [ ] Test parameter combination edge cases

### Phase 3: Integration and User Testing 🚧 IN PROGRESS

**3.1 End-to-End Testing**
- [ ] Test complete user workflow with new dropdown
- [ ] Verify filter behavior across different entity types
- [ ] Test URL bookmarking and sharing functionality
- [ ] Validate default behavior (showing visible entities only)

**3.2 Backward Compatibility Testing**
- [ ] Test existing API clients continue to work unchanged
- [ ] Verify legacy URLs with `show_hidden=true` still function
- [ ] Test mixed old/new client scenarios

**3.3 User Experience Validation**
- [ ] Confirm improved UX with clearer filtering options
- [ ] Validate intuitive default behavior (visible entities)
- [ ] Test dropdown accessibility and keyboard navigation

### Phase 4: Documentation and Deployment ⏸️ PENDING

**4.1 Update Documentation**
- [ ] Update API documentation with new parameter values
- [ ] Document frontend component usage patterns
- [ ] Update any relevant user documentation

**4.2 Deployment Preparation**
- [ ] Ensure frontend and backend changes are synchronized
- [ ] Prepare rollback plan if issues arise
- [ ] Monitor deployment for any filtering inconsistencies

**4.3 Post-Deployment Monitoring**
- [ ] Monitor API usage patterns with new parameter
- [ ] Track user adoption of different visibility options
- [ ] Address any reported filtering issues promptly

## Implementation Summary

### ✅ Completed Work

**Frontend Implementation (Commit: 13b725c)**
- Updated all entity View.tsx components with visibility dropdown
- Replaced checkbox with dropdown in EntityFilters component  
- Implemented three options: "Visible" (default), "Hidden", "All"
- Updated parameter mapping: visibility → 'visible'|'hidden'|'all'

**Backend Implementation (Commit: afaa566)**
- Created VisibilityFilterable concern for shared filtering logic
- Updated all V2 API controllers to use the concern
- Added support for new visibility parameter with backward compatibility
- Maintains existing show_hidden parameter support

### 🔄 Next Steps

1. **Create E2E test script** for visibility dropdown functionality
2. **Run comprehensive testing** across all entity types
3. **Validate backward compatibility** with existing API clients
4. **Merge feature branches** to main after testing completion
5. **Update API documentation** with new parameter specifications