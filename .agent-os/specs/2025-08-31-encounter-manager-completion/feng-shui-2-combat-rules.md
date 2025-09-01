# Feng Shui 2 Combat System Requirements

## Core Combat Mechanics

### Shot Counter System
- **Initiative**: Characters roll initiative and start at their shot value (typically 6-18)
- **Shot Cost**: Most actions cost 3 shots (attack, active dodge)
- **Turn Order**: Characters act when the shot counter reaches their value, counting down
- **Next Action**: After acting, character's next turn is at (current shot - action cost)
- **Sequence**: When all characters reach 0 or below, a new sequence begins

### Attack Resolution (Tabletop Helper)

#### Core Philosophy
**This is a GM tool to help run tabletop sessions, not an automated video game.**
- All values must be manually overrideable
- Support for physical dice rolls at the table
- GM has final say on all outcomes
- Tool assists with math and tracking, not rules enforcement

#### Attack Interface Requirements
1. **Attacker Selection**
   - Choose attacking character from current shot
   - Display character's available attack values as **suggestions**:
     - Main Attack (Guns, Martial Arts, Scroungetech, Sorcery, Creature)
     - Secondary Attack (if different skill)
     - Backup Attack (fallback option)
   - Show current impairment affecting attack value
   - **Manual Override**: GM can type in any Attack Value

2. **Target Selection**
   - Choose from all valid targets (characters/vehicles in fight)
   - Display target's Defense Value as **suggestion**
   - Show target's impairment affecting defense
   - **Dodge Option**: Target can spend 1 shot for +3 Defense
   - **Manual Override**: GM can type in any Defense Value

3. **Roll Resolution Options**
   - **Physical Dice**: Players roll actual dice, GM enters the Swerve
   - **Digital Helper**: Optional digital dice roller for online players
   - **Manual Entry**: GM can directly enter final Attack Check Result
   - Attack Check Result = Attack Value + Swerve (all overrideable)
   - Outcome = Attack Check Result - Defense Value (all overrideable)

4. **Damage Calculation**
   - **Suggested** Damage = Outcome + Weapon Damage - Toughness
   - **Manual Override**: GM enters actual damage dealt
   - Apply wounds to target (with confirmation)
   - Display impairment threshold warnings
   - GM decides on special effects/conditions

### Wound & Impairment System

#### PC (Player Character) Thresholds
- **0-29 wounds**: No impairment (healthy)
- **30-34 wounds**: 1 Impairment (-1 to AV/DV)
- **35+ wounds**: 2 Impairment (-2 to AV/DV)
- **35+ wounds**: Must make Up Checks (Constitution vs Toughness) to stay conscious
- **Death**: At 70 wounds (or failing Death Checks)

#### NPC Thresholds
- **Named NPCs**: Similar to PCs but may have different thresholds
- **Featured Foes**: Take wounds like PCs but simpler death mechanics
- **Mooks**: Defeated with any successful hit (no wound tracking)

#### Boss/Uber-Boss Thresholds
- **Bosses**: Higher wound thresholds (often 50 for 1 impairment)
- **Uber-Bosses**: Even higher thresholds (often 60+ for 1 impairment)
- **Multiple Impairment Levels**: Can take 3+ impairment before defeat

### Special Combat Rules

#### Mook Rules
- Any successful hit defeats a mook
- Mooks attack as groups (add +1 AV per extra mook)
- No individual wound tracking
- Visual indicator for mook groups vs individuals

#### Vehicle Combat
- Vehicles have Handling (defense) and Frame (toughness)
- Driver uses Driving skill for attack/defense
- Passengers can attack normally
- Chases use special position/speed mechanics

#### Status Effects
- **Burning**: Ongoing damage each sequence
- **Stunned**: Cannot act for X shots
- **Entangled**: Impairment to physical actions
- **Marked for Death**: Boss/Uber-boss tracking

### Combat Flow Requirements

1. **Initiative Phase**
   - Roll or set initiative for all participants
   - Sort by shot value (highest first)
   - Display clear turn order

2. **Action Phase**
   - Highlight current actor(s)
   - Present action options (attack, dodge, move, schtick)
   - Process action and update shot counter
   - Apply results (damage, effects, movement)

3. **Upkeep Phase**
   - Check for Up Checks (wounded characters)
   - Process ongoing effects
   - Update impairment levels
   - Remove defeated characters

4. **Sequence Transition**
   - When all reach shot 0 or below
   - Reset shot values
   - Expire sequence-based effects
   - Increment sequence counter

## User Interface Requirements

### GM View
- **Combat Dashboard**
  - Shot counter with all participants
  - Quick damage application
  - Bulk mook management
  - Effect application tools
  - Combat log

### Player View
- **Character Focus**
  - Large health/wound display
  - Current impairment indicator
  - Available actions
  - Active effects
  - Simple dice roller

### Attack Interface (Tabletop Helper Mode)
```
┌─────────────────────────────────────────────┐
│         ATTACK ACTION                       │
├─────────────────────────────────────────────┤
│ Attacker: [Select Character ▼]              │
│   • Jake "Ace" Chen (Shot 14)              │
│   • Sister Mary (Shot 14)                  │
│   • Tommy Two-Guns (Shot 11)               │
│                                             │
│ Attack Skill:                               │
│   ● Guns (13)           Override: [_13_]   │
│   ○ Martial Arts (12)   Override: [___]    │
│   ○ Sorcery (10)        Override: [___]    │
│   ○ Custom: [_______]   Value: [___]       │
│   Impairment: -1 (auto-applied to above)   │
│                                             │
│ Weapon:                                     │
│   [Select Weapon ▼]                        │
│   • Sig Sauer P226 (Damage: 10)            │
│   • Desert Eagle (Damage: 11)              │
│   • Unarmed Strike (Damage: 7)             │
│   • Custom Damage: [___]                    │
│   Override Damage: [___]                    │
│                                             │
│ Attack Type:                                │
│   □ Stunt (+2 to target's Defense)         │
│   □ Called Shot (specify effect)           │
│                                             │
│ Target: [Select Target ▼]                  │
│   • Big Bruiser (DV 13)                    │
│   • Ninja Mook Squad (DV 14)               │
│   • The Dragon (Boss, DV 16)               │
│                                             │
│ Defense Value:                              │
│   Base: 13  Stunt: +2  Total: [_15_]      │
│   [Dodge] (+3 DV, target spends 1 shot)    │
│                                             │
│ Dice Roll (Swerve):                        │
│   ○ Physical Dice: Enter Swerve: [___]     │
│   ● Digital Helper [Roll + and -]          │
│     (6s explode, shows running total)      │
│   ○ 3D Dice (Stretch) [Roll in 3D] 🎲     │
│     (Physics-based visual dice)            │
│   ○ Direct Entry (Final Swerve): [___]     │
│                                             │
│ Combat Resolution:                          │
│   Action Value: [13] + Swerve: [___]       │
│   = Action Result: [___]                   │
│   - Defense Value: [15]                    │
│   = Outcome: [___]                         │
│                                             │
│ Damage Calculation:                         │
│   Outcome: [___]                           │
│   + Damage: [10] (override: [___])         │
│   = Smackdown: [___]                       │
│   - Toughness: [7]                         │
│   = Wounds to Apply: [___]                 │
│                                             │
│ [Apply] [Apply & Next] [Cancel]            │
└─────────────────────────────────────────────┘
```

### Shot Counter Display
```
┌─────────────────────────────────────────────┐
│ SHOT COUNTER - Sequence 1                   │
│ [Roll Initiative for Sequence 2]            │
├─────────────────────────────────────────────┤
│ Shot 17:                                    │
│   • Nobody                                  │
│                                             │
│ Shot 16:                                    │
│   • The Dragon (Boss) [0 Wounds] Healthy   │
│                                             │
│ Shot 14: ← CURRENT                         │
│   • Jake "Ace" Chen [15 Wounds] No Impair  │
│   • Sister Mary [22 Wounds] No Impair      │
│   • Ninja Mook 1 [Mook]                    │
│   • Ninja Mook 2 [Mook]                    │
│                                             │
│ Shot 11:                                    │
│   • Tommy Two-Guns [31 Wounds] 1 Impair    │
│   • Big Bruiser [40 Wounds] 1 Impair       │
│                                             │
│ Shot 8:                                     │
│   • Sorcerer [0 Wounds] Healthy            │
│                                             │
│ Hidden (no shot):                          │
│   • Backup Guy [5 Wounds] [Unhide]         │
│   • Reinforcement [0 Wounds] [Unhide]      │
│                                             │
│ [Next Shot] [Previous] [Add Character]     │
└─────────────────────────────────────────────┘
```

Each character shows: 
- Name [Current Wounds] Impairment Level
- [X] button to remove from fight
- [Hide] button to set shot to null
- Hidden characters show [Unhide] button

### Compact Attack Panel (Side Panel)
```
┌─────────────────────────────────────────────┐
│ QUICK ATTACK                                │
├─────────────────────────────────────────────┤
│ Attacker: Jake "Ace" Chen                   │
│ AV: Guns 13 [-0] = [13]                    │
│ Weapon: Sig Sauer (10 dmg)                 │
│                                             │
│ Target: Big Bruiser                         │
│ DV: 13 [-1] = [12]                         │
│ □ Dodge (+3 DV, -1 shot)                   │
│ □ Stunt (+2 DV)                            │
│                                             │
│ Swerve: [___] or [Roll Dice]                │
│ (Positive die - Negative die, 6s explode)  │
│                                             │
│ Action Result: 13 (AV) + ___ (Swerve) = ___│
│ Outcome: ___ (Result) - 12 (DV) = ___      │
│ Smackdown: ___ (Outcome) + 10 (Dmg) = ___  │
│ Wounds: ___ (Smack) - 7 (Tough) = [___]    │
│                                             │
│ [Attack] [Full Details]                     │
└─────────────────────────────────────────────┘
```

### Initiative Interface (Start of Sequence)
```
┌─────────────────────────────────────────────┐
│     ROLL INITIATIVE - Sequence 2            │
├─────────────────────────────────────────────┤
│ Player Characters (enter manually):         │
│                                             │
│ Jake "Ace" Chen:        [___] + 6 = [___]  │
│ Sister Mary:            [___] + 5 = [___]  │
│ Tommy Two-Guns:         [___] + 4 = [___]  │
│                                             │
│ NPCs/Enemies (auto-roll):                  │
│                                             │
│ Big Bruiser:     [Roll] + 3 = [___]        │
│ The Dragon:      [Roll] + 7 = [___]        │
│ Ninja Mooks (4): [Roll] + 5 = [___]        │
│ Sorcerer:        [Roll] + 4 = [___]        │
│                                             │
│ [Roll All NPCs] [Apply & Start Sequence]   │
└─────────────────────────────────────────────┘
```

Note: 
- PCs: Players roll physical dice, GM enters result
- NPCs: System rolls automatically or GM overrides
- Formula: 1d6 + Speed = Initiative (starting shot)

### Fight Management Interface
```
┌─────────────────────────────────────────────┐
│        ADD TO FIGHT                         │
├─────────────────────────────────────────────┤
│ Add Character:                              │
│ [Select Character ▼]                        │
│   • Available PCs                           │
│   • Available NPCs                          │
│   • Quick Mook (create new)                 │
│                                             │
│ Add Vehicle:                                │
│ [Select Vehicle ▼]                          │
│   • Available Vehicles                      │
│                                             │
│ Initial Shot: [___] or [Roll Initiative]    │
│ □ Start Hidden (no shot)                    │
│                                             │
│ [Add to Fight] [Cancel]                     │
└─────────────────────────────────────────────┘
```

### Character Quick Actions (on each card)
```
┌─────────────────────────────────────────────┐
│ Jake "Ace" Chen [15 Wounds]                 │
│ Shot 14 | Guns 13 | Defense 13              │
├─────────────────────────────────────────────┤
│ [Attack] [Act -3] [Hide] [Remove] [↑] [↓]  │
└─────────────────────────────────────────────┘
```

### Wound Application
```
┌─────────────────────────────────────┐
│        APPLY WOUNDS                 │
├─────────────────────────────────────┤
│ Target: Johnny Tso (PC)             │
│ Current: 28 Wounds (No impairment)  │
│                                     │
│ Add Wounds: [___]                   │
│                                     │
│ New Total: 31 Wounds                │
│ ⚠️ 1 Impairment! (threshold: 30)    │
│                                     │
│ [Apply] [Cancel]                    │
└─────────────────────────────────────────┘
```

## Stretch Goal: 3D Dice Rolling

### Visual Dice Interface
```
┌─────────────────────────────────────────────┐
│            3D DICE ROLLER                   │
├─────────────────────────────────────────────┤
│                                             │
│     [3D Dice Rolling Surface]               │
│                                             │
│     🎲 (Red Die +)   🎲 (White Die -)      │
│                                             │
│     Click to Roll or Drag to Throw          │
│                                             │
│     Rolling... [Physics Animation]          │
│                                             │
│     Results:                                │
│     Positive: 4 (no explosion)              │
│     Negative: 6 → 6 → 2 = 14 (exploded!)   │
│     Swerve: 4 - 14 = -10                   │
│                                             │
│     [Use This Roll] [Roll Again]            │
└─────────────────────────────────────────────┘
```

### Features
- **Physics-based rolling**: Realistic dice physics with gravity and collision
- **Exploding 6s**: Visual indication when a die explodes, rolls again automatically
- **Color coding**: Red for positive (lucky), white for negative (death)
- **Sound effects**: Optional dice rolling sounds
- **Customization**: Different dice textures, table surfaces
- **Mobile support**: Touch to roll, shake device to roll (optional)

### Libraries to Consider
- **@3d-dice/dice-box**: Pre-built 3D dice solution
- **three.js + cannon.js**: Custom implementation with full control
- **react-dice-complete**: React-specific dice component
- **dice-threejs**: Lightweight three.js dice

## Technical Implementation Notes

### Database Schema Additions
```ruby
# Add to shots table
add_column :shots, :wounds, :integer, default: 0
add_column :shots, :impairment, :integer, default: 0
add_column :shots, :marks_of_death, :integer, default: 0

# Add combat_actions table
create_table :combat_actions do |t|
  t.references :fight, null: false
  t.references :attacker_shot, null: false
  t.references :target_shot
  t.string :attack_type # 'guns', 'martial_arts', etc
  t.integer :attack_value
  t.integer :defense_value
  t.integer :swerve
  t.integer :outcome
  t.integer :damage_dealt
  t.integer :shot_cost
  t.json :modifiers
  t.timestamps
end
```

### API Endpoints
```
POST /api/v2/encounters/:id/attack
  - attacker_shot_id
  - target_shot_id
  - attack_type
  - modifiers

POST /api/v2/encounters/:id/apply_damage
  - shot_id
  - damage_amount
  
POST /api/v2/encounters/:id/up_check
  - shot_id
  - roll_result

GET /api/v2/encounters/:id/combat_log
  - Returns recent combat_actions
```

### Real-time Updates
- Broadcast damage application immediately
- Update shot counter for all clients
- Highlight impairment changes
- Notify on character defeat/death