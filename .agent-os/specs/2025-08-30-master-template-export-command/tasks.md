# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-30-master-template-export-command/spec.md

> Created: 2025-08-30
> Status: Ready for Implementation

## Tasks

- [x] 1. Create Rake Task Infrastructure
  - [x] 1.1 Write tests for template:export rake task
  - [x] 1.2 Create lib/tasks/template.rake file with basic task structure
  - [x] 1.3 Add db/exports directory creation logic
  - [x] 1.4 Implement file naming with timestamp format
  - [x] 1.5 Verify rake task is accessible via rails template:export

- [x] 2. Implement Master Template Detection and Validation
  - [x] 2.1 Write tests for finding campaign with is_master_template: true
  - [x] 2.2 Add validation to ensure master template exists
  - [x] 2.3 Implement error handling for missing master template
  - [x] 2.4 Add logging for export progress
  - [x] 2.5 Verify all tests pass

- [x] 3. Export Core Entities and Associations
  - [x] 3.1 Write tests for exporting campaign and base entities
  - [x] 3.2 Implement campaign export with UUID preservation
  - [x] 3.3 Export characters, vehicles with image URLs (factions don't have image_url column)
  - [x] 3.4 Export sites, parties, junctures (with faction_id)
  - [x] 3.5 Export schticks and weapons
  - [x] 3.6 Verify all entity exports maintain referential integrity

- [x] 4. Export Join Tables and Relationships
  - [x] 4.1 Write tests for join table exports
  - [x] 4.2 Export character_schticks associations
  - [x] 4.3 Export carries (character-weapon) associations
  - [x] 4.4 Export image_positions for all entities (NEW: added per user request)
  - [x] 4.5 Verify all foreign key relationships are preserved

- [x] 5. Generate SQL File with Conflict Resolution
  - [x] 5.1 Write tests for SQL generation with ON CONFLICT clauses
  - [x] 5.2 Implement INSERT statement generation with explicit UUIDs
  - [x] 5.3 Add transaction wrapping (BEGIN/COMMIT)
  - [x] 5.4 Implement ON CONFLICT DO NOTHING for idempotent imports
  - [x] 5.5 Test multiple import runs don't create duplicates
  - [x] 5.6 Verify generated SQL file can be imported successfully