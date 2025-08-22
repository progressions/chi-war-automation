# Fix RSpec Test Suite - Update Specs to Match Controller Behavior

**Date**: 2025-01-28
**Priority**: High
**Category**: Backend, Testing

## Description

Update the existing RSpec test suite in shot-server to match the actual behavior of the working API controllers. The controllers are functional and handle requests from both the legacy frontend client (using api/v1 endpoints) and the new shot-client-next (using api/v2 endpoints). The goal is to update all existing specs to reflect the current controller implementation until the entire RSpec test suite passes.

## Current Situation

- Legacy frontend client uses `/api/v1/` endpoints
- New shot-client-next uses `/api/v2/` endpoints  
- Controllers are working correctly in production
- RSpec test suite has failing tests due to outdated expectations
- Tests need to be updated to match actual controller behavior rather than changing working controllers

### RSpec Test Suite Current State
- **Total Examples**: 1115
- **Failures**: 79 tests failing
- **Pending**: 5 tests pending
- **Pass Rate**: ~92.9% (1031/1115 passing)

### Failure Categories Identified
- API v1 controller failures (characters, campaigns, invitations, schticks, etc.)
- API v2 controller failures (campaigns, characters, weapons, users)
- Authentication and authorization issues  
- Response serialization format mismatches
- Parameter validation and strong parameters issues

## Implementation Requirements

### 1. RSpec Test Suite Analysis
- Run the complete RSpec test suite to identify all failing tests
- Categorize failures by:
  - API endpoint version mismatches (v1 vs v2)
  - Authentication/authorization changes
  - Response format differences
  - Parameter validation changes
  - Business logic evolution

### 2. Controller Specification Updates

#### API Version Compatibility
- Update specs to test correct API versions (`/api/v1/` vs `/api/v2/`)
- Ensure legacy v1 endpoint specs match legacy client expectations
- Ensure v2 endpoint specs match shot-client-next expectations
- Verify backward compatibility where required

#### Authentication & Authorization
- Update authentication specs to match current Devise/JWT implementation
- Fix authorization specs for gamemaster vs player permissions
- Update user context and campaign membership validation
- Verify current_user and current_campaign logic

#### Response Format Validation
- Update serializer expectations to match current serializer implementations
- Fix JSON response structure validation
- Update pagination format expectations
- Ensure error response formats match current implementation

#### Parameter Handling
- Update parameter validation specs to match current strong parameters
- Fix nested attribute handling expectations
- Update file upload and attachment handling specs
- Verify query parameter processing

### 3. Model Specification Updates

#### Association Testing
- Update association specs to match current model relationships
- Fix polymorphic association tests
- Update dependent destroy/nullify behavior validation
- Verify UUID-based relationships

#### Validation Testing  
- Update validation specs to match current validation rules
- Fix custom validator behavior expectations
- Update uniqueness constraint testing with proper scoping
- Verify presence and format validations

#### Business Logic Testing
- Update method behavior specs to match current implementations
- Fix calculated field and derived value testing
- Update state machine and workflow validation
- Verify campaign and fight management logic

### 4. Service Specification Updates

#### Core Services
- Update specs for services in `app/services/`:
  - `AiService` - AI character/image generation
  - `CharacterDuplicatorService` - Character cloning
  - `DiceRoller` - Dice mechanics and calculations
  - `NotionService` - Notion synchronization
  - `CurrentCampaign` - Campaign context management
  - `CurrentFight` - Fight management

#### Background Jobs
- Update job specs for Sidekiq background processing
- Fix ActionCable broadcast job testing
- Update AI generation job validation
- Verify Discord integration job behavior

### 5. Channel Specification Updates

#### WebSocket Testing
- Update ActionCable channel specs:
  - `CampaignChannel` - Campaign-wide updates
  - `FightChannel` - Real-time fight updates
- Fix subscription and broadcast testing
- Update real-time message format validation

## Acceptance Criteria

- [ ] Complete RSpec test suite runs without failures
- [ ] All controller specs match actual controller behavior
- [ ] API v1 endpoints properly tested for legacy client compatibility
- [ ] API v2 endpoints properly tested for shot-client-next compatibility
- [ ] Model validations and associations correctly validated
- [ ] Service layer business logic properly tested
- [ ] Background job processing correctly validated
- [ ] WebSocket channel behavior properly tested
- [ ] Authentication and authorization flows validated
- [ ] Error handling and edge cases covered

## Implementation Strategy

### Phase 1: Assessment and Planning
1. Run full RSpec suite and document all failures
2. Categorize failures by component (controllers, models, services, etc.)
3. Prioritize fixes by impact and complexity
4. Create systematic approach for updating specs

### Phase 2: Controller Spec Updates
1. Fix API v1 controller specs for legacy compatibility
2. Fix API v2 controller specs for current frontend
3. Update authentication and authorization specs
4. Validate request/response formats

### Phase 3: Model and Service Spec Updates
1. Update model validation and association specs
2. Fix service layer business logic specs
3. Update background job and channel specs
4. Verify integration between components

### Phase 4: Validation and Cleanup
1. Run complete test suite to verify all fixes
2. Optimize slow tests and improve test performance
3. Update test documentation and patterns
4. Ensure CI/CD compatibility

## Expected Benefits

- **Development Confidence**: Reliable test suite enables safe refactoring
- **Regression Prevention**: Catch breaking changes before production deployment
- **Documentation**: Tests serve as executable specifications for API behavior
- **CI/CD Reliability**: Enable automated testing in deployment pipeline
- **Maintenance Efficiency**: Faster debugging and validation of changes

## Related Files

### Controllers
- `app/controllers/api/v1/**/*.rb` - Legacy API controllers
- `app/controllers/api/v2/**/*.rb` - Current API controllers
- `spec/controllers/**/*.rb` - Controller specifications

### Models and Services
- `app/models/**/*.rb` - Active Record models
- `app/services/**/*.rb` - Business logic services
- `spec/models/**/*.rb` - Model specifications
- `spec/services/**/*.rb` - Service specifications

### Background Processing
- `app/jobs/**/*.rb` - Sidekiq background jobs
- `app/channels/**/*.rb` - ActionCable channels
- `spec/jobs/**/*.rb` - Job specifications
- `spec/channels/**/*.rb` - Channel specifications

## Implementation Notes

- **Assumption**: Controllers are working correctly; update specs to match behavior
- **Backward Compatibility**: Maintain v1 API functionality for legacy client
- **Forward Compatibility**: Ensure v2 API specs match shot-client-next expectations
- **Performance**: Monitor test suite execution time and optimize slow specs
- **Patterns**: Use consistent testing patterns and shared examples where appropriate

## Estimated Effort

**High Priority** - The backend test suite is critical for maintaining API reliability across both legacy and current frontend clients. Complete RSpec test coverage provides essential safety net for backend development and deployment.