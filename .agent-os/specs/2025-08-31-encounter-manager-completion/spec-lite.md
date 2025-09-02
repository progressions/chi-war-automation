# Encounter Manager Completion - Executive Summary

## Overview
Complete the Chi War encounter management system to enable running live Feng Shui 2 tabletop RPG sessions with physical dice and GM override capabilities.

## Problem
- Current system only has basic shot counter
- No attack resolution or damage tracking
- No support for physical dice or manual overrides
- Missing critical combat features for running actual games

## Solution
Build a comprehensive GM helper tool (not a video game) with:
- **Attack Interface**: Select attacker, skill, weapon, target with full manual overrides
- **Swerve/Dice Support**: Enter results from physical dice or use digital helper
- **Proper Terminology**: Action Value → Action Result → Outcome → Smackdown → Wounds
- **Wound Tracking**: 0 = healthy, impairment at 30/35 for PCs
- **Boost Actions**: 3-shot team support actions for tactical cooperation
- **Impairment Display**: Automatic calculation and prominent display of combat penalties
- **Fight Management**: Add/remove/hide characters during combat
- **Mobile Support**: Players can use phones at the table

## Key Features

### Phase 1: Attack & Damage System
- Attack interface with Swerve entry
- Damage calculation with proper Feng Shui 2 formulas
- Manual override for every value
- Dodge action (1 shot for +3 Defense)
- Stunt modifier (+2 Defense)
- **Boost Actions**: Attack boost (+1/+2) and Defense boost (+3/+5) with Fortune die enhancement
- **Enhanced Impairment**: Automatic calculation and display of AV/DV penalties

### Phase 2: Enhanced Shot Counter
- Multiple characters per shot
- Hide/unhide characters (shot: null)
- Add/remove participants mid-fight
- Drag-and-drop initiative changes
- Hidden character section
- **Impairment display**: Show adjusted combat values on character cards
- **Boost indicators**: Visual display of active boosts and expiration

### Phase 3: Player Interface
- Mobile-optimized view
- Personal wound tracking with impairment display
- Quick action buttons including boost actions
- Real-time sync with GM
- **Adjusted combat values**: Show base and impairment-modified stats

### Phase 4: Advanced Features
- Combat log with full history including boost actions
- Status effects (burning, stunned) with boost integration
- Mook squad management
- Discord integration with boost/impairment notifications

## New Requirements Added

### 1. Boost Actions System
- **Purpose**: Team support actions that allow players to help each other
- **Mechanics**: 3-shot action to boost ally's attack (+1/+2) or defense (+3/+5)
- **Enhancement**: Fortune die option for stronger effects
- **Duration**: Attack boost lasts for next attack, defense boost for next shot
- **UI**: BoostPanel component with target selection and boost type choice
- **Integration**: Boost effects factor into all attack/defense calculations

### 2. Impairment Display & Calculation
- **Purpose**: Show how wounds affect combat effectiveness
- **Mechanics**: Automatic calculation of AV/DV penalties from wound thresholds
- **Display**: Show both base and adjusted values (e.g., "AV 15 (-1) = 14")
- **Visual**: Color-coded impairment levels with prominent indicators
- **Integration**: Impairment automatically applied to all combat calculations
- **Real-time**: Updates immediately when wounds change

## Success Metrics
- GM can run complete combat without external tools
- All values manually overrideable
- Support for physical dice
- Mobile-friendly for players
- Real-time updates < 500ms
- **Boost actions provide tactical team options**
- **Impairment effects clearly visible and automatically calculated**

## Timeline
- Week 1: Attack & damage system with boost actions and impairment display
- Week 2: Shot counter enhancements with boost/impairment integration
- Week 3: Player interface with boost actions and impairment display
- Week 4: Advanced features including boost statistics
- Week 5: Testing & polish
- Stretch: 3D dice rolling with physics

## Technical Approach
- Material-UI components
- React Context for state
- ActionCable WebSockets
- Manual override fields throughout
- Mobile-first responsive design
- **Dedicated boost tracking in database**
- **Impairment calculation utilities**
- **Enhanced combat math with all modifiers**

## Related Specifications
- **boost-actions-spec.md**: Detailed boost action mechanics and implementation
- **impairment-display-spec.md**: Comprehensive impairment calculation and display requirements
- **weapon-attributes-spec.md**: Existing weapon attribute integration
- **feng-shui-2-combat-rules.md**: Core combat system requirements