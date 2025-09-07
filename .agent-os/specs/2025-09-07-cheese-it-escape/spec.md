# Spec Requirements Document

> Spec: Cheese It Escape Feature
> Created: 2025-09-07

## Overview

Implement an escape mechanism allowing characters to attempt fleeing from combat using the character.status field. This feature provides a tactical retreat option where characters can "Cheese It" (escape) and other characters can prevent their escape through Speed checks.

## User Stories

### Player Escaping Combat

As a player, I want to click a "Cheese It" button in the Action Bar to attempt escaping from a fight, so that I can tactically retreat when combat becomes unfavorable.

When I click "Cheese It", my character enters a "cheesing_it" status and spends 3 shots (or 2 shots if my character is a Boss/Uber-Boss). Other characters who act after me in the current sequence can make a Speed check to prevent my escape - this includes anyone acting on my current shot after me, or on any lower shot number before my next turn. There is only one chance to stop the escape. If a prevention attempt fails, I gain "cheesed_it" status (successfully escaped but remain in the fight display). If a prevention attempt succeeds, my "cheesing_it" status is removed and I remain in the fight.

### Gamemaster Preventing Escape

As a gamemaster, I want to see when characters are attempting to escape and have the option to make Speed checks to prevent their escape, so that I can maintain dramatic tension and enforce consequences.

When a character attempts to escape, I see a clear indicator and can click a "Prevent Escape" button on any of my NPCs who act after the escaping character in the shot order. This opens a Prevent Escape Panel (like Attack Panel, Boost Panel, etc.) where I manually enter a Swerve value (and optionally Fortune for PCs) in NumberFields. When I click Resolve, if my character's Speed + Swerve + Fortune >= the escaping character's Speed, I successfully stop them. Only one prevention attempt is allowed per escape - if it fails, the character gains "cheesed_it" status.

### Multiple Escape Attempts

As a player or gamemaster, I want to track multiple simultaneous escape attempts and prevention attempts, so that complex tactical retreats can be managed smoothly.

The system tracks all characters with "cheesing_it" status and shows which characters are eligible to prevent each escape (those acting after the escaping character in shot order). Once a prevention attempt is made (successful or not), no further prevention attempts are allowed. The UI updates immediately to show either "cheesed_it" status (escaped) or removal of "cheesing_it" status (prevented).

## Spec Scope

1. **Cheese It Button** - Add escape attempt button to the Action Bar (alongside Attack, Chase, Heal, Boost) that sets "cheesing_it" status and deducts 3 shots (2 for Boss/Uber-Boss)
2. **Prevent Escape Button** - Add prevention button for characters acting after the escaping character to initiate Speed check contest (one attempt only)
3. **Speed Check Resolution** - Implement manual Speed check with Swerve NumberField (and optional Fortune for PCs) where preventer's Speed + Swerve + Fortune must >= escaper's Speed
4. **Status Tracking** - Use character.status field to track "cheesing_it" (attempting) and "cheesed_it" (successfully escaped)
5. **UI Indicators** - Visual indicators showing who is attempting escape and who can prevent it

## Out of Scope

- Escape penalties or consequences (wounds, lost items, etc.)
- Chase scene mechanics if escape is partially prevented
- Escape restrictions based on environment or special abilities
- Group escape coordination mechanics
- Automatic NPC escape AI behavior

## Expected Deliverable

1. Characters can click "Cheese It" to spend 3 shots (2 for Boss/Uber-Boss) and enter "cheesing_it" status visible to all players
2. Characters acting after the escaper see "Prevent Escape" option with manual Swerve entry and Resolve button (one attempt only)
3. Failed prevention grants "cheesed_it" status to escaper, successful prevention removes "cheesing_it" status and keeps character in fight