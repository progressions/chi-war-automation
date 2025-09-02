# Spec Requirements Document

> Spec: Character Edit Dialog
> Created: 2025-09-02

## Overview

Add an edit button to each character in the encounters page that opens a compact dialog for quick editing of combat-critical attributes during gameplay. This feature enhances the gamemaster experience during combat by allowing rapid updates to character stats without navigating away from the encounter view.

## User Stories

### Quick Combat Stat Editing

As a gamemaster running a combat encounter, I want to quickly edit character stats like wounds, impairments, and initiative position, so that I can efficiently manage the combat state without disrupting the game flow.

When I'm viewing the encounters page with active characters, I see a small edit button (pencil icon) next to each character alongside the existing action buttons. When I click this button, a compact dialog opens with form fields for the character's name, current shot (initiative), wound total, impairments, and marks of death. All fields are pre-populated with current values. After making changes and clicking save, the dialog closes and the encounter view updates immediately with the new values, and all other connected players see the updates in real-time.

### Character Type Handling

As a gamemaster, I want the edit dialog to correctly handle different character types (PC vs NPC), so that impairments are stored in the right location based on the character's type.

When I edit a PC (Player Character), impairments are stored on the character model itself. When I edit any other character type (Ally, Mook, Featured Foe, Boss, Uber-Boss), impairments are stored on the shot association record. The dialog handles this logic transparently without requiring me to understand the technical differences.

## Spec Scope

1. **Edit Button Integration** - Add edit button to CharacterDetail component in encounters view
2. **Character Edit Dialog Component** - Create compact dialog with form fields for combat-critical attributes
3. **Form State Management** - Implement local state with optimistic updates and error rollback
4. **API Integration** - Support both character and shot updates through existing V2 APIs
5. **Real-time Updates** - Ensure WebSocket broadcasting updates all connected clients
6. **Character Type Logic** - Handle PC vs non-PC impairment storage differences

## Out of Scope

- Vehicle edit functionality (will be addressed separately)
- Batch editing multiple characters
- Character creation or deletion
- Non-combat attribute editing (backstory, equipment, etc.)
- Undo/redo functionality
- Advanced combat action handling

## Expected Deliverable

1. Edit button appears on each character in encounters view
2. Dialog opens with current values pre-populated in editable form fields
3. Saves correctly route to appropriate backend endpoints based on character type
4. Real-time updates broadcast to all connected clients via WebSocket
5. Error handling with user feedback and graceful degradation