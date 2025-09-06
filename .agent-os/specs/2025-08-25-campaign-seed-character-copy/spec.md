# Spec Requirements Document

> Spec: Campaign Seed Character Copy
> Created: 2025-08-25
> Status: Planning

## Overview

Enhance the existing CampaignSeederService to copy all Character records from the Master Campaign when a new campaign is created. This provides new campaigns with established NPCs and example enemies to help gamemasters quickly populate their campaigns with ready-to-use characters.

## User Stories

### Automatic Character Population

As a gamemaster creating a new campaign, I want to automatically receive a full set of example characters from the Master Campaign, so that I have immediate access to established NPCs and enemies without needing to create them from scratch.

When I create a new campaign, the system automatically copies all Character records from the Master Campaign into my new campaign. These characters include various NPCs, bosses, featured foes, mooks, and allies that have been curated in the Master Campaign. I can immediately use these characters in my games, modify them as needed, or use them as templates for creating my own characters. This dramatically reduces the time needed to prepare for sessions and provides high-quality examples of well-designed characters.

## Spec Scope

1. **Character Copying** - Modify CampaignSeederService to copy all Character records from the Master Campaign to newly created campaigns
2. **CharacterDuplicator Integration** - Utilize the existing CharacterDuplicator service to handle the character copying process
3. **Automatic Execution** - Ensure character copying happens automatically during campaign creation without user intervention
4. **Master Campaign Identification** - Implement logic to identify and access the Master Campaign for character sourcing

## Out of Scope

- User interface for selecting which characters to copy
- Modification of copied character attributes during the copy process
- Option to skip character copying
- Changes to the CharacterDuplicator service itself
- Copying of other entities (Fights, Sites, Parties, etc.)

## Expected Deliverable

1. When a new campaign is created, all Character records from the Master Campaign are automatically copied to the new campaign
2. The copied characters are fully functional and editable within the new campaign
3. The existing campaign creation flow remains unchanged from the user's perspective

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-25-campaign-seed-character-copy/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-25-campaign-seed-character-copy/sub-specs/technical-spec.md