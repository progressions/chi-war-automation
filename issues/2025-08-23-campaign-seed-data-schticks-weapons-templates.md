# Campaign Seed Data: Schticks, Weapons, and Character Templates

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

New campaigns are created without any default schticks, weapons, or character templates, forcing gamemasters to manually create every basic game element from scratch. This creates a poor onboarding experience and slows down campaign setup significantly.

## Problem Statement

- New campaigns start completely empty with no baseline game content
- Gamemasters must manually create all basic schticks (Guns, Martial Arts, Driving, etc.)
- No default weapons available (pistols, rifles, swords, etc.) 
- Missing character templates for common archetypes (Cop, Soldier, Martial Artist, etc.)
- Time-consuming setup process discourages new users
- Risk of inconsistent game data between campaigns

## Expected Behavior

When a new campaign is created, it should be automatically populated with:
- **Core schticks** from Feng Shui 2 rulebook (Guns, Martial Arts, Driving, Intrusion, etc.)
- **Standard weapons** with proper stats (Pistol .38, AK-97, Sword, etc.)
- **Character templates** for common archetypes with pre-filled stats and schticks
- **Consistent baseline** that matches official game content

## Current Assets

YAML files already exist with schtick and weapon data:
- Structured data format with names, descriptions, and game stats
- Official Feng Shui 2 content ready for import
- Character templates may need to be created or converted

## Related Files

**Backend (shot-server/):**
- `db/seeds.rb` - Main seed file coordination
- `db/seed_data/` - Directory for YAML data files
- `app/models/schtick.rb` - Schtick model and associations
- `app/models/weapon.rb` - Weapon model and associations  
- `app/models/character.rb` - Character model for templates
- `app/models/campaign.rb` - Campaign model for seed data association
- `app/services/campaign_seeder_service.rb` - Service for populating new campaigns
- `lib/tasks/seed_campaign_data.rake` - Rake task for manual seeding

## Investigation Notes

**Implementation Options:**

1. **Campaign Creation Hook**: Automatically seed data when campaign created
2. **Rake Task**: Manual seeding via command line for existing campaigns  
3. **API Endpoint**: Allow gamemasters to trigger seeding via UI
4. **YAML Import Service**: Parse YAML files and create database records
5. **Template System**: Pre-defined templates that can be instantiated per campaign

**Data Structure Considerations:**
- Campaign-scoped vs global seed data
- Handling updates to baseline content over time
- User customization vs standard templates
- Database relationships and foreign keys

**Questions to Resolve:**
- Should seed data be campaign-specific or shared globally?
- How do we handle updates to standard content?
- Do users need ability to customize default seed sets?
- Should seeding be automatic or opt-in?

## Potential Solution

**Phase 1: YAML Import Infrastructure**
1. Create seed data directory structure in `db/seed_data/`
2. Build YAML parser service to create model instances
3. Design campaign seeding service to populate new campaigns
4. Add database indexes for efficient seed data queries

**Phase 2: Campaign Creation Integration**
1. Hook into campaign creation process to automatically seed data
2. Provide UI indication that seeding is occurring
3. Handle seeding failures gracefully without breaking campaign creation
4. Add option to skip seeding for advanced users

**Phase 3: Seed Data Management**
1. Create rake tasks for manual seeding of existing campaigns
2. Build admin interface for managing seed data templates
3. Add versioning system for seed data updates
4. Provide bulk update capabilities for multiple campaigns

## Technical Considerations

**Performance:**
- Seeding should not significantly delay campaign creation
- Consider background job processing for large seed sets
- Optimize database queries for bulk inserts

**Data Integrity:**
- Handle duplicate prevention if seeding runs multiple times
- Validate YAML structure before importing
- Maintain referential integrity between related models

**User Experience:**
- Clear feedback when seeding occurs
- Option to disable automatic seeding
- Easy way to re-seed or update existing campaigns

## Success Criteria

- New campaigns automatically populated with standard game content
- Gamemasters can immediately start creating characters without manual setup
- Consistent baseline content across all new campaigns
- Seed data matches official Feng Shui 2 rulebook content
- Seeding process is fast and reliable
- Easy maintenance and updates of seed data over time

## Next Steps

1. Review existing YAML files and assess data structure
2. Create seed data service architecture  
3. Implement YAML parsing and model creation logic
4. Hook into campaign creation workflow
5. Test seeding performance and reliability
6. Create management interface for ongoing seed data maintenance