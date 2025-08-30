# Campaign Pool System - Technical Specification

## Database Schema Changes

### Campaigns Table Additions
```ruby
class AddPoolFieldsToCampaigns < ActiveRecord::Migration[7.1]
  def change
    add_column :campaigns, :is_pool, :boolean, default: false, null: false
    add_column :campaigns, :activated_at, :datetime
    add_column :campaigns, :pool_type, :string # 'master' or 'user'
    add_column :campaigns, :pool_created_at, :datetime # When pool campaign was actually created
    add_column :campaigns, :seeding_duration_ms, :integer
    
    add_index :campaigns, [:is_pool, :user_id]
    add_index :campaigns, [:is_pool, :activated_at]
    add_index :campaigns, :pool_type
  end
end
```

### Pool Metrics Table
```ruby
class CreatePoolMetrics < ActiveRecord::Migration[7.1]
  def change
    create_table :pool_metrics do |t|
      t.integer :master_pool_size, null: false
      t.integer :user_pools_count, null: false
      t.integer :assignments_today, default: 0
      t.integer :replenishments_today, default: 0
      t.float :avg_seeding_time_ms
      t.float :avg_assignment_time_ms
      t.timestamps
    end
  end
end
```

## Service Implementations

### CampaignBatchSeederService
```ruby
class CampaignBatchSeederService
  class << self
    def seed_campaign_batch(campaign)
      master = Campaign.find_by(is_master_template: true)
      return false unless master
      
      ActiveRecord::Base.transaction do
        # Step 1: Batch create records
        schtick_mapping = batch_create_schticks(master.id, campaign.id)
        weapon_mapping = batch_create_weapons(master.id, campaign.id)
        
        # Step 2: Handle associations
        update_schtick_prerequisites(schtick_mapping)
        
        # Step 3: Share ImageKit URLs (no file copying!)
        share_image_urls('Schtick', schtick_mapping)
        share_image_urls('Weapon', weapon_mapping)
        
        # Step 4: Traditional copy for user-editable content
        copy_characters_traditional(master, campaign)
        
        campaign.update!(seeded_at: Time.current)
      end
      
      true
    end
    
    private
    
    def batch_create_schticks(source_id, target_id)
      sql = <<~SQL
        WITH source_schticks AS (
          SELECT * FROM schticks WHERE campaign_id = :source_id
        ),
        inserted_schticks AS (
          INSERT INTO schticks (
            id, campaign_id, name, description, category,
            path, reload_value, shot_cost, created_at, updated_at
          )
          SELECT 
            gen_random_uuid(),
            :target_id,
            name, description, category,
            path, reload_value, shot_cost,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          FROM source_schticks
          RETURNING id, name
        )
        SELECT 
          s.id as source_id,
          i.id as target_id,
          s.name
        FROM source_schticks s
        JOIN inserted_schticks i ON s.name = i.name
      SQL
      
      result = ActiveRecord::Base.connection.exec_query(
        ActiveRecord::Base.sanitize_sql([sql, source_id: source_id, target_id: target_id])
      )
      
      result.rows.map { |r| { source_id: r[0], target_id: r[1], name: r[2] } }
    end
    
    def share_image_urls(record_type, mapping)
      # Get all existing attachments for source records
      source_attachments = ActiveStorage::Attachment
        .joins(:blob)
        .where(record_type: record_type, record_id: mapping.map { |m| m[:source_id] })
        .select(:record_id, :blob_id, 'active_storage_blobs.key')
      
      # Create new attachments pointing to SAME blobs (shared ImageKit URLs!)
      attachment_values = mapping.map do |m|
        attachment = source_attachments.find { |a| a.record_id == m[:source_id] }
        next unless attachment
        
        "(
          'image',
          '#{record_type}',
          '#{m[:target_id]}',
          #{attachment.blob_id},
          NOW()
        )"
      end.compact
      
      if attachment_values.any?
        sql = <<~SQL
          INSERT INTO active_storage_attachments (
            name, record_type, record_id, blob_id, created_at
          )
          VALUES #{attachment_values.join(',')}
        SQL
        
        ActiveRecord::Base.connection.execute(sql)
      end
      
      Rails.logger.info "Shared #{attachment_values.count} ImageKit URLs for #{record_type}"
    end
  end
end
```

### CampaignPoolService
```ruby
class CampaignPoolService
  class << self
    def find_available_pool(user)
      # Try user's personal pool first
      pool = user.campaigns.where(is_pool: true).first
      return pool if pool
      
      # Fall back to master pool for new users
      master_owner = User.find_by(email: ENV['MASTER_OWNER_EMAIL'])
      master_owner.campaigns.where(is_pool: true).first
    end
    
    def assign_pool_campaign(pool_campaign, user, attributes)
      pool_campaign.transaction do
        previous_owner = pool_campaign.user
        
        # Reset timestamps to make campaign appear fresh
        pool_campaign.update!(
          attributes.merge(
            is_pool: false,
            user: user,
            created_at: Time.current,     # Reset to appear newly created
            updated_at: Time.current,     # Reset to appear fresh
            activated_at: Time.current,   # Mark activation time
            # pool_created_at remains unchanged to track actual creation
          )
        )
        
        # Update all child records to have fresh timestamps too
        reset_child_timestamps(pool_campaign)
        
        # Trigger replenishment
        if previous_owner.email == ENV['MASTER_OWNER_EMAIL']
          # Replenish master pool
          CampaignPoolReplenishJob.perform_later(previous_owner, for_master_pool: true)
          # Create user pool for future
          CampaignPoolReplenishJob.perform_later(user, for_master_pool: false)
        else
          # Just replenish user's pool
          CampaignPoolReplenishJob.perform_later(user, for_master_pool: false)
        end
        
        pool_campaign
      end
    end
    
    private
    
    def reset_child_timestamps(campaign)
      # Update timestamps for all child records to match campaign
      timestamp = campaign.created_at
      
      # Batch update all related records
      campaign.schticks.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.weapons.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.characters.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.vehicles.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.factions.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.junctures.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.sites.update_all(created_at: timestamp, updated_at: timestamp)
      campaign.parties.update_all(created_at: timestamp, updated_at: timestamp)
    end
    
    def pool_status
      master_owner = User.find_by(email: ENV['MASTER_OWNER_EMAIL'])
      
      {
        master_pool: {
          ready: master_owner.campaigns.where(is_pool: true).count,
          target_size: 3,
          being_created: pool_creation_in_progress?(master_owner),
          oldest_pool_age: oldest_pool_age(master_owner)
        },
        user_pools: {
          total_users: User.count,
          users_with_pools: User.joins(:campaigns).where(campaigns: { is_pool: true }).distinct.count,
          total_pools: Campaign.where(is_pool: true).count
        },
        health: calculate_pool_health
      }
    end
  end
end
```

### Background Jobs

#### CampaignPoolReplenishJob
```ruby
class CampaignPoolReplenishJob < ApplicationJob
  queue_as :default
  
  def perform(user, for_master_pool: false)
    # Check if replenishment needed
    if for_master_pool
      current_size = user.campaigns.where(is_pool: true).count
      return if current_size >= 3
    else
      return if user.campaigns.where(is_pool: true).exists?
    end
    
    # Create pool campaign with timestamp tracking
    campaign = user.campaigns.create!(
      name: "Pool Campaign #{SecureRandom.hex(4)}",
      description: "Pre-seeded campaign",
      is_pool: true,
      pool_type: for_master_pool ? 'master' : 'user',
      pool_created_at: Time.current,  # Track actual creation time
      created_at: Time.current,        # Will be reset on assignment
      updated_at: Time.current
    )
    
    # Seed with batch operations and shared ImageKit URLs
    start_time = Time.current
    success = CampaignBatchSeederService.seed_campaign_batch(campaign)
    duration = ((Time.current - start_time) * 1000).to_i
    
    if success
      campaign.update!(seeding_duration_ms: duration)
      Rails.logger.info "Created pool campaign in #{duration}ms with shared ImageKit URLs"
    else
      campaign.destroy
      raise "Failed to seed pool campaign"
    end
  end
end
```

#### PoolMonitorJob
```ruby
class PoolMonitorJob < ApplicationJob
  queue_as :low
  
  def perform
    status = CampaignPoolService.pool_status
    
    # Check master pool health
    if status[:master_pool][:ready] < 2
      AlertMailer.low_master_pool(status[:master_pool][:ready]).deliver_later
      
      # Auto-replenish
      master_owner = User.find_by(email: ENV['MASTER_OWNER_EMAIL'])
      (3 - status[:master_pool][:ready]).times do
        CampaignPoolReplenishJob.perform_later(master_owner, for_master_pool: true)
      end
    end
    
    # Track metrics
    PoolMetric.create!(
      master_pool_size: status[:master_pool][:ready],
      user_pools_count: status[:user_pools][:total_pools],
      assignments_today: Campaign.where(activated_at: Date.current.all_day).count,
      replenishments_today: Campaign.where(pool_created_at: Date.current.all_day).count
    )
    
    # Cleanup old unused pools (but keep pool_created_at for analytics)
    old_pools = Campaign.where(is_pool: true)
                        .where('pool_created_at < ?', 6.months.ago)
    old_pools.destroy_all if old_pools.any?
  end
end
```

## Controller Updates

### CampaignsController
```ruby
class Api::V2::CampaignsController < ApplicationController
  def create
    # Try pool assignment first
    pool_campaign = CampaignPoolService.find_available_pool(current_user)
    
    if pool_campaign
      @campaign = CampaignPoolService.assign_pool_campaign(
        pool_campaign,
        current_user,
        campaign_params
      )
      
      # Campaign appears freshly created to user
      render json: @campaign, status: :created
    else
      # Fallback to traditional creation
      create_traditional_campaign
    end
  end
  
  private
  
  def create_traditional_campaign
    @campaign = current_user.campaigns.new(campaign_params)
    
    if @campaign.save
      CampaignSeederJob.perform_later(@campaign.id)
      render json: @campaign, status: :created
    else
      render json: { errors: @campaign.errors }, status: :unprocessable_entity
    end
  end
end
```

## ImageKit URL Sharing Strategy

### Key Insight
Since images are stored on ImageKit, we can share URLs between campaigns:

1. **Master Schtick**: Has blob with ImageKit URL `https://ik.imagekit.io/abc123/schtick.jpg`
2. **Pool Schtick**: References SAME blob, same URL
3. **No Copy Operation**: No new upload to ImageKit needed
4. **Instant Availability**: Image loads immediately

### Implementation
```ruby
# Instead of copying blobs:
# OLD: Create new blob, upload to ImageKit, create attachment
# NEW: Create attachment pointing to existing blob

def share_image_urls(source_records, target_records)
  # Map source attachments to target records
  # Create attachments with same blob_id
  # Result: Multiple records share same ImageKit URL
end
```

### Benefits
- **Performance**: No image copying = instant campaign creation
- **Cost**: No duplicate storage on ImageKit
- **Reliability**: No upload failures to handle
- **Simplicity**: Just database operations

## Performance Requirements

### Response Times
- Pool assignment: < 100ms
- Pool creation (background): < 2000ms
- Dashboard load: < 500ms

### Throughput
- Support 100 concurrent campaign creations
- Process 10 pool replenishments in parallel
- Handle 1000 campaigns/day

### Resource Usage
- Database connections during seeding: < 5
- Memory usage per pool creation: < 512MB
- Background job queue depth: < 100

## Monitoring and Alerts

### Key Metrics to Track
```ruby
# config/initializers/metrics.rb
Rails.application.config.after_initialize do
  # Track pool assignments
  ActiveSupport::Notifications.subscribe "campaign.assigned_from_pool" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    StatsD.timing("campaign.pool.assignment_time", event.duration)
    StatsD.increment("campaign.pool.assignments")
  end
  
  # Track pool creation
  ActiveSupport::Notifications.subscribe "campaign.pool.created" do |*args|
    event = ActiveSupport::Notifications::Event.new(*args)
    StatsD.timing("campaign.pool.creation_time", event.duration)
    StatsD.gauge("campaign.pool.master_size", CampaignPoolService.pool_status[:master_pool][:ready])
  end
end
```

### Alert Thresholds
- Master pool < 2: CRITICAL
- Pool creation time > 5s: WARNING
- Pool assignment failure: CRITICAL
- Pool age > 6 months: WARNING (cleanup needed)

## Security Considerations

1. **Authorization**: Only admins can access dashboard
2. **Rate Limiting**: Limit campaign creations per user
3. **Resource Limits**: Cap pool size per user
4. **Audit Trail**: Log all pool assignments with timestamps

## Testing Strategy

### Unit Tests
```ruby
describe CampaignPoolService do
  it "resets timestamps on assignment" do
    pool_campaign = create(:campaign, is_pool: true, created_at: 1.week.ago)
    
    assigned = CampaignPoolService.assign_pool_campaign(
      pool_campaign, user, { name: "My Campaign" }
    )
    
    expect(assigned.created_at).to be_within(1.second).of(Time.current)
    expect(assigned.pool_created_at).to eq(1.week.ago)
  end
end
```

### Integration Tests
- Test full pool lifecycle
- Test ImageKit URL sharing
- Test timestamp management
- Test concurrent assignments

### Load Tests
- Simulate 100 concurrent users
- Test pool exhaustion
- Measure response times under load

## Rollback Plan

If issues arise:
1. Disable pool assignment (feature flag)
2. Fall back to traditional creation
3. Keep pools for manual investigation
4. Fix issues and re-enable

## Future Enhancements

1. **Predictive Pool Sizing**: ML-based pool size optimization
2. **Tiered Pools**: Different pools for different user tiers
3. **Regional Pools**: Geo-distributed pools for global users
4. **Template Versioning**: Support multiple template versions
5. **Pool Analytics**: Track pool efficiency and usage patterns