# Campaign Seeding Phase 7: Create Campaign Seeder Service

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Create `CampaignSeederService` that coordinates the duplication of all template content from the master template campaign to a target campaign. Initially focuses on character duplication using existing `CharacterDuplicatorService`.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Service can seed a campaign with template characters
- Uses existing `CharacterDuplicatorService` for duplication
- Finds master template campaign automatically
- Handles cases where master template doesn't exist
- Sets `seeded_at` timestamp when complete

## Actual Behavior
Currently no service exists for coordinating campaign template seeding.

## Related Files
**Backend (shot-server/):**
- `app/services/campaign_seeder_service.rb` - New service class
- `spec/services/campaign_seeder_service_spec.rb` - Tests for the service
- Uses: `app/services/character_duplicator_service.rb` - Existing character duplication

## Investigation Notes

**Implementation Requirements:**
- Create class method `seed_campaign(campaign)` 
- Find master template campaign using `is_master_template: true`
- Duplicate all template characters using CharacterDuplicatorService
- Set `campaign.seeded_at = Time.current` when complete
- Handle errors gracefully and log progress

**Testing Requirements:**
- Test successful campaign seeding with characters
- Verify `seeded_at` timestamp is set correctly
- Handle missing master template campaign
- Test idempotency (don't re-seed if already seeded)
- Verify duplicated characters belong to target campaign

## Potential Solution

Create `app/services/campaign_seeder_service.rb`:
```ruby
class CampaignSeederService
  class << self
    def seed_campaign(campaign)
      return false if campaign.seeded_at.present?
      
      master_template = Campaign.find_by(is_master_template: true)
      return false unless master_template
      
      Rails.logger.info "Seeding campaign #{campaign.id} from master template #{master_template.id}"
      
      # Duplicate template characters
      master_template.characters.where(is_template: true).find_each do |template_character|
        duplicated = CharacterDuplicatorService.duplicate_character(template_character, campaign.user)
        duplicated.campaign = campaign
        duplicated.is_template = false  # Duplicated characters are not templates
        duplicated.save!
        
        Rails.logger.info "Duplicated character: #{duplicated.name}"
      end
      
      # Mark campaign as seeded
      campaign.update!(seeded_at: Time.current)
      Rails.logger.info "Campaign #{campaign.id} seeded successfully"
      
      true
    rescue => e
      Rails.logger.error "Failed to seed campaign #{campaign.id}: #{e.message}"
      false
    end
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 6 (weapon duplicator service)
- **Next Phase**: Campaign Seeding Phase 8 (background seeding job)