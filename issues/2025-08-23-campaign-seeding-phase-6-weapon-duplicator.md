# Campaign Seeding Phase 6: Create Weapon Duplicator Service

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Create `WeaponDuplicatorService` following the existing service patterns to handle duplication of weapons from the master template campaign to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Service can duplicate individual weapons between campaigns
- Handles weapon attributes and relationships correctly
- Follows existing service patterns in the codebase
- Includes comprehensive error handling

## Actual Behavior
Currently no service exists for duplicating weapons between campaigns.

## Related Files
**Backend (shot-server/):**
- `app/services/weapon_duplicator_service.rb` - New service class
- `spec/services/weapon_duplicator_service_spec.rb` - Tests for the service
- Reference: `app/services/character_duplicator_service.rb` - Existing pattern
- Reference: `app/services/duplicate_vehicle_service.rb` - Similar existing service

## Investigation Notes

**Implementation Requirements:**
- Follow existing service module pattern (similar to CharacterDuplicatorService)
- Implement `duplicate_weapon(weapon, target_campaign)` class method
- Handle weapon attributes (name, damage, description, weapon stats, etc.)
- Set proper campaign association for duplicated weapon
- Ensure unique naming if conflicts exist

**Testing Requirements:**
- Test successful weapon duplication
- Verify all attributes are copied correctly
- Test campaign association is set properly
- Handle edge cases (nil inputs, missing campaigns)
- Test weapon statistics are preserved

## Potential Solution

Create `app/services/weapon_duplicator_service.rb`:
```ruby
module WeaponDuplicatorService
  class << self
    def duplicate_weapon(weapon, target_campaign)
      return nil unless weapon && target_campaign
      
      attributes = weapon.attributes
      duplicated_weapon = Weapon.new(
        attributes.except("id", "created_at", "updated_at", "campaign_id")
      )
      duplicated_weapon.campaign = target_campaign
      duplicated_weapon = set_unique_name(duplicated_weapon)
      
      duplicated_weapon
    end

    private

    def set_unique_name(weapon)
      return weapon unless weapon.name.present?

      base_name = weapon.name.strip
      if weapon.campaign.weapons.exists?(name: base_name)
        counter = 1
        new_name = "#{base_name} (#{counter})"

        while weapon.campaign.weapons.exists?(name: new_name)
          counter += 1
          new_name = "#{base_name} (#{counter})"
        end

        weapon.name = new_name
      end

      weapon
    end
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 5 (schtick duplicator service)
- **Next Phase**: Campaign Seeding Phase 7 (campaign seeder service)