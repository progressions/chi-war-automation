# Encounter Manager UI Revision

**Date:** 2025-01-04
**Status:** In Progress
**Author:** Isaac Priestley

## Overview

This specification describes a major revision to the encounter manager UI to improve usability by making character selection the primary action, followed by available actions appearing contextually.

## Problem Statement

The current encounter manager UI requires users to:
1. Click on an action (Attack, Boost, Chase)
2. Select an acting character within that panel
3. Select targets
4. Apply the action

This creates redundancy as users must select their character repeatedly for different actions.

## Proposed Solution

Elevate character selection to the top level of the encounter manager:
1. Display all characters with shot labels at the top
2. User selects their character first
3. Available actions appear based on the selected character
4. Clicking an action opens the relevant panel with the character pre-selected

## Implementation Details

### 1. Primary Character Selector
- **Location**: Top of encounter manager, above all other elements
- **Display**: Horizontal row of character avatars grouped by shot position
- **Shot Labels**: Display just the number (e.g., "12" not "Shot 12") before each shot group
- **Selection**: Click to select, click again to deselect
- **State Management**: Selection stored in EncounterContext

### 2. Encounter Action Bar
- **Visibility**: Only appears when a character is selected
- **Content**: 
  - Character name and type info
  - Action buttons (Attack, Boost, Chase, Heal, Other)
- **Buttons**: Icon-only using existing icons (FaGun, FaRocket, FaCar, etc.)
- **No Close Button**: Users deselect by clicking the character again

### 3. Action Panels Modification

**CRITICAL REQUIREMENT**: Remove character selectors from action panels

- **AttackPanel**: 
  - REMOVE AttackerSection when preselectedAttacker is provided
  - Start directly with target selection
  - Character is already selected from primary selector

- **BoostPanel**:
  - REMOVE booster CharacterSelector when preselectedBooster is provided
  - Start directly with target selection
  - Booster is already selected from primary selector

- **ChasePanel**:
  - REMOVE ChaseAttackerSection when preselectedCharacter is provided
  - Start directly with target/vehicle selection
  - Character is already selected from primary selector

- **HealPanel** & **OtherActionPanel**:
  - Display as inline panels (NOT modal dialogs)
  - Character info shown but not selectable
  - Action configuration only

### 4. User Flow

1. User views encounter with all characters displayed at top
2. User clicks on their character (e.g., "Jake" at Shot 15)
3. EncounterActionBar appears showing available actions
4. User clicks "Attack" button
5. AttackPanel opens showing ONLY target selection (no attacker selection)
6. User selects target(s) and resolves attack
7. Panel closes, character remains selected for next action
8. User can click character again to deselect, or select different character

### 5. Mobile Optimization
- Smaller avatars on mobile (48px vs 64px)
- Reduced shot label size (1rem vs 1.25rem)
- Compact character boxes (60px vs 80px)
- Hide auxiliary chips on mobile

## Benefits

1. **Reduced Clicks**: Select character once for multiple actions
2. **Clear Context**: Always know which character is acting
3. **Streamlined Flow**: Direct path from character to action to resolution
4. **Better Mobile UX**: Optimized touch targets and spacing

## Technical Implementation

### Files Modified
- `src/components/encounters/CharacterSelector.tsx` - Added shot labels
- `src/contexts/EncounterContext.tsx` - Added selection state management
- `src/components/encounters/ShotCounter.tsx` - Integrated top-level selector
- `src/components/encounters/EncounterActionBar.tsx` - New component for actions
- `src/components/encounters/AttackPanel.tsx` - Hide attacker selection when preselected
- `src/components/encounters/BoostPanel.tsx` - Hide booster selection when preselected
- `src/components/encounters/ChasePanel.tsx` - Hide attacker selection when preselected
- `src/components/encounters/HealPanel.tsx` - New panel (not dialog)
- `src/components/encounters/OtherActionPanel.tsx` - New panel (not dialog)

## Testing Checklist

- [ ] Character selection persists across action panels
- [ ] Clicking selected character deselects it
- [ ] Action panels skip character selection when preselected
- [ ] Mobile layout displays correctly
- [ ] All actions accessible from action bar
- [ ] Panels display inline, not as modals

## Future Enhancements

- Keyboard shortcuts for common actions
- Multi-select mode for group actions
- Character status indicators in selector
- Action history/undo functionality