# Campaign Pool System Specification

## Metadata
- **Date**: 2025-08-30
- **Author**: Assistant
- **Status**: Draft
- **Priority**: High
- **Estimated Effort**: 2-3 weeks
- **Tags**: #performance #scaling #user-experience

## Overview
Transform campaign creation from a 30+ minute process that frequently fails to instant assignment using pre-seeded campaign pools and batch SQL operations.

## Problem Statement

### Current Issues
1. **Excessive Wait Time**: Campaign seeding takes 30+ minutes for 643 schticks and 140 weapons with images
2. **Connection Failures**: Database connections timeout after processing ~16-20 items, causing transaction rollbacks
3. **Image Copy Failures**: Images don't copy properly due to attachment timing issues
4. **Poor User Experience**: New users abandon the application while waiting for campaign creation
5. **Resource Inefficiency**: Heavy real-time processing during user wait time

### Impact
- User abandonment rate during onboarding
- Server resource spikes during campaign creation
- Support tickets about "stuck" campaign creation
- Database connection pool exhaustion

## Proposed Solution

### Core Components

1. **Campaign Pool System**
   - Maintain pool of pre-seeded campaigns ready for instant assignment
   - Master pool for new users (owned by master template owner)
   - User-specific pools for returning users
   - Automatic replenishment via background jobs

2. **Batch SQL Creation**
   - Replace 1000+ individual ActiveRecord operations with ~10 bulk SQL statements
   - Create all 643 schticks in single INSERT statement
   - Create all 140 weapons in single INSERT statement
   - Handle associations and prerequisites in separate batch operations

3. **Fixed Image Copying**
   - Attach images AFTER record persistence (fixing current bug)
   - Implement async image copying via background jobs
   - Add retry logic for ImageKit operations

4. **Admin Dashboard**
   - Real-time pool status monitoring
   - Performance metrics and trends
   - Quick actions for pool management
   - Alert system for low pool conditions

## User Stories

### Gamemaster Stories
- As a new gamemaster, I want to create my first campaign instantly so I can start inviting players immediately
- As a returning gamemaster, I want my subsequent campaigns ready instantly without waiting
- As a gamemaster, I want all campaign content (schticks, weapons, etc.) available immediately after creation

### Admin Stories
- As an admin, I want to monitor pool health to ensure availability
- As an admin, I want to see performance metrics to optimize pool size
- As an admin, I want alerts when pools are low or failing
- As an admin, I want to manually trigger pool replenishment when needed

## Technical Approach

### Architecture Overview
```
User Request → Controller → Pool Service → Instant Assignment
                                ↓
                        Background Jobs → Replenishment
                                ↓
                        Batch Seeder → SQL Operations
```

### Key Design Decisions
1. **Pool Ownership**: Pool campaigns belong to master template owner until assigned
2. **Dual Pool Strategy**: Master pool for new users, user pools for returning users
3. **Batch Operations**: Prioritize SQL efficiency over ActiveRecord conveniences
4. **Async Images**: Decouple image operations from campaign availability

## Success Metrics

### Performance Metrics
- Campaign creation time: < 1 second (from 30+ minutes)
- Pool creation time: < 2 seconds
- Image copy success rate: > 99%
- Zero connection timeout failures

### Business Metrics
- User activation rate improvement
- Reduced abandonment during onboarding
- Support ticket reduction for campaign issues

### System Metrics
- Pool availability: > 99.9%
- Database connection usage: < 50% during seeding
- Background job success rate: > 99%

## Implementation Phases

### Phase 1: Fix Current System (Week 1)
- Fix image attachment timing bug
- Add connection retry logic
- Reduce batch sizes for stability

### Phase 2: Batch SQL Implementation (Week 1)
- Implement batch creation services
- Add background image copying
- Performance testing and optimization

### Phase 3: Pool System (Week 2)
- Database schema updates
- Pool management service
- Controller integration
- Replenishment jobs

### Phase 4: Admin Dashboard (Week 2-3)
- Dashboard UI
- Real-time monitoring
- Alert system
- Quick actions

### Phase 5: Production Rollout (Week 3)
- Gradual rollout
- Performance monitoring
- Fine-tuning pool sizes

## Risks and Mitigations

### Technical Risks
- **Risk**: Batch SQL complexity
  - **Mitigation**: Thorough testing, fallback to traditional seeding

- **Risk**: Pool exhaustion during high usage
  - **Mitigation**: Predictive replenishment, elastic pool sizing

- **Risk**: Image copy failures
  - **Mitigation**: Retry logic, fallback to on-demand copying

### Operational Risks
- **Risk**: Increased storage costs from pool campaigns
  - **Mitigation**: Automatic cleanup of old unused pools

- **Risk**: Background job failures
  - **Mitigation**: Monitoring, alerts, manual triggers

## Dependencies
- Rails 8.0 with PostgreSQL
- Sidekiq for background jobs
- ImageKit for image storage
- ActionCable for real-time updates

## Open Questions
1. Should we implement shared image blobs to reduce storage?
2. What's the optimal pool size for different user tiers?
3. Should pool campaigns expire after a certain time?

## References
- Current campaign seeding implementation
- Active Storage documentation
- PostgreSQL batch operations guide
- ImageKit API documentation