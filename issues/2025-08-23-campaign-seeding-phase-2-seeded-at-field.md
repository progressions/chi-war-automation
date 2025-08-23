# Campaign Seeding Phase 2: Add Seeded At Tracking Field

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Add `seeded_at` datetime field to campaigns table to track when template seeding was completed. This prevents duplicate seeding and provides status tracking for the background job process.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Database can track when campaigns completed template seeding
- Field is nullable for existing campaigns that weren't seeded
- Migration runs cleanly without affecting existing data

## Actual Behavior
Currently no way to track seeding completion status in the database.

## Related Files
**Backend (shot-server/):**
- `db/migrate/XXXXXX_add_seeded_at_to_campaigns.rb` - New migration
- `app/models/campaign.rb` - May need scope methods for seeded/unseeded campaigns

## Investigation Notes

**Implementation Requirements:**
- Add datetime field `seeded_at` with null default
- Field remains null until seeding job completes successfully
- Provides idempotency for seeding operations

**Testing Requirements:**
- Verify migration runs without errors
- Confirm existing campaigns unaffected (field is null)
- Test timestamp can be set when seeding completes

## Potential Solution

Create Rails migration:
```ruby
class AddSeededAtToCampaigns < ActiveRecord::Migration[8.0]
  def change
    add_column :campaigns, :seeded_at, :datetime, null: true
    add_index :campaigns, :seeded_at
  end
end
```

Consider adding scope methods to Campaign model:
```ruby
scope :seeded, -> { where.not(seeded_at: nil) }
scope :unseeded, -> { where(seeded_at: nil) }
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 1 (master template field)
- **Next Phase**: Campaign Seeding Phase 3 (create master template campaign)