# Campaign Template Seeding - Atomic Implementation Plan

**Date**: 2025-08-23  
**Feature**: Campaign Template Seeding via Background Jobs  
**Related Issue**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`

## Overview

Break down campaign template seeding system into smallest possible atomic chunks for incremental implementation. Each chunk is independently testable and builds toward the complete solution.

## Atomic Implementation Chunks

### **Chunk 1: Add `is_master_template` Database Field**
- Create migration: `add_is_master_template_to_campaigns`
- Add boolean field with default false
- Test migration runs cleanly
- **Deliverable**: Database can identify master template campaigns

### **Chunk 2: Add `seeded_at` Database Field** 
- Create migration: `add_seeded_at_to_campaigns`
- Add datetime field for tracking seeding completion
- Test migration runs cleanly
- **Deliverable**: Database can track when campaigns were seeded

### **Chunk 3: Create Empty Master Template Campaign**
- Modify `db/seeds.rb` to create one master template campaign
- Set `is_master_template: true`
- Test seeding creates the campaign
- **Deliverable**: Master template campaign exists in database

### **Chunk 4: Add Template Characters to Seeds**
- Modify seeds.rb to add 4 basic template characters to master campaign
- Use existing template character structure from current seeds
- Test seeding creates characters with `is_template: true`
- **Deliverable**: Master template has basic character templates

### **Chunk 5: Create `SchtickDuplicatorService`**
- Create service class following existing `CharacterDuplicatorService` pattern
- Implement `duplicate_schtick(schtick, target_campaign)` method
- Write basic tests
- **Deliverable**: Can duplicate individual schticks between campaigns

### **Chunk 6: Create `WeaponDuplicatorService`**
- Create service class following existing pattern
- Implement `duplicate_weapon(weapon, target_campaign)` method  
- Write basic tests
- **Deliverable**: Can duplicate individual weapons between campaigns

### **Chunk 7: Create Basic `CampaignSeederService`**
- Create service class with `seed_campaign(campaign)` method
- Only duplicate characters initially (use existing `CharacterDuplicatorService`)
- Write tests using master template campaign
- **Deliverable**: Can seed campaigns with template characters

### **Chunk 8: Create `CampaignSeederJob`**
- Create Sidekiq job class
- Job calls `CampaignSeederService.seed_campaign`
- Set `seeded_at` timestamp when complete
- Write tests
- **Deliverable**: Background job can seed campaigns

### **Chunk 9: Add Campaign Creation Hook**
- Add `after_create :enqueue_seeding_job` to Campaign model
- Callback enqueues `CampaignSeederJob.perform_later(id)`
- Test hook fires on campaign creation
- **Deliverable**: New campaigns automatically trigger seeding job

### **Chunk 10: Enhance Seeder with Schticks**
- Add schtick duplication to `CampaignSeederService`
- Test schticks are copied from master template
- **Deliverable**: Seeded campaigns have template schticks

### **Chunk 11: Enhance Seeder with Weapons** 
- Add weapon duplication to `CampaignSeederService`
- Test weapons are copied from master template
- **Deliverable**: Seeded campaigns have template weapons

### **Chunk 12: Load YAML Schticks in Seeds**
- Parse `lib/schticks/all.yml` in seeds.rb
- Create schticks in master template campaign
- **Deliverable**: Master template has full schtick library

### **Chunk 13: Load YAML Weapons in Seeds**
- Parse `lib/weapons/weapons.yml` in seeds.rb  
- Create weapons in master template campaign
- **Deliverable**: Master template has full weapon library

## Implementation Strategy

### Benefits of Atomic Approach:
- ✅ Each chunk is independently testable
- ✅ Can be implemented/reviewed one at a time
- ✅ No chunk breaks existing functionality  
- ✅ Progressive enhancement toward full feature
- ✅ Easy to rollback any individual chunk
- ✅ Can pause/resume development at any point

### Recommended Order:
1. **Start with Chunks 1-3**: Database foundation and master template
2. **Build Core Services**: Chunks 4-7 for basic duplication
3. **Add Background Processing**: Chunks 8-9 for async seeding
4. **Enhance Content**: Chunks 10-13 for full template library

### Testing Strategy:
- Each chunk includes unit tests for new functionality
- Integration tests verify chunk interactions
- End-to-end test validates complete user flow

### Rollback Strategy:
- Each migration can be rolled back independently
- Services can be disabled via feature flags
- Campaign model hook can be conditionally enabled

## Success Criteria

### Per-Chunk Validation:
- All tests pass
- No existing functionality broken
- Database migrations run cleanly
- Services handle edge cases

### Complete Feature Validation:
- New campaigns automatically populated with templates
- Character creation page shows archetype options
- Background seeding completes within reasonable time
- Template content matches Feng Shui 2 rulebook

## Technical Notes

### Database Considerations:
- `is_master_template` and `seeded_at` fields are nullable initially
- Master template campaign has special handling in queries
- Seeding service checks for duplicate prevention

### Performance Considerations:
- Background job prevents blocking campaign creation
- Duplication services optimized for bulk operations
- YAML parsing happens only during seeding, not runtime

### Maintenance Considerations:
- Master template campaign is updateable by admins
- Rake tasks available for re-seeding existing campaigns
- YAML files remain source of truth for template content