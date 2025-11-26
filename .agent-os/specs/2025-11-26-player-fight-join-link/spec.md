# Spec Requirements Document

> Spec: Player Fight Join Link
> Created: 2025-11-26

## Overview

Add a "Join Fight" link to the Active Fight Banner on the dashboard that allows players to quickly access the player view when their character is participating in an active fight. This provides players with a direct entry point to engage with ongoing encounters.

## User Stories

### Player Joins Active Fight

As a player with a character in an active fight, I want to see a "Join Fight" button on the Active Fight Banner, so that I can quickly access the player view for my character and participate in the encounter.

When I log in or view the dashboard and there's an active fight in my campaign:
1. The Active Fight Banner displays as it currently does
2. If I own a character that is participating in that fight (via shots), I see a "Join Fight" link
3. Clicking the link takes me to `/encounters/[fightId]/play/[characterId]` for my character
4. If I have multiple characters in the fight (rare), the link uses my first matching character

### Character Detail Page Banner (Secondary)

As a player viewing my character's detail page, I want to see a banner indicating my character is in an active fight, so that I can quickly join the encounter from the character page.

When viewing a character detail page:
1. If that character is currently in an active fight, show a banner
2. The banner displays the fight name and links to the player view for that character

## Spec Scope

1. **Active Fight Banner Enhancement** - Add conditional "Join Fight" button to ActiveFightBanner component when the logged-in user owns a character in the fight
2. **Character Ownership Check** - Implement logic to find the first character owned by the current user that is participating in the fight
3. **Player View Navigation** - Generate the correct player view URL (`/encounters/[id]/play/[characterId]`) for the user's character

## Out of Scope

- Multiple character selection UI (use first matching character)
- WebSocket-based real-time character ownership updates
- Adding player view links to other pages beyond the dashboard banner
- Character detail page banner (can be implemented later)
- Push notifications when fights start

## Expected Deliverable

1. When a player with a character in an active fight views the dashboard, they see a "Join Fight" button that navigates to the player view for their character
2. The button only appears if the logged-in user owns at least one character currently in the fight
3. Gamemasters continue to see the existing "Join Fight" link to the encounter management view
