# Campaign Seeding Phase 5: Create Schtick Duplicator Service

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Create `SchtickDuplicatorService` following the existing `CharacterDuplicatorService` pattern to handle duplication of schticks from the master template campaign to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Service can duplicate individual schticks between campaigns
- Handles schtick attributes and relationships correctly
- Follows existing service patterns in the codebase
- Includes comprehensive error handling

## Actual Behavior
Currently no service exists for duplicating schticks between campaigns.

## Related Files
**Backend (shot-server/):**
- `app/services/schtick_duplicator_service.rb` - New service class
- `spec/services/schtick_duplicator_service_spec.rb` - Tests for the service
- Reference: `app/services/character_duplicator_service.rb` - Existing pattern

## Investigation Notes

**Implementation Requirements:**
- Follow existing `CharacterDuplicatorService` module pattern
- Implement `duplicate_schtick(schtick, target_campaign)` class method
- Handle schtick attributes (name, description, prerequisites, etc.)
- Set proper campaign association for duplicated schtick
- Ensure unique naming if conflicts exist

**Testing Requirements:**
- Test successful schtick duplication
- Verify all attributes are copied correctly
- Test campaign association is set properly
- Handle edge cases (nil inputs, missing campaigns)

## Potential Solution

Create `app/services/schtick_duplicator_service.rb`:
```ruby
module SchtickDuplicatorService
  class << self
    def duplicate_schtick(schtick, target_campaign)
      return nil unless schtick && target_campaign
      
      attributes = schtick.attributes
      duplicated_schtick = Schtick.new(
        attributes.except("id", "created_at", "updated_at", "campaign_id")
      )
      duplicated_schtick.campaign = target_campaign
      duplicated_schtick = set_unique_name(duplicated_schtick)
      
      duplicated_schtick
    end

    private

    def set_unique_name(schtick)
      return schtick unless schtick.name.present?

      base_name = schtick.name.strip
      if schtick.campaign.schticks.exists?(name: base_name)
        counter = 1
        new_name = "#{base_name} (#{counter})"

        while schtick.campaign.schticks.exists?(name: new_name)
          counter += 1
          new_name = "#{base_name} (#{counter})"
        end

        schtick.name = new_name
      end

      schtick
    end
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 4 (template characters)
- **Next Phase**: Campaign Seeding Phase 6 (weapon duplicator service)