# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-30-master-template-export-command/spec.md

## Technical Requirements

- **Rake Task Location**: Create task in `lib/tasks/template.rake` namespace
- **Export Directory**: Generate SQL files in `db/exports/` directory with timestamp naming
- **UUID Handling**: Use existing UUIDs from development database to maintain referential integrity
- **Association Loading**: Use Rails eager loading to efficiently traverse all associations
- **SQL Format**: Generate PostgreSQL-compatible INSERT statements with ON CONFLICT DO NOTHING clauses
- **Character Type Preservation**: Maintain character_type enum values (:pc, :npc, :boss, :uber_boss, :featured_foe, :mook, :ally)
- **Image URL Export**: Include image_url, image_blurhash, and imagekit_file_id fields where present
- **Join Table Order**: Export in dependency order - base tables first, then join tables
- **Transaction Wrapping**: Wrap all INSERT statements in a single transaction for atomicity
- **File Naming**: Use format `master_template_export_YYYYMMDD_HHMMSS.sql`

## Export Order Dependencies

1. **Base Tables** (no foreign keys to other exported tables):
   - campaigns (the master template)
   - schticks (archetype schticks)
   - weapons (archetype weapons)

2. **Entity Tables** (reference campaign):
   - factions
   - characters
   - vehicles
   - sites
   - parties

3. **Tables with foreign keys** (reference factions):
   - junctures (has faction_id)

4. **Join Tables** (reference multiple tables):
   - character_schticks (character_id, schtick_id)
   - carries (character_id, weapon_id)
   - memberships (character_id, faction_id)

## SQL Generation Pattern

```sql
-- Transaction wrapper
BEGIN;

-- Example for characters table
INSERT INTO characters (
  id, campaign_id, name, character_type, 
  archetype, juncture, image_url, image_blurhash,
  imagekit_file_id, created_at, updated_at
) VALUES (
  'existing-uuid-from-dev',
  'master-template-campaign-uuid',
  'Character Name',
  'npc',
  'Archetype Name',
  'contemporary',
  'https://imagekit.io/...',
  'blurhash-string',
  'imagekit-id',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

COMMIT;
```

## Error Handling

- Validate master template exists before export
- Check for required associations and warn if missing
- Create exports directory if it doesn't exist
- Log export progress to Rails logger
- Provide clear success/failure messages with file path