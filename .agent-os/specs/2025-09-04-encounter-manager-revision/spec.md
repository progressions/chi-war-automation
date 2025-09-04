# Spec Requirements Document

> Spec: Encounter Manager UI Revision
> Created: 2025-09-04
> Status: Planning

## Overview

Redesign the encounter manager interface to make character selection the primary interaction model, displaying characters grouped by their shot position in the initiative order. This revision will streamline combat workflow by presenting available characters first, then offering action choices, reducing clicks and improving visual clarity during encounters.

## User Stories

### Primary Combat Flow

As a gamemaster running an encounter, I want to see all characters organized by their current shot position, so that I can quickly identify who can act and select them to perform actions.

When I enter the encounter view, I immediately see characters grouped by their shot positions (e.g., "Shot 12", "Shot 10", etc.) displayed as circular avatars. I click on a character's avatar to select them, which then reveals available action buttons (Attack, Boost, Chase, etc.) specific to that character. This eliminates the need to first choose an action type and then hunt for the character, making combat resolution faster and more intuitive.

### Quick Action Selection

As a player managing multiple characters, I want to quickly switch between characters at the same shot count, so that I can resolve all actions for characters acting simultaneously.

When multiple characters are on the same shot (e.g., three characters at Shot 8), I see them grouped together under the shot label. I can rapidly click between these characters and assign different actions to each without navigating back to a menu, maintaining combat momentum.

## Spec Scope

1. **Add Shot Labels to CharacterSelector** - Enhance the existing CharacterSelector component by adding shot position labels before each group
2. **Elevate CharacterSelector** - Move the CharacterSelector from inside action panels to the top level of the encounter manager
3. **Contextual Action Menu** - Display available actions (Attack, Boost, Chase, etc.) only after character selection
4. **Pre-select Character in Panels** - Pass selected character to action panels so they skip the selection step
5. **Maintain Existing Behavior** - Keep all current CharacterSelector functionality (grouping, ordering, selection) unchanged

## Out of Scope

- Changes to the underlying combat resolution mechanics
- Modifications to individual action panels (AttackPanel, BoostPanel, ChasePanel)
- Alterations to the shot counter countdown logic
- Mobile-specific responsive layouts (will use existing responsive patterns)
- Keyboard shortcuts for character selection

## Expected Deliverable

1. Characters displayed in shot-grouped sections at the top of the encounter manager, replacing or augmenting the current shot counter display
2. Clicking a character avatar selects them and reveals available action buttons below
3. Action panels (Attack, Boost, Chase) open with the selected character pre-populated as the actor

## Spec Documentation

- Tasks: @.agent-os/specs/2025-09-04-encounter-manager-revision/tasks.md
- Technical Specification: @.agent-os/specs/2025-09-04-encounter-manager-revision/sub-specs/technical-spec.md