# Player Encounter View Plan

## Objective
Create a dedicated, character-specific view for players to manage their participation in a fight. This view will focus on the individual's status, resources, and actions, simplifying the interface compared to the full "GM/Timeline" view.

## Architecture

### 1. New Route
`src/app/(main)/encounters/[id]/play/[characterId]/page.tsx`
- **Role:** Entry point for the player view.
- **Functionality:**
    - Server-side: Fetches the `Encounter` using `getServerClient`.
    - Renders `EncounterProvider`.
    - Wraps and passes data to `PlayerEncounterView`.

### 2. Main Container Component
`src/components/encounters/player/PlayerEncounterView.tsx`
- **Role:** Orchestrator of the player UI.
- **Props:** `characterId: string`.
- **State:**
    - `activeAction`: 'attack' | 'boost' | 'heal' | 'cheese' | null.
- **Context Usage:**
    - `useEncounter` for real-time updates via `encounter.shots`, `encounter.character_effects`.
    - `useClient` for API calls (resource spending).
- **Layout:**
    - **Header:** Character Name, Avatar.
    - **Status Bar:** Current Shot, Wounds/Health, Active Effects.
    - **Resources:** Cards/Chips for Fortune, Chi, Magic, Genome, with "Spend" controls.
    - **Action Grid:** Large, touch-friendly buttons for primary actions.
    - **Active Action Panel:** Modal or expanding section to show `AttackPanel` etc.

### 3. Sub-Components

#### `PlayerStatus.tsx`
- **Displays:**
    - **Wounds:** Progress bar or numeric display (Current / Max if available, or just accumulating wounds).
    - **Shot:** Large number indicating current shot.
    - **Effects:** List of `CharacterEffect` items (Buffs/Debuffs) active on the character.

#### `PlayerResources.tsx`
- **Logic:**
    - specific fields from `character.action_values` (Fortune, Chi, etc.).
    - "Spend" button triggers API call to `client.updateCharacterCombatStats`.
    - Optimistic update locally or wait for websocket refresh (EncounterContext handles websocket).

#### `PlayerActions.tsx`
- **Layout:** Grid of buttons.
- **Items:**
    - Attack (opens AttackPanel).
    - Boost (opens BoostPanel).
    - Cheese It (opens CheeseItPanel).
    - Heal (opens HealPanel).
    - "Wait / Delay" (Simple shot spend).

### 4. Integration with Existing Panels
- **AttackPanel:** Reuse existing `AttackPanel`.
    - Pass `preselectedAttacker={character}`.
    - Wrap in a `Dialog` or `Drawer` for mobile focus.
    - Ensure `onComplete` closes the dialog.

### 5. Data Flow
1.  **Initial Load:** Page fetches `Encounter`.
2.  **Updates:** `EncounterContext` subscribes to Action Cable channel (already implemented).
3.  **Actions:**
    - **Attacks:** Handled by `AttackPanel` logic (uses `client.spendShots` / `client.updateShot` internally).
    - **Resources:** New handlers in `PlayerResources` calling `client.updateCharacterCombatStats`.

## Implementation Steps

1.  **Route Creation:** Create `src/app/(main)/encounters/[id]/play/[characterId]/page.tsx`.
2.  **View Scaffold:** Create `src/components/encounters/player/PlayerEncounterView.tsx`.
3.  **Status Component:** Implement `PlayerStatus`.
4.  **Resource Component:** Implement `PlayerResources` with spending logic.
5.  **Action Integration:** Add `PlayerActions` and connect `AttackPanel` inside a Modal.
6.  **Testing:** Verify real-time updates when GM makes changes in another window.

## Considerations
- **Mobile First:** Design for phone screens as players often use phones at the table.
- **Optimistic Updates:** Ensure resource spending feels instant.
- **Safety:** Ensure `characterId` belongs to the user (or is at least valid in the encounter).
