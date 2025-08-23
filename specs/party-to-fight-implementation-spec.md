# Party to Fight Implementation Specification

**Date**: 2025-08-23  
**Status**: Active  
**Component**: Frontend Client-Side Implementation

## Overview

Implement party-to-fight functionality using client-side ID merging, leveraging Rails' built-in association handling. No backend changes required.

## Technical Approach

### Rails Association Magic
Rails automatically provides `character_ids=` and `vehicle_ids=` setter methods through the existing associations:
```ruby
# Fight model already has:
has_many :shots, dependent: :destroy
has_many :characters, through: :shots
has_many :vehicles, through: :shots
```

When we update a fight with new `character_ids`, Rails automatically:
- Creates new Shot records for added characters (with `shot: nil` by default)
- Removes Shot records for removed characters
- Handles all join table management

### Client-Side Implementation

The implementation follows the exact same pattern used for:
- Adding individual characters to a fight
- Adding characters to a party
- Updating fight properties like name or description

```typescript
const handleAddParty = (party: Party) => {
  // Merge the party's IDs with the fight's existing IDs
  const updatedFight = {
    ...fight,
    character_ids: [...(fight.character_ids || []), ...party.character_ids],
    vehicle_ids: [...(fight.vehicle_ids || []), ...party.vehicle_ids]
  };
  
  // Call updateEntity - same as updating fight name
  updateEntity(updatedFight);
  toastSuccess("Party added successfully");
};
```

## Components Required

### 1. PartyFilter Component
**Purpose**: Dropdown to select a party from current campaign

```typescript
interface PartyFilterProps {
  value?: Party | null;
  onChange: (party: Party | null) => void;
  disabled?: boolean;
}
```

**Implementation**:
- Uses existing autocomplete pattern
- Fetches parties from current campaign
- Returns full party object with `character_ids` and `vehicle_ids`

### 2. AddPartyToFightButton Component
**Purpose**: Button to trigger the party addition

```typescript
interface AddPartyToFightButtonProps {
  party: Party | null;
  fight: Fight;
  updateEntity: (entity: Fight) => Promise<void>;
  disabled?: boolean;
}
```

**Implementation**:
- Disabled when no party selected
- Merges party IDs with fight IDs
- Calls `updateEntity` with merged data
- Shows loading state during update

### 3. PartyToFightSection Component
**Purpose**: Container combining dropdown and button

```typescript
interface PartyToFightSectionProps {
  fight: Fight;
  updateEntity: (entity: Fight) => Promise<void>;
}
```

**Implementation**:
- Manages selected party state
- Handles the merge and update logic
- Provides success/error feedback

## Integration with Fight Page

Add to Fight Show component above existing Manager components:

```tsx
<PartyToFightSection 
  fight={fight} 
  updateEntity={updateEntity}
/>

{/* Existing Manager components */}
<Manager
  parentEntity={fight}
  childEntityName="Character"
  onListUpdate={updateEntity}
  excludeIds={fight.character_ids || []}
/>
```

## Data Flow

1. **User selects party** from PartyFilter dropdown
2. **User clicks Add button**
3. **Frontend merges IDs**:
   ```typescript
   fight.character_ids = [...existing, ...party.character_ids]
   fight.vehicle_ids = [...existing, ...party.vehicle_ids]
   ```
4. **Call updateEntity** with merged fight data
5. **Rails backend**:
   - Receives updated character_ids/vehicle_ids
   - Automatically creates/removes Shot records
   - Broadcasts updates via WebSocket
6. **UI updates** automatically via subscription

## Key Benefits

- ✅ **No backend changes required** - Rails handles everything
- ✅ **Consistent pattern** - Same as all other entity updates
- ✅ **Simple implementation** - Just array merging and updateEntity
- ✅ **Automatic Shot creation** - Rails creates with `shot: nil` (hidden)
- ✅ **Real-time updates** - WebSocket broadcasts work automatically
- ✅ **Optimistic UI** - Immediate feedback to user

## Testing Approach

### Unit Tests
- PartyFilter renders and handles selection
- AddPartyToFightButton merges IDs correctly
- PartyToFightSection coordinates components

### Integration Test
- Mock updateEntity function
- Verify correct fight object passed with merged IDs
- Verify toast notifications

### E2E Test (Playwright)
1. Login as gamemaster
2. Navigate to fight page
3. Select "The Heroes" party
4. Click "Add Party to Fight"
5. Verify toast: "Party added successfully"
6. Verify characters appear in fight list

## Implementation Notes

- Fight's `character_ids` may not be populated initially (could be undefined)
- Always use spread operator with fallback: `[...(fight.character_ids || [])]`
- Party members can be added multiple times (important for mooks)
- No need to check for duplicates - Rails handles this appropriately
- Shot records created with `shot: nil` means "hidden" in fight UI

## Comparison with Alternative Approaches

### Why Not Use Dedicated API Endpoint?
- Already have working `updateEntity` pattern
- Keeps consistency with other UI operations
- Simpler frontend code
- Less API surface area to maintain

### Why Not Custom Backend Logic?
- Rails associations already handle this perfectly
- No need for custom setters or callbacks
- Leverages framework capabilities
- Maintains simplicity

## Success Criteria

✅ Party members added to fight with single action  
✅ Uses standard `updateEntity` flow  
✅ No backend modifications needed  
✅ Consistent with existing patterns  
✅ Real-time updates work automatically  
✅ Toast notification provides feedback