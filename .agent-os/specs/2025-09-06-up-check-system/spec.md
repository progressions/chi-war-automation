# Spec Requirements Document

> Spec: Up Check System
> Created: 2025-09-06

## Overview

Implement an Up Check system that triggers when PC characters exceed their wound threshold, requiring them to make a Toughness-based check to stay active in combat. This feature enforces the Feng Shui 2 RPG rule where characters reaching critical wounds must test their resilience or be taken out of the fight.

## User Stories

### PC Making an Up Check

As a player controlling a PC character, I want to be prompted to make an Up Check when my character's wounds exceed their threshold, so that I can determine if my character stays active or is taken out of the fight.

When a PC character takes damage that causes their wounds to exceed their wound threshold, the system automatically assigns a Mark of Death and prompts for an Up Check. The player rolls a Swerve value (dice roll) which is added to their character's Toughness. If the total equals or exceeds 5, the character succeeds and remains active. If not, the character is marked as "Out of the fight". Players can optionally spend a Fortune point to add another die to their Swerve roll, improving their chances of success.

### Gamemaster Managing Up Checks

As a gamemaster, I want to see when PC characters need to make Up Checks and track their status, so that I can manage combat flow and ensure rules are properly enforced.

The gamemaster can see when any PC character has exceeded their wound threshold and needs to make an Up Check. The action bar displays an Up Check button when a PC needs to make this check, which opens the Up Check Panel consistent with other action panels like Attack Panel and Heal Panel. The system tracks whether characters are "Up" or "Out" after their checks, and the combat interface updates in real-time to reflect character status changes.

### Special Wound Threshold Cases

As a gamemaster, I want certain character archetypes to have different wound thresholds, so that special abilities like the Big Bruiser's increased resilience are properly represented.

The system supports wound threshold overrides in the action_values["Wound Threshold"] field. For example, the Big Bruiser archetype has a special wound threshold of 50 instead of the standard 35, reflecting their exceptional toughness.

## Spec Scope

1. **Up Check Trigger System** - Automatically detect when PC wounds exceed threshold and trigger Up Check requirement
2. **Up Check Panel** - Action panel for players to input Swerve roll and see Toughness calculation, consistent with AttackPanel, HealPanel, etc.
3. **Fortune Point Integration** - Option to spend Fortune point for additional die on Up Check
4. **Combat Status Updates** - Real-time status changes ("Up" or "Out") via apply_combat_action API
5. **Wound Threshold Overrides** - Support for custom thresholds in action_values["Wound Threshold"]

## Out of Scope

- NPC Up Check mechanics (NPCs typically don't make Up Checks)
- Automatic dice rolling (players input their Swerve roll result)
- Recovery mechanics for characters marked "Out of the fight"
- Historical tracking of past Up Check results

## Expected Deliverable

1. When a PC character's wounds exceed their threshold, a Mark of Death is automatically applied and an Up Check button appears in the action bar
2. Players can perform Up Checks through the Up Check Panel showing Swerve + Toughness calculation with optional Fortune point usage
3. Character status updates to "Up" or "Out" based on check results, synchronized across all connected clients via WebSocket

## Spec Documentation

- Tasks: @.agent-os/specs/2025-09-06-up-check-system/tasks.md
- Technical Specification: @.agent-os/specs/2025-09-06-up-check-system/sub-specs/technical-spec.md