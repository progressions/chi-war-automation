# Campaign Seeding Phase 3: Create Master Template Campaign

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Modify `db/seeds.rb` to create a master template campaign with `is_master_template: true` that will serve as the source for all baseline game content to be duplicated to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Running `rails db:seed` creates a "Master Templates" campaign
- Campaign has `is_master_template: true`  
- Campaign is owned by the gamemaster test user
- Campaign serves as foundation for template content

## Actual Behavior
Currently no master template campaign exists in the seeding process.

## Related Files
**Backend (shot-server/):**
- `db/seeds.rb` - Add master template campaign creation
- Test that seeding runs without errors

## Investigation Notes

**Implementation Requirements:**
- Create campaign with recognizable name like "Master Templates"
- Set `is_master_template: true` 
- Assign to gamemaster test user for ownership
- Campaign should not be added to user's campaign list for normal gameplay

**Testing Requirements:**
- Verify seeding creates the campaign successfully
- Confirm `is_master_template` flag is set correctly
- Test seeding can run multiple times safely (find_or_create_by)

## Potential Solution

Add to `db/seeds.rb`:
```ruby
# Create master template campaign for seeding new campaigns
master_template = Campaign.find_or_create_by(
  name: 'Master Templates',
  is_master_template: true
) do |campaign|
  campaign.user = test_user  # Gamemaster owns the template
  campaign.description = 'Master template campaign containing baseline game content for new campaigns'
end

puts "Master template campaign: #{master_template.name}, Template: #{master_template.is_master_template}"
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 2 (seeded_at field)
- **Next Phase**: Campaign Seeding Phase 4 (add template characters)