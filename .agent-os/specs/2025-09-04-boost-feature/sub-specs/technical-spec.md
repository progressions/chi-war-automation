# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-04-boost-feature/spec.md

> Created: 2025-09-04
> Version: 1.0.0

## Technical Requirements

### Database Integration

**CharacterEffect Model Usage:**
- No model modifications needed - existing CharacterEffect model is sufficient
- Create CharacterEffect records with appropriate stat modifications:
  - Attack boost: Set `attack` field to +1 or +2
  - Defense boost: Set `defense` field to +3 or +5
- Use existing fields for tracking boost state
- Leverage existing expiration and consumption logic

### Backend Implementation

**Controller Integration:**
- Extend `Api::V2::EncountersController#combat_action_update` endpoint
- Add `:boost` action type to existing combat action handler
- Leverage existing atomic transaction pattern for all character updates
- Ensure single WebSocket broadcast for entire boost action

**Service Layer:**
- Extend `CombatService` or create `BoostService` following existing patterns
- Handle boost action within database transaction block:
  - Deduct 3 shots from boosting character
  - Spend Fortune point if enhancement requested (PC only)
  - Create CharacterEffect record for target
- Return consolidated update for single WebSocket broadcast
- Follow existing combat action update patterns

**CharacterEffect Integration:**
- Use existing CharacterEffect model without modifications
- Set appropriate stat modifiers (attack or defense fields)
- No expiration logic needed - effects persist as configured
- No serializer changes needed - existing serializers handle stat modifiers

### Frontend Implementation

**Component Architecture:**
- Create `BoostPanel` component mirroring `AttackPanel` structure
- Implement `BoostTargetSelector` for ally selection
- Add `FortuneEnhancementOption` button for PC boost enhancement (no die roll input needed)
- Leverage existing CharacterEffect display system for boost visualization

**State Management:**
- Extend fight context to include boost state management
- Add boost-related hooks for data fetching and mutations
- Implement optimistic updates for boost actions
- Handle real-time boost updates via WebSocket subscriptions

**UI/UX Requirements:**
- Follow Material-UI design patterns consistent with existing panels
- Show Fortune die cost/availability clearly for enhancement options
- Implement loading states during boost action processing
- Boost effects automatically displayed via existing CharacterEffect UI
- No additional visual components needed for effect display

### Real-time Integration

**WebSocket Channels:**
- Extend `FightChannel` to broadcast boost-related events
- Add boost creation/resolution event types
- Ensure all fight participants receive boost updates
- Handle boost effect expiration broadcasts

**Event Types:**
- `boost_applied`: When a character receives a boost
- `boost_enhanced`: When Fortune die is used to enhance
- `boost_consumed`: When boost effect is used up
- `character_effects_updated`: General effect state changes

## Approach

### Development Phases

**Phase 1: Backend Foundation**
1. Extend combat_action_update endpoint to handle boost actions
2. Implement boost logic in CombatService or new BoostService
3. Create CharacterEffects with appropriate stat modifiers
4. Ensure atomic transaction for all updates
5. Write comprehensive service and controller tests

**Phase 2: Frontend Implementation**
1. Create BoostPanel component with target selection
2. Implement boost action triggers and API integration
3. Add visual indicators for active boost effects
4. Integrate with existing fight UI and state management
5. Add client-side validation and error handling

**Phase 3: Real-time Integration**
1. Extend WebSocket channels for boost events
2. Implement real-time boost status updates
3. Add optimistic UI updates with fallback handling
4. Test multiplayer boost scenarios thoroughly
5. Ensure proper state synchronization

**Phase 4: Testing and Polish**
1. Write comprehensive E2E tests using Playwright
2. Test all boost scenarios including edge cases
3. Validate Fortune die consumption mechanics
4. Perform UI/UX testing for usability
5. Document boost feature usage and mechanics

### Implementation Patterns

**Following Existing Conventions:**
- Mirror AttackPanel component structure and styling
- Use established API patterns from V2 endpoints
- Follow existing service layer architecture
- Maintain consistent error handling and validation
- Use standard Material-UI components and theming

**Code Organization:**
- Backend services in `app/services/boost_service.rb`
- Frontend components in `src/components/fights/boost/`
- API endpoints following RESTful resource patterns
- Database migrations with proper rollback support
- Test files organized by functionality and layer

## External Dependencies

### Existing System Integration

**Required Systems:**
- CharacterEffect model and database table
- Fight management system with shot counters
- Character selection and authorization systems
- WebSocket infrastructure for real-time updates
- Material-UI component library for consistent styling

**API Dependencies:**
- `/api/v2/characters` for target selection
- `/api/v2/fights/{id}/shots` for shot counter integration
- `/api/v2/character_effects` for boost effect management
- WebSocket channels for real-time fight updates

### No New External Dependencies

The boost feature leverages existing infrastructure and does not require additional external services, APIs, or third-party integrations. All functionality builds upon the current tech stack including Rails, Next.js, PostgreSQL, Redis, and Action Cable.