# Combat Action API Refactoring Technical Specification

## Problem Statement

The current encounter management system uses multiple API calls and successive WebSocket broadcasts for combat actions, causing UI "jumping" issues where the interface updates multiple times in rapid succession. This creates a poor user experience during real-time combat resolution.

### Current Issues
- Multiple API endpoints for single combat action (attack → defense → damage → broadcast)
- Successive WebSocket updates cause UI to jump between states
- Race conditions between client state and server updates
- Inconsistent validation between frontend calculations and backend application
- Difficulty maintaining synchronized state across multiple connected clients

## Solution Overview

Implement a unified combat action API that accepts complete action descriptions and resulting character states in a single request. The client calculates all state changes locally, sends both the action narrative and final states, and the backend validates and applies changes atomically with a single WebSocket broadcast.

## Technical Architecture

### New API Endpoint Structure

#### Unified Combat Action Endpoint
```
POST /api/v2/encounters/:id/combat_action
```

#### Request Format
```json
{
  "action": {
    "type": "multi_attack",
    "attacker_id": "char_456_attacker",
    "shots_spent": 3,
    "fortune_spent": 1,
    "targets": [
      {
        "character_id": "char_012_defender_b",
        "defense_choice": "fortune",
        "fortune_spent": 1,
        "fortune_die_result": 2,
        "wounds_dealt": 6
      },
      {
        "character_id": "char_678_defender_c", 
        "defense_choice": "dodge",
        "wounds_dealt": 8
      },
      {
        "character_id": "char_890_defender_d",
        "wounds_dealt": 15
      }
    ]
  },
  "character_states": {
    "char_456_attacker": {
      "shot": 12,
      "fortune": 2
    },
    "char_012_defender_b": {
      "shot": 11,
      "fortune": 1,
      "wounds": 6,
      "impairments": 0
    },
    "char_678_defender_c": {
      "shot": 9,
      "wounds": 8,
      "impairments": 0
    },
    "char_890_defender_d": {
      "shot": 10,
      "wounds": 15,
      "impairments": 1
    }
  }
}
```

### API Schema Definitions

#### Action Schema
```typescript
interface CombatAction {
  type: 'attack' | 'multi_attack' | 'boost' | 'reload' | 'dodge' | 'custom';
  attacker_id: string;
  shots_spent: number;
  fortune_spent?: number;
  weapon_id?: string;
  weapon_attributes_used?: {
    mook_bonus?: boolean;
    ka_chunk?: boolean;
  };
  targets?: CombatTarget[];
  boost_type?: 'attack' | 'defense';
  boost_target_id?: string;
  description?: string;
}

interface CombatTarget {
  character_id: string;
  defense_choice?: 'dodge' | 'fortune' | null;
  fortune_spent?: number;
  fortune_die_result?: number;
  wounds_dealt: number;
  effects_applied?: string[];
}
```

#### Character State Schema
```typescript
interface CharacterState {
  shot: number;
  fortune?: number;
  wounds?: number;
  impairments?: number;
  active_effects?: string[];
  boost_effects?: BoostEffect[];
}

interface BoostEffect {
  type: 'attack' | 'defense';
  value: number;
  expires_at_shot: number;
  source_character_id: string;
}
```

### Backend Implementation

#### Controller Logic
```ruby
# app/controllers/api/v2/encounters_controller.rb
class Api::V2::EncountersController < ApplicationController
  def combat_action
    result = CombatActionService.new(
      fight: @fight,
      action: action_params,
      character_states: character_states_params,
      current_user: current_user
    ).execute

    if result.success?
      render json: {
        success: true,
        fight_event: result.fight_event,
        updated_characters: result.updated_characters
      }
    else
      render json: {
        success: false,
        errors: result.errors
      }, status: :unprocessable_entity
    end
  end

  private

  def action_params
    params.require(:action).permit(
      :type, :attacker_id, :shots_spent, :fortune_spent,
      :weapon_id, :boost_type, :boost_target_id, :description,
      weapon_attributes_used: [:mook_bonus, :ka_chunk],
      targets: [
        :character_id, :defense_choice, :fortune_spent,
        :fortune_die_result, :wounds_dealt, effects_applied: []
      ]
    )
  end

  def character_states_params
    params.require(:character_states).permit!.to_h
  end
end
```

#### Service Implementation
```ruby
# app/services/combat_action_service.rb
class CombatActionService
  include ActiveModel::Model
  
  attr_accessor :fight, :action, :character_states, :current_user
  
  def execute
    ActiveRecord::Base.transaction do
      validate_action!
      validate_character_states!
      
      # Apply all character state changes
      updated_characters = apply_character_states!
      
      # Create fight event record
      fight_event = create_fight_event!
      
      # Single WebSocket broadcast with all changes
      broadcast_combat_update!(fight_event, updated_characters)
      
      OpenStruct.new(
        success?: true,
        fight_event: fight_event,
        updated_characters: updated_characters
      )
    end
  rescue ValidationError => e
    OpenStruct.new(
      success?: false,
      errors: e.message
    )
  end

  private

  def validate_action!
    # Validate action type is supported
    # Validate attacker exists and can act
    # Validate targets exist and are valid
    # Validate shots_spent is reasonable
    # Validate weapon attributes are valid for weapon
    # Validate boost target is not self (for boost actions)
  end

  def validate_character_states!
    character_states.each do |character_id, new_state|
      current_state = get_current_character_state(character_id)
      
      # Validate state changes are within reasonable bounds
      validate_shot_change(current_state, new_state)
      validate_wound_change(current_state, new_state)
      validate_fortune_change(current_state, new_state)
      validate_impairment_calculation(new_state)
    end
  end

  def apply_character_states!
    updated_characters = []
    
    character_states.each do |character_id, new_state|
      character = Character.find(character_id)
      shot = character.current_shot_in_fight(fight)
      
      # Update character/shot with new state
      if new_state['shot'].present?
        shot.update!(shot: new_state['shot'])
      end
      
      if new_state['wounds'].present?
        character.update!(wounds: new_state['wounds'])
      end
      
      if new_state['fortune'].present?
        character.update!(fortune: new_state['fortune'])
      end
      
      # Apply boost effects if present
      apply_boost_effects(character, new_state['boost_effects']) if new_state['boost_effects']
      
      updated_characters << character.reload
    end
    
    updated_characters
  end

  def create_fight_event!
    FightEvent.create!(
      fight: fight,
      event_type: action['type'],
      event_data: {
        action: action,
        character_states: character_states,
        timestamp: Time.current
      },
      user: current_user
    )
  end

  def broadcast_combat_update!(fight_event, updated_characters)
    # Single broadcast with complete state change
    ActionCable.server.broadcast(
      "fight_#{fight.id}",
      {
        type: 'combat_action_complete',
        fight_event: FightEventSerializer.new(fight_event).as_json,
        updated_characters: updated_characters.map { |char|
          CharacterCombatSerializer.new(char, context: { fight: fight }).as_json
        }
      }
    )
  end
end
```

### Frontend Integration

#### Client-Side State Calculation
```typescript
// src/services/CombatCalculationService.ts
export class CombatCalculationService {
  static calculateCombatAction(
    action: CombatActionInput,
    currentFightState: FightState
  ): CombatActionRequest {
    const characterStates: Record<string, CharacterState> = {};
    
    // Calculate attacker state changes
    const attacker = currentFightState.characters.find(c => c.id === action.attacker_id);
    if (attacker) {
      characterStates[attacker.id] = {
        shot: attacker.current_shot - action.shots_spent,
        fortune: attacker.fortune - (action.fortune_spent || 0)
      };
    }
    
    // Calculate target state changes
    action.targets?.forEach(target => {
      const targetChar = currentFightState.characters.find(c => c.id === target.character_id);
      if (targetChar) {
        const newWounds = targetChar.wounds + target.wounds_dealt;
        const newImpairments = this.calculateImpairments(newWounds, targetChar.type);
        
        characterStates[target.character_id] = {
          shot: targetChar.current_shot - this.getDefenseCost(target.defense_choice),
          fortune: targetChar.fortune - (target.fortune_spent || 0),
          wounds: newWounds,
          impairments: newImpairments
        };
      }
    });
    
    return {
      action,
      character_states: characterStates
    };
  }
  
  private static calculateImpairments(wounds: number, characterType: string): number {
    if (characterType === 'mook') return 0;
    if (wounds < 30) return 0;
    if (wounds < 35) return 1;
    return 2;
  }
  
  private static getDefenseCost(defenseChoice?: string): number {
    switch (defenseChoice) {
      case 'dodge':
      case 'fortune':
        return 1;
      default:
        return 0;
    }
  }
}
```

#### API Client Integration
```typescript
// src/lib/ApiV2.ts
export class ApiV2Client {
  async executeCombatAction(
    encounterId: string, 
    combatAction: CombatActionRequest
  ): Promise<CombatActionResponse> {
    const response = await this.post(
      `/encounters/${encounterId}/combat_action`,
      combatAction
    );
    
    return response.data;
  }
}
```

### WebSocket Event Structure

#### Single Broadcast Event
```typescript
interface CombatActionCompleteEvent {
  type: 'combat_action_complete';
  fight_event: {
    id: string;
    event_type: string;
    event_data: {
      action: CombatAction;
      character_states: Record<string, CharacterState>;
      timestamp: string;
    };
  };
  updated_characters: CharacterCombatState[];
}
```

### Validation Logic

#### Backend Validation Rules
1. **Action Validation**
   - Attacker must exist in fight and be able to act (shot >= action cost)
   - Targets must exist in fight and be valid for action type
   - Weapon attributes must match equipped weapon capabilities
   - Shot costs must be reasonable (3 for attacks, 1 for dodge, 3 for boost)

2. **State Change Validation**
   - Shot changes must not exceed reasonable bounds (-10 to +5 from current)
   - Wound changes must be non-negative increases
   - Fortune changes must not exceed character's current fortune
   - Impairment calculations must match wound thresholds

3. **Business Logic Validation**
   - Boost actions cannot target self
   - Mook characters cannot have > 0 wounds (they're defeated at 1+ wound)
   - Character types must have appropriate wound thresholds

### Error Handling

#### Validation Errors
```json
{
  "success": false,
  "errors": {
    "action": ["Attacker does not have sufficient shots"],
    "character_states": {
      "char_123": ["Wound increase exceeds reasonable damage"],
      "char_456": ["Fortune reduction exceeds available points"]
    }
  }
}
```

#### Conflict Resolution
- If validation fails, no changes are applied (transaction rollback)
- Client receives error response with specific validation messages
- Client can retry with corrected calculations
- Current state is preserved for all connected clients

### Migration Strategy

#### Phase 1: Add New Endpoint
- Implement new `combat_action` endpoint alongside existing endpoints
- Create `CombatActionService` with full validation and atomic updates
- Add new WebSocket event type for complete action updates

#### Phase 2: Frontend Integration
- Update combat UI to use new calculation service
- Implement optimistic updates with new API structure
- Add error handling for validation failures

#### Phase 3: Deprecate Old Endpoints
- Remove individual attack/damage/boost endpoints
- Clean up old WebSocket event handlers
- Remove redundant state management code

### Testing Strategy

#### Unit Tests
```ruby
# spec/services/combat_action_service_spec.rb
RSpec.describe CombatActionService do
  describe '#execute' do
    context 'with valid multi-attack action' do
      it 'applies all character state changes atomically'
      it 'creates single fight event record'
      it 'broadcasts single WebSocket update'
      it 'validates state changes match action description'
    end
    
    context 'with invalid state changes' do
      it 'rejects excessive wound increases'
      it 'rejects negative fortune changes'
      it 'rejects invalid shot calculations'
    end
  end
end
```

#### Integration Tests
```javascript
// test-scripts/test-combat-action-api.js
describe('Combat Action API', () => {
  test('multi-attack with mixed defenses', async () => {
    // Setup fight state
    // Calculate expected state changes
    // Send combat action request
    // Verify single WebSocket broadcast
    // Verify final character states
  });
  
  test('validation error handling', async () => {
    // Send invalid combat action
    // Verify error response
    // Verify no state changes applied
    // Verify no WebSocket broadcast
  });
});
```

## Performance Considerations

### Database Optimization
- Use single transaction for all state changes
- Batch character/shot updates where possible
- Index fight_id and character_id columns for fast lookups

### WebSocket Efficiency
- Single broadcast per action (vs. multiple successive broadcasts)
- Include complete state in broadcast to avoid client-side API calls
- Use efficient serialization for character combat states

### Client-Side Optimization
- Optimistic updates using calculated states
- Debounce rapid action submissions
- Cache fight state locally to avoid repeated API calls

## Security Considerations

### Authorization
- Verify user has GM access to fight for destructive actions
- Validate player can only affect their own character (for player actions)
- Ensure action originates from valid fight participant

### Input Validation
- Sanitize all action parameters
- Validate character IDs exist in current fight
- Prevent unreasonable state changes that could break game balance

### Rate Limiting
- Limit combat actions per user per minute
- Prevent spam submissions during active combat
- Implement cooldown for failed validation attempts

## Benefits of New Architecture

### User Experience
- **Eliminates UI jumping**: Single state update instead of multiple successive changes
- **Faster response**: Optimistic updates with validation, not waiting for multiple API calls
- **Consistent state**: All clients receive same complete state change simultaneously
- **Better error handling**: Clear validation feedback with no partial state corruption

### Technical Benefits
- **Atomic operations**: All-or-nothing state changes prevent inconsistent game state
- **Reduced complexity**: Single API call instead of orchestrating multiple endpoints
- **Better testing**: Complete action can be tested as single unit
- **Cleaner code**: Centralized combat logic instead of scattered across multiple controllers

### Maintainability
- **Single source of truth**: Combat calculations centralized in service layer
- **Easier debugging**: Complete action context in single request/response
- **Simplified WebSocket logic**: One event type for all combat actions
- **Clear separation**: Client handles UI/calculations, server handles validation/persistence

## Implementation Timeline

### Week 1: Backend Foundation
- Create `CombatActionService` with full validation logic
- Implement new `combat_action` API endpoint
- Add comprehensive unit tests for service layer
- Set up new WebSocket event structure

### Week 2: Frontend Integration
- Create `CombatCalculationService` for client-side state calculation
- Update combat UI components to use new API structure
- Implement optimistic updates and error handling
- Add integration tests for complete combat flow

### Week 3: Testing and Refinement
- Comprehensive end-to-end testing with Playwright
- Performance testing with multiple concurrent actions
- Mobile testing for responsive combat interface
- Bug fixes and UI polish based on testing results

### Week 4: Migration and Cleanup
- Deploy new API alongside existing endpoints
- Migrate all combat actions to new structure
- Remove deprecated endpoints and WebSocket handlers
- Documentation updates and final testing

This refactoring provides a solid foundation for the encounter manager's combat system while eliminating the UI jumping issues and providing better user experience for real-time tabletop gaming.