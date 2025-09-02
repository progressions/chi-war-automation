# Boost Actions Specification

## Overview

Boost actions are a teamwork mechanic in Feng Shui 2 that allows player characters to support each other in combat by providing temporary bonuses to attack or defense capabilities.

## Core Mechanics

### Action Cost
- **3 shots** to perform a boost action
- Same cost as a standard attack or active dodge
- Can only boost if character has shots available (current shot >= 3)

### Boost Types

#### Attack Boost
- **Base Effect**: Target gains +1 to their next attack roll
- **With Fortune Die**: Target gains +2 to their next attack roll
- **Duration**: Applies to the very next attack the target makes
- **Expiration**: Boost is consumed and removed after target's next attack

#### Defense Boost  
- **Base Effect**: Target gains +3 to Defense Value
- **With Fortune Die**: Target gains +5 to Defense Value
- **Duration**: Applies to ALL attacks against the target in their next shot
- **Expiration**: Boost is consumed and removed after target's next shot (when they act)

### Fortune Die Enhancement
- **Player Choice**: The boosting player can choose to spend a Fortune point for enhanced effects
- **Attack Boost**: +1 becomes +2
- **Defense Boost**: +3 becomes +5
- **Cost**: 1 Fortune point from the boosting character's pool
- **UI**: Checkbox or toggle to activate Fortune die enhancement

## Technical Implementation

### Database Schema

#### Boost Tracking Fields
Add to both Shot and Character models for consistent tracking:

```ruby
# Migration for boost tracking
class AddBoostTrackingToShots < ActiveRecord::Migration[8.0]
  def change
    add_column :shots, :active_attack_boost, :integer, default: 0
    add_column :shots, :active_defense_boost, :integer, default: 0
    add_column :shots, :boost_expires_at_shot, :integer, null: true
    add_column :shots, :boost_source_character_id, :uuid, null: true
  end
end

class AddBoostTrackingToCharacters < ActiveRecord::Migration[8.0]
  def change
    add_column :characters, :active_attack_boost, :integer, default: 0
    add_column :characters, :active_defense_boost, :integer, default: 0
    add_column :characters, :boost_expires_at_shot, :integer, null: true
    add_column :characters, :boost_source_character_id, :uuid, null: true
  end
end
```

#### Combat Action Logging
Extend CombatAction model to track boost actions:

```ruby
class CombatAction < ApplicationRecord
  # Add boost-specific fields to existing model
  # action_type can be 'boost_attack' or 'boost_defense'
  # target_shot_id references the character receiving the boost
  # modifiers JSON can include:
  # {
  #   boost_type: 'attack' | 'defense',
  #   boost_value: 1 | 2 | 3 | 5,
  #   fortune_die_used: true | false,
  #   expires_at_shot: integer
  # }
end
```

### API Endpoints

#### Boost Action Endpoint
```ruby
# POST /api/v2/encounters/:id/boost_action
# Parameters:
{
  boosting_shot_id: uuid,        # Character performing the boost
  target_shot_id: uuid,          # Character receiving the boost  
  boost_type: 'attack' | 'defense',
  use_fortune_die: boolean,      # Optional Fortune die enhancement
  shot_cost: 3                   # Always 3 for boost actions
}

# Response:
{
  success: boolean,
  boost_applied: {
    target_character: character_data,
    boost_type: string,
    boost_value: integer,
    expires_at_shot: integer,
    fortune_die_used: boolean
  },
  updated_shots: [shot_data],     # Including boosting character's new shot
  error_message: string           # If validation fails
}
```

#### Boost Expiration Logic
```ruby
# Service class for boost management
class BoostExpirationService
  def self.expire_boosts_for_character(character_or_shot, current_shot)
    # Check if character's boosts should expire based on current shot
    # Remove expired boosts and broadcast updates
  end
  
  def self.expire_attack_boost_after_attack(character_or_shot)
    # Remove attack boost after character makes an attack
  end
  
  def self.expire_defense_boost_after_shot(character_or_shot)
    # Remove defense boost after character's shot ends
  end
end
```

### Frontend Components

#### BoostPanel Component
```typescript
interface BoostPanelProps {
  fightId: string;
  currentShot: number;
  availableCharacters: Character[];
  onBoostApplied: (result: BoostResult) => void;
  onClose: () => void;
}

interface BoostFormData {
  boostingCharacterId: string;
  targetCharacterId: string;
  boostType: 'attack' | 'defense';
  useFortuneDie: boolean;
}
```

#### Boost Status Display
```typescript
// Component for displaying active boosts on character cards
interface BoostIndicatorProps {
  character: Character;
  activeBoosts: {
    attack_boost?: number;
    defense_boost?: number;
    expires_at_shot?: number;
  };
}

// Example rendering:
// [+2 ATK] (expires shot 11)
// [+5 DEF] (expires shot 8)
```

### UI/UX Design

#### Boost Panel Interface
```
┌─────────────────────────────────────────────┐
│             BOOST ACTION                    │
├─────────────────────────────────────────────┤
│ Boosting Character:                         │
│ [Select Character ▼] (must be at current shot)
│   • Jake "Ace" Chen (Shot 14) - Available  │
│   • Sister Mary (Shot 14) - Available      │
│   • Tommy Two-Guns (Shot 11) - Not current │
│                                             │
│ Target Character:                           │
│ [Select Target ▼]                           │
│   • Jake "Ace" Chen                         │
│   • Sister Mary                             │
│   • Tommy Two-Guns [+1 ATK expires shot 8] │
│   • Big Bruiser (Enemy)                     │
│                                             │
│ Boost Type:                                 │
│   ● Attack Boost (+1 to next attack)       │
│   ○ Defense Boost (+3 DV for next shot)    │
│                                             │
│ Enhancement:                                │
│   □ Use Fortune Die (Attack: +2, Def: +5)  │
│   Fortune Points: 3 remaining               │
│                                             │
│ Cost: 3 shots (Current: 14 → 11)          │
│                                             │
│ [Apply Boost] [Cancel]                      │
└─────────────────────────────────────────────┘
```

#### Character Card Boost Display
```
┌─────────────────────────────────────────────┐
│ Jake "Ace" Chen [15 Wounds] [+2 ATK]        │
│ Shot 14 | Guns 15 (-1) = 14 | Defense 13   │
│ Boost expires: Next attack                  │
├─────────────────────────────────────────────┤
│ [Attack] [Boost] [Act -3] [Hide] [Remove]  │
└─────────────────────────────────────────────┘
```

#### Attack Panel Boost Integration
```
Attack Value Calculation:
Base Guns: 13
Impairment: -1  
Active Boost: +2 (Fortune)
────────────────
Total AV: 14

Defense Value Calculation:
Base Defense: 13
Impairment: -0
Active Boost: +5 (Fortune)
Stunt Bonus: +2
────────────────
Total DV: 20
```

### Validation Rules

#### Boost Action Validation
- Boosting character must be at current shot
- Boosting character must have >= 3 shots available
- Target character must be in the fight (not hidden)
- Cannot boost yourself
- Cannot stack multiple boosts of same type on one character
- Fortune die enhancement requires available Fortune points

#### Boost Expiration Rules
- **Attack Boost**: Expires after target makes ANY attack action
- **Defense Boost**: Expires after target's next shot (when shot counter advances past their current value)
- **Shot Advance**: If boost expires due to shot advancement, log in combat log
- **Manual Removal**: GM can manually remove boosts if needed

### Combat Integration

#### Attack Resolution
1. Calculate base Attack Value from character skill
2. Apply impairment penalty
3. Add active attack boost (if any)
4. Add weapon bonuses (mook bonus, ka-chunk)
5. Add manual overrides
6. **After attack**: Remove attack boost and log expiration

#### Defense Resolution
1. Calculate base Defense Value from character
2. Apply impairment penalty  
3. Add active defense boost (if any)
4. Add situational modifiers (dodge, stunt)
5. Add manual overrides
6. **Defense boost persists** until character's next shot

#### Real-time Updates
- Broadcast boost application immediately
- Update character cards with boost indicators
- Notify all players of boost effects
- Alert when boosts expire
- Include boost effects in all attack/defense calculations

### Player Experience

#### Mobile Interface
- Large, touch-friendly boost buttons
- Clear target selection with portraits
- Visual feedback for boost application
- Countdown timers for boost expiration
- Integration with personal action panel

#### GM Interface  
- Quick boost application from character cards
- Bulk boost management tools
- Override/remove boost capabilities
- Combat log integration for boost tracking
- Statistics tracking for boost usage

### Strategic Considerations

#### Tactical Usage
- **Attack Boosts**: Best used before important attacks or when character has low attack value
- **Defense Boosts**: Ideal for protecting wounded characters or preparing for big enemy attacks
- **Fortune Enhancement**: Reserve for critical moments or high-stakes situations
- **Timing**: Coordinate boosts with initiative order for maximum effectiveness

#### Balance Implications
- 3-shot cost prevents spam while allowing meaningful tactical choices
- Limited duration prevents stacking and overpowered combinations
- Fortune die cost adds resource management element
- Cannot boost yourself prevents overpowered self-sufficiency

This boost action system adds tactical depth to Feng Shui 2 combat while maintaining the fast-paced, cinematic feel of the game system.