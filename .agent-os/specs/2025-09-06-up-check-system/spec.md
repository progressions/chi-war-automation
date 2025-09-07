# Spec Requirements Document

> Spec: Up Check System
> Created: 2025-09-06
> Status: Planning

## Overview

Implement an Up Check system for player characters (PCs) that triggers when they exceed their wound threshold (typically 35 wounds), requiring them to roll a check to stay in combat or be defeated. This feature adds critical decision points during combat when PCs take severe damage, enhancing the strategic depth of the Feng Shui 2 combat system.

## User Stories

### PC Making an Up Check

As a player with a wounded character, I want to make an Up Check when my character exceeds their wound threshold, so that I can determine whether my character stays in the fight or is defeated.

When my PC character takes damage that brings their total wounds to 35 or higher, a Mark of Death is automatically added to their action_values, and an "up_check_required" status is set. When I select this character, an "Up Check" button appears in the Action Bar. I click the Up Check button to open a panel where I can enter my Swerve roll and optionally add a Fortune die result (which costs a Fortune point and adds another Mark of Death). The panel shows the calculation preview just like Attack and Chase panels. After clicking "Resolve", the system calculates whether my roll plus Toughness meets the threshold of 5. If successful, my character continues fighting and may face additional Up Checks if wounded further; if failed, my character gains "out_of_fight" status and is removed from active combat.

### Gamemaster Managing Defeated Characters

As a gamemaster, I want to see clear status indicators for characters who have failed Up Checks or been defeated, so that I can manage combat flow and narrative consequences appropriately.

When any character (PC, NPC, or Mook) is defeated, their status immediately updates to "out_of_fight" and their character card displays a visual indicator showing they are defeated. The character is automatically removed from the initiative order. For PCs who fail Up Checks, the system logs the event in fight_events for reference. I can manually override or clear status effects through the Edit Character dialog when needed, allowing narrative flexibility for dramatic moments or healing interventions.

## Spec Scope

1. **Up Check Trigger System** - Automatically detect when PC characters reach or exceed wound threshold and require an Up Check
2. **Up Check Panel UI** - New panel interface matching existing combat panels for entering Swerve and Fortune rolls
3. **Action Bar Integration** - Conditional "Up Check" button that appears only when selected PC requires the check
4. **Status Management** - New character status field supporting "up_check_required" and "out_of_fight" states
5. **Combat Resolution** - Integration with encounters controller to process Up Check results and update character state

## Out of Scope

- Up Checks for NPCs (only PCs make Up Checks per Feng Shui 2 rules)
- Automatic Fortune die rolls (players must manually enter if used)
- Customizable wound thresholds per character (will use standard thresholds from SharedService)
- Automatic recovery mechanics for "out_of_fight" characters (GM can manually clear status)
- Maximum Marks of Death limit (will be addressed in future feature)

## Expected Deliverable

1. When a PC reaches 35+ wounds, an "Up Check" button appears in the Action Bar and clicking it opens a panel to enter roll results
2. Successfully completing an Up Check (Swerve + Fortune + Toughness >= 5) allows the character to continue fighting until damaged again
3. Failed Up Checks immediately update the character's status to "out_of_fight" and remove them from active combat

## Spec Documentation

- Tasks: @.agent-os/specs/2025-09-06-up-check-system/tasks.md
- Technical Specification: @.agent-os/specs/2025-09-06-up-check-system/sub-specs/technical-spec.md