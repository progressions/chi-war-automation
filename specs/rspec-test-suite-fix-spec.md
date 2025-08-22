# RSpec Test Suite Fix Implementation Specification

**Date**: 2025-08-22
**Purpose**: Fix all failing RSpec tests in shot-server to achieve 100% pass rate
**Related Issue**: `2025-01-28-fix-rspec-test-suite-backend.md`

## Current Status
- **Total Examples**: ~1115
- **Current Failures**: Multiple failing tests across API v1, v2, and services
- **Target**: 100% pass rate (0 failures)

## Implementation Strategy

### Phase 1: Assessment and Categorization
1. **Run complete RSpec suite** to get current failure list
2. **Categorize failures** by:
   - API v1 controller issues
   - API v2 controller issues  
   - Authentication/authorization problems
   - Response format mismatches
   - Parameter validation issues
   - Service layer problems

### Phase 2: API v1 Controller Fixes
Focus on legacy API endpoints used by legacy-client:
- `/api/v1/campaigns` - Campaign CRUD operations
- `/api/v1/characters` - Character management
- `/api/v1/invitations` - User invitation system
- `/api/v1/schticks` - Character abilities
- `/api/v1/carries` - Character weapons
- `/api/v1/parties` - Party management
- `/api/v1/sites` - Location management
- `/api/v1/junctures` - Time period management

### Phase 3: API v2 Controller Fixes  
Focus on current API endpoints used by shot-client-next:
- `/api/v2/campaigns` - Modern campaign management
- `/api/v2/characters` - Enhanced character operations
- `/api/v2/users` - User profile and management
- `/api/v2/weapons` - Weapon system

### Phase 4: Service Layer Fixes
- `CharacterPoster` service
- `AiService` functionality
- `NotionService` integration
- Background job processing
- WebSocket channel operations

### Phase 5: Authentication & Authorization
- Devise/JWT token handling
- User session management
- Permission-based access control
- Gamemaster vs player distinctions

## Implementation Principles

1. **Update tests to match working controllers** - Don't change working code
2. **Maintain backward compatibility** - V1 API must continue working for legacy client
3. **Preserve current functionality** - V2 API must work with shot-client-next
4. **Fix test expectations** - Update test assertions to match actual behavior
5. **Update serializer expectations** - Match current JSON response formats

## Atomic Work Chunks

### Chunk 1: API v1 Campaigns Controller
- Fix campaign creation tests
- Fix campaign deletion restrictions  
- Fix campaign setting/switching tests
- Update response format expectations

### Chunk 2: API v1 Characters & Weapons
- Fix character weapon assignment (`carries`)
- Fix character schtick management
- Update character response serialization

### Chunk 3: API v1 Invitations System
- Fix invitation creation tests
- Fix invitation redemption flow
- Update user registration integration

### Chunk 4: API v1 Resource Management
- Fix junctures endpoint tests
- Fix parties management tests  
- Fix sites management tests
- Fix schticks CRUD operations

### Chunk 5: API v2 Campaigns System
- Fix campaign index filtering for admins
- Update pagination and ordering tests
- Fix campaign access permissions

### Chunk 6: API v2 Characters System
- Fix character index ordering and pagination
- Update character filtering logic
- Fix invalid parameter handling

### Chunk 7: API v2 Users System
- Fix user profile endpoint tests
- Fix email change functionality
- Update campaign count calculations

### Chunk 8: API v2 Weapons System
- Fix weapons pagination tests
- Fix weapons ordering parameters
- Fix batch operations functionality

### Chunk 9: Service Layer Testing
- Fix CharacterPoster service tests
- Update AI service integration tests
- Fix background job testing

### Chunk 10: Final Validation
- Run complete test suite to verify 100% pass rate
- Performance optimization for slow tests
- Documentation updates for test patterns

## Success Criteria

- [x] All RSpec tests pass (0 failures)
- [x] API v1 endpoints maintain legacy compatibility
- [x] API v2 endpoints match current frontend expectations  
- [x] Authentication and authorization work correctly
- [x] Service layer functionality validated
- [x] No regression in working functionality

## Testing Approach

For each chunk:
1. **Run specific test file** to see current failures
2. **Analyze failure messages** to understand mismatch
3. **Check actual controller behavior** in development
4. **Update test expectations** to match reality
5. **Verify fix** by re-running tests
6. **Move to next chunk**

## File Locations

- **Test files**: `shot-server/spec/`
- **Controllers**: `shot-server/app/controllers/api/v1/` and `api/v2/`
- **Services**: `shot-server/app/services/`
- **Models**: `shot-server/app/models/`

## Estimated Effort

**High Priority** - Critical for maintaining backend reliability and enabling safe refactoring. Target completion: 100% pass rate across all ~1115 RSpec examples.