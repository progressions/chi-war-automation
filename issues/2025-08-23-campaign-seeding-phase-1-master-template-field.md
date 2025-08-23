# Campaign Seeding Phase 1: Add Master Template Database Field

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Add `is_master_template` boolean field to campaigns table to identify the master template campaign that contains all baseline game content for duplication to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Database can identify which campaign serves as the master template
- Field defaults to false for existing campaigns
- Migration runs cleanly without affecting existing data

## Actual Behavior
Currently no way to identify master template campaigns in the database.

## Related Files
**Backend (shot-server/):**
- `db/migrate/XXXXXX_add_is_master_template_to_campaigns.rb` - New migration
- `app/models/campaign.rb` - May need validation or scope methods

## Investigation Notes

**Implementation Requirements:**
- Add boolean field `is_master_template` with default false
- Field should be nullable initially to handle existing campaigns safely  
- Consider adding database index if we'll query on this field frequently

**Testing Requirements:**
- Verify migration runs without errors
- Confirm existing campaigns unaffected
- Test new campaigns default to false

## Potential Solution

Create Rails migration:
```ruby
class AddIsMasterTemplateToCampaigns < ActiveRecord::Migration[8.0]
  def change
    add_column :campaigns, :is_master_template, :boolean, default: false, null: false
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Next Phase**: Campaign Seeding Phase 2 (seeded_at field)