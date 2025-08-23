# Campaign Seeding Phase 8: Create Campaign Seeding Background Job

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Create `CampaignSeederJob` Sidekiq background job that calls `CampaignSeederService` to seed campaigns asynchronously. This prevents blocking campaign creation while template duplication happens in the background.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Background job can be queued with campaign ID
- Job calls CampaignSeederService to perform seeding
- Job handles errors gracefully with retries
- Job logs progress and completion status
- Job can be tested independently

## Actual Behavior
Currently no background job exists for campaign seeding.

## Related Files
**Backend (shot-server/):**
- `app/jobs/campaign_seeder_job.rb` - New background job class
- `spec/jobs/campaign_seeder_job_spec.rb` - Tests for the job
- Uses: `app/services/campaign_seeder_service.rb` - Service created in Phase 7

## Investigation Notes

**Implementation Requirements:**
- Inherit from `ApplicationJob` for Sidekiq integration
- Accept campaign_id parameter in perform method
- Call CampaignSeederService.seed_campaign with found campaign
- Handle missing campaigns gracefully
- Include retry logic for transient failures
- Log job start, progress, and completion

**Testing Requirements:**
- Test job can be enqueued successfully
- Verify job calls CampaignSeederService correctly
- Test error handling for missing campaigns
- Test retry behavior on failures
- Mock external dependencies in tests

## Potential Solution

Create `app/jobs/campaign_seeder_job.rb`:
```ruby
class CampaignSeederJob < ApplicationJob
  queue_as :default
  
  retry_on StandardError, wait: :exponentially_longer, attempts: 3

  def perform(campaign_id)
    campaign = Campaign.find(campaign_id)
    
    Rails.logger.info "Starting seeding job for campaign #{campaign_id}"
    
    success = CampaignSeederService.seed_campaign(campaign)
    
    if success
      Rails.logger.info "Campaign seeding job completed successfully for campaign #{campaign_id}"
    else
      Rails.logger.error "Campaign seeding job failed for campaign #{campaign_id}"
      raise "Campaign seeding failed"
    end
  rescue ActiveRecord::RecordNotFound
    Rails.logger.error "Campaign #{campaign_id} not found for seeding job"
    # Don't retry for missing records
  rescue => e
    Rails.logger.error "Campaign seeding job error for campaign #{campaign_id}: #{e.message}"
    raise e  # Re-raise to trigger retry logic
  end
end
```

Create basic test structure:
```ruby
# spec/jobs/campaign_seeder_job_spec.rb
require 'rails_helper'

RSpec.describe CampaignSeederJob, type: :job do
  let(:campaign) { create(:campaign) }
  
  describe '#perform' do
    it 'calls CampaignSeederService with the campaign' do
      expect(CampaignSeederService).to receive(:seed_campaign).with(campaign)
      
      described_class.perform_now(campaign.id)
    end
  end
end
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 7 (campaign seeder service)
- **Next Phase**: Campaign Seeding Phase 9 (campaign creation hook)