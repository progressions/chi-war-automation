# Campaign Seeding Phase 9: Add Campaign Creation Hook

**Date**: 2025-08-23  
**Priority**: High  
**Category**: Backend  
**Status**: Open

## Description

Add `after_create` callback to Campaign model that automatically enqueues `CampaignSeederJob` when new campaigns are created. This completes the automatic seeding pipeline for new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- When a new campaign is created, seeding job is automatically enqueued
- Campaign creation remains fast (synchronous part completes immediately)
- Background job handles template duplication asynchronously
- Hook only triggers for regular campaigns (not master templates)
- Hook can be tested independently

## Actual Behavior
Currently campaigns are created without any template seeding process.

## Related Files
**Backend (shot-server/):**
- `app/models/campaign.rb` - Add after_create callback
- `spec/models/campaign_spec.rb` - Test callback behavior
- Uses: `app/jobs/campaign_seeder_job.rb` - Job created in Phase 8

## Investigation Notes

**Implementation Requirements:**
- Add `after_create :enqueue_seeding_job` callback to Campaign model
- Callback should only trigger for non-master-template campaigns
- Job should be enqueued with campaign ID
- Handle cases where job queueing fails gracefully
- Ensure callback doesn't break existing campaign creation

**Testing Requirements:**
- Test callback enqueues job on campaign creation
- Verify master template campaigns don't trigger seeding
- Test job receives correct campaign ID
- Handle job queueing failures gracefully
- Ensure existing campaign creation still works

## Potential Solution

Add to `app/models/campaign.rb`:
```ruby
class Campaign < ApplicationRecord
  # ... existing code ...
  
  after_create :enqueue_seeding_job
  
  private
  
  def enqueue_seeding_job
    return if is_master_template?
    
    begin
      CampaignSeederJob.perform_later(id)
      Rails.logger.info "Enqueued seeding job for campaign #{id}"
    rescue => e
      Rails.logger.error "Failed to enqueue seeding job for campaign #{id}: #{e.message}"
      # Don't raise - campaign creation should succeed even if job fails to enqueue
    end
  end
end
```

Add tests to campaign spec:
```ruby
# spec/models/campaign_spec.rb
describe 'after_create callbacks' do
  it 'enqueues seeding job for regular campaigns' do
    expect(CampaignSeederJob).to receive(:perform_later)
    
    create(:campaign)
  end
  
  it 'does not enqueue seeding job for master template campaigns' do
    expect(CampaignSeederJob).not_to receive(:perform_later)
    
    create(:campaign, is_master_template: true)
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 8 (background job)
- **Next Phase**: Campaign Seeding Phase 10 (enhance with schticks)

## Success Criteria
After this phase, the core seeding pipeline is complete:
1. User creates campaign → immediate response
2. Hook enqueues background job automatically
3. Job seeds campaign with template characters
4. Character creation page shows templates