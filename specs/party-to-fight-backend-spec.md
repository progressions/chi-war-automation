# Party to Fight Backend Specification

**Date**: 2025-08-22  
**Status**: Planning  
**Priority**: Medium  
**Component**: Backend API v2

## Overview

Implement the backend API v2 endpoint and business logic to add entire parties (with all their characters and vehicles) to fights. This builds on existing V1 functionality but adds proper v2 routing, comprehensive testing, and improved error handling.

## API Specification

### Endpoint
```
POST /api/v2/parties/:party_id/fight/:fight_id
```

### Request Parameters
- `party_id` (UUID): ID of the party to add
- `fight_id` (UUID): ID of the target fight

### Response Format
```json
{
  "id": "party-uuid",
  "name": "Party Name",
  "characters": [
    {
      "id": "character-uuid",
      "name": "Character Name",
      "shot_id": "shot-uuid"
    }
  ],
  "vehicles": [
    {
      "id": "vehicle-uuid", 
      "name": "Vehicle Name",
      "shot_id": "shot-uuid"
    }
  ]
}
```

## Business Logic Requirements

### Core Functionality
1. **Campaign Scoping**: Find party and fight within current user's campaign only
2. **Character Addition**: For each character in party, create shot record with `shot: nil` (hidden/not in initiative)
3. **Vehicle Addition**: For each vehicle in party, create shot record with `shot: nil` (hidden/not in initiative)
4. **Multiple Instances**: Allow duplicate characters/vehicles in same fight (important for mooks)
5. **Serialization**: Return party object with nested characters and vehicles including new shot_ids

### Authorization
- User must be member of campaign containing the fight
- Party and fight must belong to same campaign as current user
- Use existing `current_campaign` scoping pattern

### Error Handling
- **404**: Party not found in current campaign
- **404**: Fight not found in current campaign  
- **401**: User not authorized for campaign
- **422**: Invalid UUID parameters
- **500**: Database constraint violations

## Implementation Plan

### Phase 1: Routing and Controller
1. Add route to `config/routes.rb` under `api/v2` namespace
2. Implement `add_to_fight` method in `Api::V2::PartiesController`
3. Use existing authorization patterns from other v2 controllers

### Phase 2: Service Layer
1. Create `PartyToFightService` in `app/services/`
2. Handle character and vehicle shot creation
3. Manage database transactions for atomicity
4. Return consistent response format

### Phase 3: Real-time Updates
1. Broadcast fight changes via `FightChannel`
2. Notify campaign members of new participants
3. Use existing ActionCable patterns

## Database Operations

### Tables Involved
- `parties` - source party lookup
- `memberships` - party member relationships
- `fights` - target fight lookup
- `shots` - new records for each character/vehicle
- `campaigns` - authorization scoping

### Transaction Requirements
- Wrap shot creation in database transaction
- Rollback on any failure to maintain consistency
- Use bulk insert for performance with large parties

## Test Coverage Requirements

### Controller Tests (`spec/requests/api/v2/parties_spec.rb`)

```ruby
describe 'POST /api/v2/parties/:id/fight/:fight_id' do
  context 'successful party addition' do
    # Test basic functionality
    # Test character addition
    # Test vehicle addition  
    # Test mixed character/vehicle parties
  end

  context 'multiple instances' do
    # Test adding same character multiple times
    # Test adding party when fight already has those characters
  end
  
  context 'authorization' do
    # Test campaign scoping
    # Test unauthorized user access
  end
  
  context 'error handling' do
    # Test invalid party_id
    # Test invalid fight_id
    # Test cross-campaign access attempts
  end
end
```

### Service Tests (`spec/services/party_to_fight_service_spec.rb`)

```ruby
describe PartyToFightService do
  describe '#call' do
    # Test shot record creation
    # Test transaction rollback on failure
    # Test return value format
    # Test bulk operations with large parties
  end
end
```

### Model Integration Tests
- Test shot creation with proper associations
- Test campaign scoping constraints
- Test UUID validation

## Performance Considerations

### Optimization Strategies
1. **Bulk Insert**: Use `Shot.insert_all` for multiple shot creation
2. **Eager Loading**: Include associations in party/fight queries
3. **Database Indexes**: Ensure proper indexing on foreign keys
4. **Query Batching**: Limit N+1 queries in serialization

### Monitoring Points
- Response time for large parties (>20 members)
- Database connection pooling under load
- ActionCable broadcast performance

## Security Considerations

### Data Protection
- Validate all UUID parameters before database queries
- Use parameterized queries to prevent injection
- Sanitize any user-provided data

### Authorization Layers
1. **Controller Level**: `before_action :authenticate_user!`
2. **Campaign Level**: `current_campaign` scoping
3. **Resource Level**: Party and fight ownership validation

### Rate Limiting
- Consider rate limiting for bulk operations
- Monitor for abuse patterns
- Implement reasonable request size limits

## Acceptance Criteria

### Core Functionality
- [ ] POST `/api/v2/parties/:party_id/fight/:fight_id` endpoint exists and responds
- [ ] Creates shot records for all party characters with `shot: nil` (hidden)
- [ ] Creates shot records for all party vehicles with `shot: nil` (hidden)
- [ ] Allows multiple instances of same character/vehicle in fight
- [ ] Returns party object with character/vehicle details and shot_ids

### Authorization & Security
- [ ] Scopes operations to current user's campaign only
- [ ] Returns 404 for parties/fights in other campaigns
- [ ] Returns 401 for unauthorized users
- [ ] Validates UUID format for all parameters

### Error Handling
- [ ] Graceful handling of invalid party_id
- [ ] Graceful handling of invalid fight_id
- [ ] Database constraint violation handling
- [ ] Proper HTTP status codes for all error conditions

### Performance & Reliability
- [ ] Database operations wrapped in transactions
- [ ] Bulk insert used for multiple shot creation
- [ ] Response time < 500ms for parties with 20+ members
- [ ] ActionCable broadcasts triggered for real-time updates

### Test Coverage
- [ ] Controller request specs for all scenarios
- [ ] Service layer unit tests
- [ ] Integration tests with real database
- [ ] Edge case coverage (empty parties, deleted characters, etc.)

## Implementation Notes

### Development Approach
1. **Test-First**: Write failing tests before implementation
2. **Incremental**: Build feature in small, testable chunks
3. **Existing Patterns**: Follow established v2 API conventions
4. **Backward Compatibility**: Do not modify existing V1 functionality

### Code Organization
- Controller logic minimal, delegate to service layer
- Service classes focused on single responsibility
- Consistent error handling across v2 API
- Clear separation between authorization and business logic

### Documentation Requirements
- Update API documentation with new endpoint
- Include example requests/responses
- Document error codes and messages
- Add changelog entry for v2 API