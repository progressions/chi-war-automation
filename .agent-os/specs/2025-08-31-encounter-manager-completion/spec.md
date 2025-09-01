# Encounter Manager Completion Specification

## Problem Statement

The Chi War application has a basic encounter system with shot counter functionality, but lacks critical features needed for running actual Feng Shui 2 tabletop RPG sessions. The user (currently the sole user of the platform) needs a complete encounter management system to effectively GM combat encounters during live tabletop game sessions with physical dice.

### Current State
- Basic shot counter/initiative tracking exists at `encounters/[id]/page.tsx`
- Backend Fight model supports shots, effects, and character_effects
- Discord bot integration provides basic notifications
- Real-time updates via ActionCable WebSockets
- No UI for health tracking, damage resolution, or status effects
- No combat action interface for players or GMs
- Limited mobile support for at-the-table play
- No support for manual overrides or physical dice integration

### User Need
"I'm the only one using this site and I want to be able to use it for running fights in my Feng Shui 2 tabletop games. I need to track health, resolve actions with physical dice, manage status effects, and give my players an interface they can use on their phones during the game. This is a GM helper tool, not a video game - I need to be able to override any value during play."

## Solution

Create a comprehensive encounter management system that provides immediate value for running Feng Shui 2 combat sessions, with separate interfaces for GMs and players, full health/damage tracking, action resolution, and mobile optimization.

### Core Components

#### 1. Attack Interface System (Tabletop Helper)
- **Attacker Selection**: Choose from characters at current shot
- **Attack Value**: Display suggested AV with **manual override field**
- **Weapon Selection**: Choose weapon with attribute display and bonuses
  - **Mook Bonus**: Automatic bonus to attack rolls when attacking mook-type characters
  - **Ka-chunk**: Optional bonus (+1 shot cost) that player can choose to activate
  - **Attribute Display**: Clear indicators in weapon selection dropdown
  - **Manual Overrides**: All weapon bonuses can be manually adjusted
- **Target Selection**: All valid targets with their Defense Values
- **Dodge Action**: Quick button to spend 1 shot for +3 Defense (overrideable)
- **Physical Dice Support**: Enter Swerve from table dice or use digital helper
- **Manual Overrides**: Every value (AV, DV, Swerve, Damage) can be typed in
- **Damage Application**: Suggested calculation with **GM final input**
- **Impairment Integration**: Automatically display and apply impairment penalties to all values

#### 2. Boost Actions System (NEW REQUIREMENT)
- **3-shot Support Action**: Player characters can boost allies in combat
- **Attack Boost**: +1 to target's next attack (+2 with Fortune die)
- **Defense Boost**: +3 to Defense for all attacks in target's next shot (+5 with Fortune die)
- **Target Selection**: Choose any character in fight (except self)
- **Duration Tracking**: Boosts expire after specific conditions
- **Visual Indicators**: Clear display of active boosts on character cards
- **Fortune Die Integration**: Optional enhancement using Fortune points

#### 3. Enhanced Impairment Display & Calculation (NEW REQUIREMENT)
- **Prominent Display**: Show impairment level clearly on all character cards
- **Automatic Calculation**: Subtract impairment from Attack and Defense Values
- **Visual Format**: Display both base and adjusted values (e.g., "AV 15 (-1) = 14")
- **Real-time Updates**: Impairment changes immediately when wounds update
- **Color Coding**: Visual indicators for impairment levels (yellow for 1, red for 2+)
- **Integration**: Factor impairment into all combat calculations automatically

#### 4. Wounds & Impairment Tracking
- **PC Thresholds**: 0-29 (healthy), 30-34 (1 impair), 35+ (2 impair + Up Checks)
- **Boss Variations**: Different thresholds for Bosses/Uber-Bosses
- **Mook Handling**: One-hit defeats, no wound tracking
- **Visual Indicators**: Clear impairment status on character cards
- **Up Check System**: Constitution checks at 35+ wounds for PCs
- **Automatic Impairment**: Apply -1 AV/DV per impairment level

#### 5. Status Effects Management
- Visual indicators for active effects
- Effect duration tracking by shots/sequences
- Automatic effect expiration
- Quick effect application interface
- Custom effect creation for GM
- Boost status integration

#### 6. Enhanced Shot Counter with Fight Management
- **Multiple Characters per Shot**: Support multiple characters acting on same shot value
- **Shot Cost Tracking**: Default 3 shots per action, variable for schticks, +1 for ka-chunk, 3 for boosts
- **Current Actor Highlighting**: Clear indication of who can act
- **Fight Participant Management**:
  - Quick add character/vehicle to ongoing fight
  - Remove participant button on each character
  - Hide/unhide characters (shot: null = hidden)
  - Drag characters between shots or to hidden
- **Sequence Management**: 
  - Display current sequence number prominently
  - Auto-advance when all reach shot 0 or below
  - Initiative interface for new sequences
  - Manual entry for PC initiatives
  - Auto-roll for NPC initiatives
- **Initiative System**:
  - 1d6 + Speed for starting shot
  - Manual override for all values
  - Batch roll for all NPCs
  - Drag-and-drop for surprise/interrupt actions

#### 7. Player Combat Interface
- Mobile-optimized character sheet view
- Quick action buttons (attack, dodge, boost allies, reload, etc.)
- Personal damage/wounds tracker with impairment display
- Schtick usage tracking
- **Weapon attribute display**: Show mook bonus and ka-chunk options for equipped weapons
- **Boost interface**: Select allies to boost with attack/defense bonuses
- Real-time updates from GM actions

#### 8. GM Control Panel
- Bulk action resolution
- Quick NPC/mook management
- Combat pacing controls (pause, rewind shot)
- Visibility toggles for player information
- Combat summary statistics
- **Weapon attribute usage tracking**
- **Boost action management and tracking**

### Technical Architecture

#### Frontend Components (Material-UI)
```
src/components/encounters/
├── EncounterManager.tsx       # Main orchestrator component
├── CombatLog/
│   ├── CombatLog.tsx          # Action history display
│   └── LogEntry.tsx           # Individual log entries
├── HealthTracker/
│   ├── HealthBar.tsx          # Visual health display
│   ├── WoundChips.tsx         # Wound/impairment indicators
│   ├── ImpairmentDisplay.tsx  # Enhanced impairment UI (NEW)
│   └── DamageDialog.tsx       # Apply damage interface
├── ActionResolver/
│   ├── ActionPanel.tsx        # Action declaration UI
│   ├── AttackPanel.tsx        # Attack resolution with impairment
│   ├── BoostPanel.tsx         # Boost action interface (NEW)
│   ├── WeaponSelector.tsx     # Weapon selection with attributes
│   ├── DiceRoller.tsx         # Dice rolling interface
│   └── ResultDisplay.tsx      # Outcome visualization
├── StatusEffects/
│   ├── EffectsList.tsx        # Active effects display
│   ├── EffectChip.tsx         # Individual effect indicator
│   ├── BoostIndicator.tsx     # Boost status display (NEW)
│   └── ApplyEffectDialog.tsx  # Effect application UI
├── ShotCounter/
│   ├── EnhancedShotCounter.tsx # Improved initiative tracker
│   ├── ShotCard.tsx           # Draggable character card with impairment
│   └── TurnIndicator.tsx      # Active turn display
├── PlayerView/
│   ├── PlayerInterface.tsx     # Mobile player UI
│   ├── QuickActions.tsx        # Action shortcut buttons
│   ├── BoostActions.tsx        # Player boost interface (NEW)
│   └── PersonalStats.tsx       # Character status with impairment
└── Utils/
    ├── ImpairmentCalculator.ts  # Impairment logic utilities (NEW)
    └── BoostCalculator.ts       # Boost effect utilities (NEW)
```

#### Backend Enhancements
```ruby
# New/Enhanced Models
app/models/
├── combat_action.rb       # Action declaration tracking (includes weapon_id, boost_type)
├── damage_record.rb       # Damage history
├── boost_effect.rb        # Boost tracking (NEW)
└── combat_log_entry.rb    # Combat event logging

# New Controllers
app/controllers/api/v2/
├── combat_actions_controller.rb  # Enhanced with weapon attribute handling
├── boost_actions_controller.rb   # Boost action management (NEW)
├── damage_controller.rb
└── effects_controller.rb

# Enhanced Serializers
app/serializers/
├── encounter_detail_serializer.rb  # Full combat state with boosts/impairment
├── player_view_serializer.rb       # Player-specific data with personal boosts
├── character_combat_serializer.rb  # Character with impairment calculations (NEW)
└── weapon_serializer.rb            # Already includes mook_bonus, kachunk

# New Services
app/services/
├── boost_application_service.rb   # Handle boost logic (NEW)
├── impairment_calculator.rb       # Centralized impairment logic (NEW)
└── combat_calculation_service.rb  # Unified combat math (NEW)
```

#### Real-time Updates
- Enhance existing ActionCable channels for granular updates
- Add combat-specific event types for boosts and impairment
- Implement optimistic UI updates for responsiveness
- Add connection status indicators

### User Experience Flow

#### GM Flow
1. Start encounter from campaign dashboard
2. Add participants via drag-and-drop or quick add
3. Roll initiative automatically or set manually
4. Begin combat with clear turn indicator
5. **Select weapon with visible attribute indicators**
6. **Choose weapon attribute usage (mook bonus auto-applies, ka-chunk manual)**
7. **Apply boost actions to support player characters**
8. **See impairment effects automatically calculated and displayed**
9. Resolve actions with integrated dice roller
10. Apply damage/effects with visual feedback
11. Advance through shots with automatic tracking
12. End encounter with summary statistics

#### Player Flow
1. Join encounter via link or QR code
2. View personal character status prominently
3. **See equipped weapon attributes in action panel**
4. **View current impairment and adjusted combat values**
5. Declare actions when turn arrives
6. **Choose to use ka-chunk if weapon supports it**
7. **Boost allies with attack or defense bonuses**
8. Roll dice with single tap
9. Track wounds and effects visually
10. Access schticks and equipment quickly
11. View combat log for context
12. Receive notifications for turn/important events

### Implementation Priorities

#### Phase 1: Attack & Damage System (Immediate Priority)
- Attack interface with attacker/target selection
- **Weapon selection with attribute display and integration**
- Attack value selection (Main/Secondary/Backup)
- **Mook bonus automatic application**
- **Ka-chunk optional activation**
- **Enhanced impairment display and automatic calculation**
- **Boost actions system with 3-shot cost**
- Dice roller with Swerve calculation
- Damage application with impairment triggers
- Wound tracking with PC thresholds (30/35)
- Basic combat log with boost tracking

#### Phase 2: Shot Counter Enhancement
- Multiple characters per shot handling
- Shot cost management for different actions
- **Ka-chunk shot cost integration (+1 shot)**
- **Boost action shot cost integration (3 shots)**
- **Enhanced impairment display in shot counter**
- Sequence transitions and resets
- Up Check system for wounded characters
- Mook group management

#### Phase 3: Player Interface
- Mobile-responsive player view
- Personal wound/impairment display with adjusted values
- Quick attack interface
- **Player weapon attribute display**
- **Player boost action interface**
- Active effects tracking including boost status
- Real-time sync verification

#### Phase 4: Advanced Features
- Boss/Uber-Boss special rules
- Vehicle combat integration
- Status effects (burning, stunned, etc.) with boost integration
- Combat statistics and history
- **Weapon attribute usage statistics**
- **Boost action statistics and tactical analysis**
- Discord bot enhancement for hybrid play

#### Stretch Goal: 3D Dice Rolling
- Integrate 3D dice physics library (three.js + dice-box or similar)
- Visual dice that roll on screen for digital rolls
- Positive die (red/lucky) and negative die (white/death) with exploding 6s
- Click to roll, physics-based animation
- Results automatically populate Swerve field
- Optional for players who prefer visual feedback
- Toggle between 3D dice, simple digital, or physical entry

### Success Metrics
- GM can run a complete combat encounter without external tools
- Players can participate fully from mobile devices
- All combat mechanics from Feng Shui 2 are supported
- **Weapon attributes integrate seamlessly into attack resolution**
- **Boost actions provide meaningful tactical choices**
- **Impairment effects are clearly visible and automatically calculated**
- Real-time updates occur within 500ms
- System handles 6+ participants smoothly

### Migration Strategy
- Preserve existing encounter/fight data structure
- Add new fields via migrations, not replacements
- Maintain backward compatibility with current Discord bot
- Progressive enhancement approach for UI
- **Leverage existing weapon attribute database fields**
- **Add boost tracking fields to existing Character and Shot models**
- **Implement impairment calculations as computed properties**

### Testing Requirements
- Playwright E2E tests for complete combat flow
- Unit tests for damage calculation logic
- **Integration tests for weapon attribute calculations**
- **Unit tests for boost application and expiration logic**
- **Integration tests for impairment calculation accuracy**
- Mobile testing on iOS and Android devices
- Load testing with multiple concurrent players

## Technical Decisions

### State Management
- Continue using React Context for encounter state
- Implement optimistic updates for responsiveness
- Add undo/redo capability for GM actions
- Cache combat log client-side for performance
- **Cache weapon attribute data for attack calculations**
- **Cache boost status for real-time display**
- **Cache impairment calculations to avoid repeated computation**

### Data Model
- Extend Fight model with combat_state JSON field
- Add wounds and impairment to Shot records
- Create CombatAction model for action history
- **Include weapon_id in CombatAction for attribute tracking**
- **Add boost tracking fields to Character and Shot models**
- **Implement impairment as calculated property based on wounds**
- Use PostgreSQL JSON columns for flexible effects

### UI Framework
- Material-UI components throughout
- Custom theme for combat-specific UI
- Mobile-first responsive design
- Accessibility compliance (WCAG 2.1 AA)
- **Consistent weapon attribute visual patterns**
- **Standardized boost indicator design**
- **Clear impairment visual hierarchy**

### Performance Optimizations
- Virtual scrolling for large combat logs
- Debounced updates for health changes
- Lazy loading for player avatars
- WebSocket message batching
- **Efficient weapon attribute lookup caching**
- **Optimized boost status calculations**
- **Memoized impairment calculations**

## Risk Mitigation

### Technical Risks
- **WebSocket stability**: Implement reconnection logic and offline queue
- **State synchronization**: Add conflict resolution for concurrent updates
- **Performance degradation**: Profile and optimize React re-renders
- **Mobile compatibility**: Test early and often on real devices
- **Weapon attribute complexity**: Clear UI patterns and good defaults
- **Boost timing complexity**: Clear expiration rules and visual feedback
- **Impairment calculation errors**: Comprehensive unit tests and validation

### User Experience Risks
- **Complexity overload**: Progressive disclosure of advanced features
- **Learning curve**: In-app tutorials and tooltips
- **Disrupted game flow**: Streamlined UI with keyboard shortcuts
- **Network issues**: Offline mode with sync on reconnect
- **Weapon attribute confusion**: Clear labeling and help text
- **Boost action confusion**: Intuitive interface with clear duration indicators
- **Impairment visibility**: Prominent display without cluttering interface

## New Requirements Integration

### Boost Actions (See boost-actions-spec.md)
- 3-shot team support actions
- Attack boost (+1/+2) and Defense boost (+3/+5)
- Fortune die enhancement option
- Expiration tracking and automatic removal
- Integration with existing combat calculations
- Mobile-friendly interface for players

### Impairment Display & Calculation (See impairment-display-spec.md)
- Automatic impairment calculation from wound thresholds
- Prominent display on character cards and in shot counter
- Real-time adjustment of Attack and Defense Values
- Clear visual format showing base and adjusted values
- Integration with boost actions and weapon attributes
- Color-coded severity indicators

## Definition of Done
- [ ] All Phase 1-4 features implemented and tested
- [ ] **Weapon attributes (mook bonus, ka-chunk) fully integrated**
- [ ] **Boost actions system fully functional with expiration tracking**
- [ ] **Impairment display and automatic calculation implemented**
- [ ] Playwright E2E tests passing including new features
- [ ] Mobile testing completed on iOS/Android
- [ ] Documentation updated for new features
- [ ] Discord bot integration verified with boost/impairment support
- [ ] Performance metrics met (<500ms updates)
- [ ] User can run complete Feng Shui 2 combat session with boost actions and accurate impairment tracking