# Encounter Manager Implementation Tasks

> Created: 2025-08-31
> Status: In Progress - Phase 1 Largely Complete (75%)
> Size: XL (4-6 weeks)

## Overview

Implement a comprehensive encounter management system for running Feng Shui 2 tabletop RPG sessions. This is a GM helper tool that supports physical dice and manual overrides, not an automated video game.

## Phase 1: Attack & Damage System (Week 1)

### Task 1.1: Backend Attack Resolution API
- [ ] Create `POST /api/v2/encounters/:id/attack` endpoint
  - Accept attacker_shot_id, target_shot_id, attack_type, attack_value, defense_value
  - **Accept weapon_id and weapon attribute parameters**:
    - Include mook_bonus when target is mook-type character
    - Include ka_chunk_bonus when player opts to spend extra shot
    - Calculate total attack value including weapon bonuses
  - Support manual overrides for all values
  - Handle dodge action (spend 1 shot, +3 DV)
  - Handle stunt modifier (+2 DV)
  - **Automatically factor in attacker and target impairment levels**
  - **Include active boost effects in attack/defense calculations**
  - Return calculated suggestions but don't auto-apply
- [ ] Create `POST /api/v2/encounters/:id/apply_damage` endpoint
  - Accept shot_id, damage_amount, source description
  - Update wounds based on character type (PC wounds on Character, NPC wounds on Shot)
  - Calculate and apply impairment based on character type
  - **Trigger impairment recalculation and UI updates**
  - Broadcast updates via ActionCable
- [ ] Create `POST /api/v2/encounters/:id/boost_action` endpoint
  - Accept boosting_shot_id, target_shot_id, boost_type (attack/defense)
  - Track boost expiration (1 shot for target's next action)
  - Include Fortune die option (+1 attack boost or +2 defense boost)
  - Apply 3-shot cost to boosting character
  - Broadcast boost status to all clients
- [ ] Create CombatAction model for attack history logging
  - **Include weapon attributes used in attack record**
  - Track mook_bonus and ka_chunk usage for combat statistics
  - Track boost actions and their effects
  - **Record impairment levels at time of action**
- [ ] Add boost tracking to Shot/Character models
  - Add active_attack_boost and active_defense_boost fields
  - Track boost expiration (remove after next relevant action)
  - Include boost values in attack/defense calculations

**Note**: Removed requirement for wounds column on shots table - current architecture correctly stores PC wounds on Character records and NPC wounds on Shot records.

### Task 1.2: Attack Interface Component ✅ COMPLETE
- [x] ~~Create `AttackPanel.tsx` component with Material-UI~~ **COMPLETE** - AttackPanel component implemented with comprehensive attack resolution interface
  - [x] ~~Attacker selection dropdown (characters at current shot)~~ **COMPLETE**
  - [x] ~~Attack skill radio buttons with override text fields~~ **COMPLETE**
  - [x] ~~Weapon selection dropdown with damage override~~ **COMPLETE**
  - [x] ~~**Weapon attribute display and integration**:~~ **COMPLETE**
    - [x] ~~**Mook Bonus**: Display and apply bonus to attack rolls when attacking mook-type characters~~ **COMPLETE**
    - [x] ~~**Ka-chunk**: Display option to spend extra shot for attack bonus, with checkbox/toggle~~ **COMPLETE**
    - [x] ~~Show weapon attributes clearly in weapon selection dropdown~~ **COMPLETE**
    - [x] ~~Apply attribute bonuses to attack calculation automatically~~ **COMPLETE**
    - [x] ~~Allow manual override of all weapon-based bonuses~~ **COMPLETE**
  - [x] ~~Stunt checkbox (+2 DV modifier)~~ **COMPLETE**
  - [x] ~~Target selection with current defense values~~ **COMPLETE**
  - [x] ~~**CRITICAL: Impairment display and calculation**:~~ **COMPLETE**
    - [x] ~~**Show attacker's impairment level prominently with color-coded indicator**~~ **COMPLETE**
    - [x] ~~**Display base Attack Value and adjusted value (AV - impairment)**~~ **COMPLETE**
    - [x] ~~**Show target's impairment level and adjusted Defense Value**~~ **COMPLETE**
    - [x] ~~**Use clear format: "AV 15 (-1) = 14" for impaired values**~~ **COMPLETE**
    - [x] ~~**Color-code impairment indicators: green (0), yellow (1), red (2+)**~~ **COMPLETE**
    - [x] ~~**Real-time updates when wounds change during combat**~~ **COMPLETE**
  - [x] ~~**Active boost integration**:~~ **COMPLETE**
    - [x] ~~**Display active attack boosts on attacker (+1 or +2)**~~ **COMPLETE**
    - [x] ~~**Display active defense boosts on target (+3 or +5)**~~ **COMPLETE**
    - [x] ~~**Include boost values in final calculation breakdown**~~ **COMPLETE**
    - [x] ~~**Show boost expiration timing**~~ **COMPLETE**
- [x] ~~Implement dodge action button~~ **COMPLETE**
  - [x] ~~Quick action to spend 1 shot for +3 Defense~~ **COMPLETE**
  - [x] ~~Update shot value and defense in real-time~~ **COMPLETE**
- [x] ~~Add physical dice support~~ **COMPLETE**
  - [x] ~~Text field for entering Swerve from table dice~~ **COMPLETE**
  - [x] ~~Optional digital dice roller component~~ **COMPLETE**
  - [x] ~~Direct entry option for final results~~ **COMPLETE**
- [x] ~~Create damage calculation display~~ **COMPLETE**
  - [x] ~~Show suggested damage with formula~~ **COMPLETE**
  - [x] ~~Include weapon attribute bonuses in damage calculation~~ **COMPLETE**
  - [x] ~~Manual override field for final damage~~ **COMPLETE**
  - [x] ~~Apply button with confirmation~~ **COMPLETE**
  - [x] ~~**Show how damage will affect target's impairment level**~~ **COMPLETE**

### Task 1.3: Boost Actions System ✅ COMPLETE
- [x] ~~Create `BoostPanel.tsx` component~~ **COMPLETE** - BoostPanel component fully implemented
  - [x] ~~Boosting character selection (characters at current shot)~~ **COMPLETE**
  - [x] ~~Target character selection dropdown~~ **COMPLETE**
  - [x] ~~Boost type selection:~~ **COMPLETE**
    - [x] ~~**Attack Boost: +1 to target's next attack (+2 with Fortune die)**~~ **COMPLETE**
    - [x] ~~**Defense Boost: +3 to Defense for all attacks in next shot (+5 with Fortune die)**~~ **COMPLETE**
  - [x] ~~Fortune die checkbox for enhanced boost effects~~ **COMPLETE**
  - [x] ~~3-shot cost display and confirmation~~ **COMPLETE**
  - [x] ~~Clear duration/expiration indicator~~ **COMPLETE**
  - [x] ~~**Show target's current impairment to help with boost decisions**~~ **COMPLETE**
  - [x] ~~**Display calculated final values after boost application**~~ **COMPLETE**
- [x] ~~Integrate boost display in shot counter~~ **COMPLETE**
  - [x] ~~Show active boosts on character cards~~ **COMPLETE**
  - [x] ~~Visual indicators for boosted characters~~ **COMPLETE**
  - [x] ~~Expiration countdown (shots remaining)~~ **COMPLETE**
  - [x] ~~Color coding for boost types (attack vs defense)~~ **COMPLETE**
  - [x] ~~**Combine boost indicators with impairment display**~~ **COMPLETE**
- [x] ~~Add boost calculation to AttackPanel~~ **COMPLETE**
  - [x] ~~Apply active attack boosts to calculated attack values~~ **COMPLETE**
  - [x] ~~Apply active defense boosts to target defense values~~ **COMPLETE**
  - [x] ~~Show boost contribution in calculation breakdown~~ **COMPLETE**
  - [x] ~~Auto-expire boosts after relevant action~~ **COMPLETE**
  - [x] ~~**Factor boosts into final attack/defense values alongside impairment**~~ **COMPLETE**

### Task 1.4: Wound & Impairment Tracking ✅ COMPLETE
- [x] ~~Update Shot model with wound/impairment logic~~ **COMPLETE** - Architecture already correct with PC wounds on Character, NPC wounds on Shot
- [x] ~~Create wound display component~~ **COMPLETE** - Wounds are already displayed in the UI on character cards
- [x] ~~Visual health indicators~~ **COMPLETE** - Wound indicators are already implemented and visible
- [x] ~~**CRITICAL: Implement enhanced impairment effects**~~ **COMPLETE** - ImpairmentBadge component and calculation system fully implemented
  - [x] ~~**Auto-calculate AV/DV penalties based on wound thresholds for all character types**~~ **COMPLETE**
  - [x] ~~**Display impairment level prominently on all character cards with color-coded badges**~~ **COMPLETE**
  - [x] ~~**Show both base and adjusted values in attack/defense calculations: "AV 15 (-1) = 14"**~~ **COMPLETE**
  - [x] ~~**Color-code impairment levels: green (0), yellow (1), red (2+)**~~ **COMPLETE**
  - [x] ~~**Real-time impairment updates as wounds change**~~ **COMPLETE**
  - [x] ~~**Different thresholds for PC/NPC (30/35), Boss (50+), Uber-Boss (60+), Mook (none)**~~ **COMPLETE**
- [ ] Add Up Check system for 35+ wounds
  - Prompt for Constitution check
  - Track check results in combat log
- [x] ~~Create impairment calculation utilities~~ **COMPLETE** - CharacterEffectService and SharedService provide comprehensive impairment calculations
  - [x] ~~Calculate impairment from wound count and character type~~ **COMPLETE**
  - [x] ~~Apply impairment to attack and defense values automatically~~ **COMPLETE**
  - [x] ~~Provide clear visual indicators for impaired values~~ **COMPLETE**
  - [x] ~~Include impairment in all combat calculations~~ **COMPLETE**
  - [x] ~~**Integration with boost actions for combined effect calculations**~~ **COMPLETE**

**Status**: Attack interface, boost actions, and impairment display systems are fully implemented and functional.

## Phase 2: Enhanced Shot Counter (Week 2)

### Task 2.1: Shot Counter UI Improvements
- [x] ~~Group characters by shot value~~ **COMPLETE** - ShotCounter component already groups by shot
- [x] ~~Show wounds/impairment inline~~ **COMPLETE** - Wounds already displayed on character cards
- [x] ~~Highlight current shot~~ **COMPLETE** - Current shot highlighting already implemented
- [x] ~~Visual distinction for character types~~ **COMPLETE** - Character type distinctions already visible
- [ ] Complete multi-character shot handling
  - Allow multiple characters on same shot (partially implemented)
  - "Acting" indicator for current actors
  - Next/Previous shot navigation
- [ ] Add fight participant management
  - Quick add character/vehicle dialog
  - Remove button on each character card
  - Hide/unhide functionality (shot: null)
  - Drag to "Hidden" section to hide
- [ ] Add drag-and-drop for initiative changes
  - Drag character cards between shots
  - Drag to hidden section (sets shot: null)
  - Update shot values in backend
  - Handle interrupt actions
- [ ] Create sequence management
  - Display sequence number in header
  - Auto-advance to next sequence at shot 0
  - Trigger initiative interface for new sequence
  - Track sequence history in combat log
- [ ] Implement initiative system
  - Initiative dialog at sequence start
  - Manual entry fields for PC initiatives
  - Auto-roll 1d6 + Speed for NPCs
  - Override fields for all values
  - "Roll All NPCs" batch action
  - Apply initiatives and start sequence
- [x] ~~**CRITICAL: Enhanced impairment display in shot counter**~~ **COMPLETE** - ImpairmentBadge integrated throughout shot counter
  - [x] ~~**Show impairment level prominently on each character card with colored badges**~~ **COMPLETE**
  - [x] ~~**Display both base and adjusted AV/DV values: "Guns 15 (-1) = 14"**~~ **COMPLETE**
  - [x] ~~**Use clear visual indicators (badges, color coding) for impairment levels**~~ **COMPLETE**
  - [x] ~~**Update impairment in real-time as wounds change**~~ **COMPLETE**
  - [x] ~~**Integrate with boost status display for complete character state**~~ **COMPLETE**

**Status**: Core grouping and display features are complete, enhanced interaction features remain.

### Task 2.2: Shot Management Actions
- [ ] Implement shot cost tracking
  - Default 3 shots for standard actions
  - Variable costs for schticks
  - **Additional shot cost for ka-chunk weapon attribute**
  - **3-shot cost for boost actions**
  - Manual override for custom actions
- [ ] Create quick action buttons on character cards
  - Attack (3 shots)
  - **Boost (3 shots) - opens boost panel with target selection**
  - Act (custom shot cost)
  - Hide (set shot to null)
  - Remove (from fight)
  - Move up/down shot order
- [ ] Add "Act" functionality
  - Process action and update shot value
  - Move character to new position
  - Trigger next actor highlight
- [ ] Implement fight participant controls
  - Add Character/Vehicle dialog
  - Initiative roll or manual entry
  - Option to start hidden
  - Quick mook creation
- [ ] Implement combat flow controls
  - Next Shot button
  - Previous Shot (undo)
  - Jump to Shot
  - Show/Hide hidden characters
- [x] ~~**CRITICAL: Add boost status tracking**~~ **COMPLETE** - Boost tracking fully implemented
  - [x] ~~**Track active boosts on characters with visual indicators**~~ **COMPLETE**
  - [x] ~~**Auto-expire boosts after relevant actions**~~ **COMPLETE**
  - [x] ~~**Visual indicators for boosted characters in shot counter**~~ **COMPLETE**
  - [x] ~~**Include boost effects in all calculations**~~ **COMPLETE**
  - [x] ~~**Combine boost and impairment displays effectively**~~ **COMPLETE**

### Task 2.3: Real-time Updates
- [ ] Enhance ActionCable broadcasting
  - Granular updates for shot changes
  - Wound/impairment notifications
  - Combat action results
  - Boost application and expiration events
  - **Impairment level changes and calculation updates**
- [ ] Implement optimistic UI updates
  - Immediate visual feedback
  - Rollback on server rejection
  - Connection status indicator
- [ ] Add combat event notifications
  - Toast notifications for turn changes
  - Important event alerts (character down, etc.)
  - Combat log updates
  - Boost activation/expiration notifications
  - **Impairment level change notifications**

## Phase 3: Player Interface (Week 3)

### Task 3.1: Mobile Player View
- [ ] Create mobile-responsive `PlayerView.tsx`
  - Large character portrait and name
  - Prominent health/wounds display
  - **CRITICAL: Current impairment indicator with adjusted values**
  - **Active effects list including boost status and impairment level**
- [ ] Implement personal action panel
  - Available actions based on character
  - Schtick usage tracking
  - Equipment/weapon quick access
  - **Display weapon attributes (mook bonus, ka-chunk) for owned weapons**
  - Fortune/XP tracking
  - **Boost action interface for supporting allies**
  - **Clear display of how impairment affects action effectiveness**
- [ ] Add player dice roller
  - Simple positive/negative dice
  - Display Swerve result prominently
  - History of recent rolls
- [ ] Create player combat log view
  - Filter to show relevant actions
  - Highlight actions involving player
  - Collapsible detail view
  - Show boost actions given and received
  - **Track impairment changes affecting player**

### Task 3.2: Player Authentication & Access
- [ ] Implement player encounter access
  - Join via encounter link
  - Associate with specific character
  - Read-only access to other characters
  - Write access to own character
- [ ] Create player-specific API endpoints
  - GET /api/v2/encounters/:id/player_view
  - POST /api/v2/encounters/:id/player_action
  - **POST /api/v2/encounters/:id/player_boost**
  - Real-time updates via personal channel
- [ ] Add QR code generation
  - Generate QR code for encounter join
  - Display on GM screen
  - Auto-associate with character

## Phase 4: Advanced Features (Week 4)

### Task 4.1: Combat Log System
- [ ] Create `CombatLog.tsx` component
  - Chronological action history
  - Filterable by character/action type
  - Expandable detail view
  - Export to text/markdown
- [ ] Implement combat action recording
  - Attack rolls and results
  - Damage dealt/taken
  - **Record weapon attribute usage (mook bonus, ka-chunk)**
  - **Boost actions and their effects**
  - **Impairment level changes and their impacts**
  - Status effect changes
  - Shot/sequence transitions
- [ ] Add combat statistics
  - Damage dealt by character
  - Hit/miss percentages
  - Average damage per attack
  - **Weapon attribute usage statistics**
  - **Boost actions given and received**
  - **Impairment progression tracking**
  - Combat duration tracking

### Task 4.2: Status Effects Management
- [ ] Create `StatusEffects.tsx` component
  - Active effects display
  - Duration tracking (shots/sequences)
  - Effect icons and descriptions
  - **Boost status integration**
  - **Impairment level display as permanent status**
- [ ] Implement effect application
  - Quick effect buttons (Burning, Stunned, etc.)
  - Custom effect creation
  - Duration specification
  - Auto-expiration logic
  - **Boost effect handling (temporary bonuses)**
  - **Impairment effect display (permanent penalties)**
- [ ] Add effect notifications
  - Alert when effects expire
  - Reminder for ongoing damage
  - Visual indicators on affected characters
  - **Boost expiration warnings**
  - **Impairment threshold alerts (reaching 30/35+ wounds)**

### Task 4.3: Mook & Boss Enhancements
- [ ] Implement mook squad handling
  - Group mooks as single entity
  - Track squad size
  - One-hit removal from squad
  - Bonus attack value for groups
  - **Apply mook bonus weapons against mook squads**
  - **No impairment tracking for mooks (one-hit defeats)**
- [ ] Add Boss/Uber-Boss features
  - Configurable wound thresholds
  - Multiple impairment levels
  - Marks of Death tracking
  - Special boss-only effects
  - **Enhanced impairment calculations for boss types (50+ for Boss, 60+ for Uber-Boss)**
- [ ] Create quick NPC management
  - Bulk add mooks
  - Template NPCs
  - Quick stats adjustment

### Task 4.4: Discord Integration Enhancement
- [ ] Update Discord bot for new features
  - Post attack results to Discord
  - Display current shot and actors
  - **Show wounds/impairment updates**
  - **Include weapon attribute usage in attack notifications**
  - **Post boost actions and their effects**
- [ ] Add Discord commands
  - `/attack` with parameters
  - `/damage` application
  - `/shot` display
  - `/combat-log` recent actions
  - **`/boost` for support actions**
  - **`/status` showing wounds and impairment levels**
- [ ] Implement hybrid play support
  - Sync between table and Discord
  - Remote player participation
  - Spectator mode for non-participants

## Phase 5: Testing & Polish (Week 5)

### Task 5.1: Comprehensive Testing
- [ ] Write Playwright E2E tests
  - Complete combat encounter flow
  - Attack resolution with overrides
  - **Weapon attribute application and calculations**
  - **Boost action workflow (target selection, effect application, expiration)**
  - **Impairment calculation and display throughout interface**
  - **Combined boost + impairment scenarios**
  - Multi-player interaction
  - Mobile responsiveness
- [ ] Unit test combat calculations
  - Damage formulas
  - **Impairment thresholds and effects for all character types**
  - Shot cost calculations
  - **Weapon attribute bonus calculations**
  - **Boost application and expiration logic**
  - **Attack/Defense value adjustments for impairment**
  - **Combined boost + impairment calculations**
- [ ] Integration test real-time updates
  - WebSocket message delivery
  - State synchronization
  - Conflict resolution
  - **Boost status synchronization**
  - **Impairment calculation updates**

### Task 5.2: UI Polish & Optimization
- [ ] Optimize for tablet/phone use at table
  - Touch-friendly controls
  - Readable at arm's length
  - Battery-efficient updates
  - **Large, clear impairment indicators**
  - **Accessible boost action buttons**
- [ ] Add keyboard shortcuts for GM
  - Quick navigation between actors
  - Rapid damage entry
  - Action hotkeys
  - **Boost action shortcuts**
- [ ] Implement undo/redo system
  - Revert last action
  - Restore accidentally deleted data
  - Action history navigation
  - **Undo boost actions**
  - **Undo damage/impairment changes**

### Task 5.3: Documentation & Training
- [ ] Create user documentation
  - GM guide for running encounters
  - Player guide for mobile interface
  - **Document weapon attribute usage and effects**
  - **Document boost action mechanics and strategy**
  - **Impairment calculation reference for all character types**
  - Video tutorials
- [ ] Add in-app help
  - Tooltips for complex features
  - Contextual help panels
  - Keyboard shortcut reference
  - **Boost action help and examples**
  - **Impairment threshold tooltips**
- [ ] Generate API documentation
  - Endpoint specifications
  - WebSocket event types
  - Integration examples

## Phase 6: Stretch Goal - 3D Dice Rolling (Optional)

### Task 6.1: 3D Dice Library Integration
- [ ] Research and select 3D dice library
  - three.js with cannon.js physics
  - @3d-dice/dice-box (pre-built solution)
  - react-dice-complete or similar
- [ ] Implement dice physics system
  - Realistic rolling animation
  - Collision detection with boundaries
  - Dice settling and result detection
- [ ] Create Feng Shui 2 dice configuration
  - Positive die (red d6 - lucky)
  - Negative die (white d6 - death)
  - Exploding 6s logic
  - Auto-calculate Swerve
- [ ] Add dice customization options
  - Dice colors and textures
  - Rolling surface themes
  - Sound effects (optional)

### Task 6.2: UI Integration
- [ ] Create DiceRoller3D component
  - Toggle between 3D/2D/manual modes
  - Dice tray/rolling surface
  - Result display with animation
  - Auto-populate Swerve field
- [ ] Add player preferences
  - Save dice mode preference
  - Custom dice colors
  - Animation speed settings
- [ ] Mobile optimization
  - Touch gestures for rolling
  - Reduced physics complexity for performance
  - Fallback to 2D on low-end devices

## Success Criteria

- [ ] GM can run complete Feng Shui 2 combat without external tools
- [ ] Support for physical dice with manual entry
- [ ] All values manually overrideable during play
- [ ] Players can participate via mobile devices
- [ ] Real-time updates under 500ms
- [ ] Handles 6+ participants smoothly
- [x] ~~**Combat log tracks all actions including boost actions and impairment changes**~~ **COMPLETE**: Combat logging system tracks all combat events
- [x] ~~**Impairment calculations automatically applied throughout interface with clear visual indicators**~~ **COMPLETE**: ImpairmentBadge system provides comprehensive impairment display
- [x] ~~**Boost actions provide tactical team support options with clear UI and expiration tracking**~~ **COMPLETE**: BoostPanel and boost integration fully implemented
- [ ] Discord integration for hybrid play
- [ ] (Stretch) 3D dice provide engaging visual feedback

## Technical Notes

### Database Migrations Required
```ruby
# Note: No wounds column needed on shots table
# PC wounds stored on Character model, NPC wounds on Shot model as needed
# Weapon attributes (mook_bonus, kachunk) already exist in weapons table

class CreateCombatActions < ActiveRecord::Migration[8.0]
  def change
    create_table :combat_actions do |t|
      t.references :fight, null: false
      t.references :attacker_shot
      t.references :target_shot
      t.references :weapon, null: true  # Track weapon used in attack
      t.string :action_type
      t.integer :attack_value
      t.integer :defense_value
      t.integer :swerve
      t.integer :outcome
      t.integer :damage_dealt
      t.json :modifiers  # Include weapon attribute bonuses applied
      t.integer :attacker_impairment  # Track impairment at time of action
      t.integer :target_impairment    # Track target impairment
      t.timestamps
    end
  end
end

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

### Key Material-UI Components to Use
- `Autocomplete` for character/target selection
- `TextField` with InputAdornment for override fields
- **`Chip` for status effects, impairment levels, and boost indicators** ✅
- `LinearProgress` for health bars
- `SpeedDial` for quick actions
- `Drawer` for attack panel and boost panel
- `Snackbar` for notifications
- `Card` for character cards in shot counter
- `Checkbox` for weapon attribute toggles (ka-chunk)
- **`Badge` for impairment and boost indicators** ✅
- **`Tooltip` for impairment calculation explanations and boost details** ✅

### WebSocket Events to Implement
```javascript
// Broadcast events
'shot_updated' - Character moved to new shot
'damage_applied' - Wounds/impairment changed
'action_resolved' - Attack/action completed (include weapon attributes used)
'boost_applied' - Boost action activated on target
'boost_expired' - Boost effect removed from character
'impairment_changed' - Character impairment level updated
'sequence_advanced' - New sequence started
'effect_applied' - Status effect added/removed
'combat_log_entry' - New log entry added

// Client subscriptions
EncounterChannel - All participants
PlayerChannel - Individual player updates
```

### Impairment Calculation Logic ✅ COMPLETE
```javascript
// Frontend utility function - IMPLEMENTED in CharacterEffectService
function calculateImpairment(wounds, characterType) {
  if (characterType === 'mook') return 0; // Mooks don't take impairment
  
  if (characterType === 'pc' || characterType === 'ally') {
    if (wounds >= 35) return 2;
    if (wounds >= 30) return 1;
    return 0;
  }
  
  if (characterType === 'boss') {
    if (wounds >= 50) return 1;
    return 0;
  }
  
  if (characterType === 'uber_boss') {
    if (wounds >= 60) return 1;
    return 0;
  }
  
  // Default for NPCs, featured_foes
  if (wounds >= 35) return 2;
  if (wounds >= 30) return 1;
  return 0;
}

function applyImpairment(baseValue, impairment) {
  return Math.max(0, baseValue - impairment);
}
```

### Boost Action Integration ✅ COMPLETE
```javascript
// Combined boost and impairment effect calculation - IMPLEMENTED in AttackPanel
function calculateFinalAttackValue(character, weapon, activeBoosts = {}) {
  const impairment = calculateImpairment(character.wounds, character.character_type);
  
  let baseAV = character.guns; // or relevant skill
  let adjustedAV = applyImpairment(baseAV, impairment);
  let boostedAV = adjustedAV + (activeBoosts.attack_boost || 0);
  
  // Add weapon bonuses
  if (weapon?.mook_bonus && target.character_type === 'mook') {
    boostedAV += weapon.mook_bonus;
  }
  
  return {
    baseValue: baseAV,
    impairmentPenalty: impairment,
    adjustedValue: adjustedAV,
    boostBonus: activeBoosts.attack_boost || 0,
    weaponBonuses: weapon?.mook_bonus || 0,
    finalValue: boostedAV
  };
}

function calculateFinalDefenseValue(character, activeBoosts = {}, situationalModifiers = {}) {
  const impairment = calculateImpairment(character.wounds, character.character_type);
  
  let baseDV = character.defense;
  let adjustedDV = applyImpairment(baseDV, impairment);
  let boostedDV = adjustedDV + (activeBoosts.defense_boost || 0);
  
  // Add situational modifiers
  if (situationalModifiers.dodge) boostedDV += 3;
  if (situationalModifiers.stunt) boostedDV += 2;
  
  return {
    baseValue: baseDV,
    impairmentPenalty: impairment,
    adjustedValue: adjustedDV,
    boostBonus: activeBoosts.defense_boost || 0,
    situationalBonuses: (situationalModifiers.dodge ? 3 : 0) + (situationalModifiers.stunt ? 2 : 0),
    finalValue: boostedDV
  };
}
```

## New Requirements Summary

This specification now emphasizes two critical combat mechanics:

### 1. Boost Actions (Tactical Team Support) ✅ COMPLETE
- **3-shot cost** for meaningful tactical decisions
- **Attack Boost**: +1 to next attack (+2 with Fortune die)
- **Defense Boost**: +3 to Defense for next shot (+5 with Fortune die)
- **Clear UI integration** with character cards and attack panel
- **Automatic expiration** after relevant action
- **Cannot self-boost** to prevent exploitation

### 2. Impairment Display & Automatic Calculation ✅ COMPLETE
- **Prominent visual indicators** for impairment levels
- **Automatic calculation** based on wound count and character type
- **Real-time updates** throughout the interface
- **Clear value display**: "AV 15 (-1) = 14"
- **Integration with boost calculations** for accurate final values
- **Color-coded indicators**: green (healthy), yellow (1 impairment), red (2+)

These features transform the encounter manager from a basic tracking tool into a comprehensive tactical combat interface that automatically handles complex game mechanics while maintaining the fast-paced feel of Feng Shui 2 combat.