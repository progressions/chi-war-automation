# Campaign Template Seeding via Background Jobs

**Date**: 2025-08-23  
**Priority**: High  
**Category**: Backend  
**Status**: Open

## Description

New campaigns are created without any template characters, schticks, or weapons, causing the character creation page to show empty results. The character create page queries for `is_template: true` characters but finds none, breaking the onboarding flow for new users.

## Steps to Reproduce
1. Create a new campaign as a gamemaster
2. Navigate to `/characters/create` 
3. Page shows no character templates to choose from
4. Character creation flow is broken - users cannot easily create characters

## Expected Behavior
New campaigns should automatically be populated with:
- 20-30 character templates for different archetypes (Bandit, Martial Artist, Cop, etc.)
- Core schticks from Feng Shui 2 rulebook (Guns, Martial Arts, Driving, etc.)
- Standard weapons organized by time period (pistols, rifles, swords, etc.)
- Basic factions (The Dragons, The Lotus, The Ascended)

## Actual Behavior
New campaigns start completely empty, forcing users to manually create all game content from scratch, resulting in poor onboarding experience.

## Related Files
**Backend (shot-server/):**
- `app/models/campaign.rb` - Add seeding callback and master template flag
- `app/jobs/campaign_seeder_job.rb` - New background job for template duplication
- `app/services/campaign_seeder_service.rb` - Service to duplicate master template content
- `app/services/schtick_duplicator_service.rb` - Duplicate schticks from master template
- `app/services/weapon_duplicator_service.rb` - Duplicate weapons from master template
- `db/migrate/add_master_template_to_campaigns.rb` - Migration for template identification
- `db/migrate/add_seeded_at_to_campaigns.rb` - Track seeding completion
- `db/seeds.rb` - Create master template campaign with all baseline content
- `lib/schticks/all.yml` - Existing schtick data to load
- `lib/weapons/weapons.yml` - Existing weapon data to load

## Investigation Notes

**Existing Infrastructure:**
- `CharacterDuplicatorService` already handles character duplication with images and associations
- YAML files exist with schtick and weapon data in `lib/` directory
- Active Storage supports image duplication for character templates
- Sidekiq infrastructure available for background processing

**Template Campaign Approach Benefits:**
- Leverages existing duplication services
- Supports character images via Active Storage
- Preserves complex database relationships
- Faster than YAML parsing during campaign creation
- Templates are actual game data that can be previewed/modified

## Potential Solution

**Phase 1: Master Template Campaign**
1. Add `is_master_template` boolean field to campaigns
2. Create master template campaign containing all baseline game content
3. Enhance seeds.rb to populate master template from YAML files

**Phase 2: Background Job Implementation**
```ruby
# Campaign model hook
after_create :enqueue_seeding_job

def enqueue_seeding_job
  CampaignSeederJob.perform_later(id)
end

# Background job
class CampaignSeederJob < ApplicationJob
  def perform(campaign_id)
    campaign = Campaign.find(campaign_id)
    CampaignSeederService.seed_campaign(campaign)
  end
end
```

**Phase 3: User Experience**
- Immediate campaign creation (fast response)
- Background template duplication (5-30 seconds)
- ActionCable updates when seeding completes
- Loading states: "Setting up your campaign..."

## Related Issues
- `/issues/2025-08-23-campaign-seed-data-schticks-weapons-templates.md` - Original seed data issue