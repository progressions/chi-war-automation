# Spec Tasks

## Tasks

- [ ] 1. Database Schema Updates
  - [ ] 1.1 Write RSpec tests for active field migrations
  - [ ] 1.2 Create migration to add active field to all entity tables
  - [ ] 1.3 Create data migration to migrate existing hidden/secret fields
  - [ ] 1.4 Add database indexes for active column on all tables
  - [ ] 1.5 Verify all migration tests pass

- [ ] 2. Backend API Controller Updates - Phase 1 (Backward Compatible)
  - [ ] 2.1 Write controller tests for show_hidden parameter
  - [ ] 2.2 Update CharactersController to support both show_all and show_hidden
  - [ ] 2.3 Update FightsController to support both show_all and show_hidden
  - [ ] 2.4 Update CampaignsController to support both show_all and show_hidden
  - [ ] 2.5 Update cache keys to include show_hidden parameter
  - [ ] 2.6 Verify backward compatibility with existing API clients
  - [ ] 2.7 Verify all controller tests pass

- [ ] 3. Backend API Controller Updates - Phase 2 (New Controllers)
  - [ ] 3.1 Write controller tests for entities without current filtering
  - [ ] 3.2 Add show_hidden filtering to VehiclesController
  - [ ] 3.3 Add show_hidden filtering to WeaponsController
  - [ ] 3.4 Add show_hidden filtering to SitesController
  - [ ] 3.5 Add show_hidden filtering to FactionsController
  - [ ] 3.6 Add show_hidden filtering to PartiesController
  - [ ] 3.7 Add show_hidden filtering to SchticksController
  - [ ] 3.8 Verify all controller tests pass

- [ ] 4. Frontend Filter Component Development
  - [ ] 4.1 Write Jest tests for EntityFilters component
  - [ ] 4.2 Create EntityFilters component with checkbox UI
  - [ ] 4.3 Create useEntityFilters hook for state management
  - [ ] 4.4 Implement URL query parameter synchronization
  - [ ] 4.5 Add collapsible panel functionality
  - [ ] 4.6 Add "Clear Filters" button
  - [ ] 4.7 Verify component tests pass

- [ ] 5. Frontend Integration - Characters
  - [ ] 5.1 Write Playwright tests for character filtering
  - [ ] 5.2 Integrate EntityFilters into CharactersList component
  - [ ] 5.3 Update API calls to include show_hidden parameter
  - [ ] 5.4 Update URL routing to persist filter state
  - [ ] 5.5 Test filtering with various character states
  - [ ] 5.6 Verify Playwright tests pass

- [ ] 6. Frontend Integration - Other Entities
  - [ ] 6.1 Write Playwright tests for all entity types
  - [ ] 6.2 Integrate filters into FightsList component
  - [ ] 6.3 Integrate filters into CampaignsList component
  - [ ] 6.4 Integrate filters into VehiclesList component
  - [ ] 6.5 Integrate filters into remaining list components
  - [ ] 6.6 Verify all Playwright tests pass

- [ ] 7. Migration Cleanup and Documentation
  - [ ] 7.1 Remove deprecated show_all parameter support
  - [ ] 7.2 Remove old hidden/secret columns from database
  - [ ] 7.3 Update API documentation
  - [ ] 7.4 Create migration guide for API consumers
  - [ ] 7.5 Update frontend component documentation

- [ ] 8. Final Testing and Validation
  - [ ] 8.1 Run full backend test suite
  - [ ] 8.2 Run full frontend test suite
  - [ ] 8.3 Run complete E2E test suite
  - [ ] 8.4 Test performance with large datasets
  - [ ] 8.5 Verify cache invalidation works correctly
  - [ ] 8.6 User acceptance testing