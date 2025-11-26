# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-26-player-fight-join-link/spec.md

## Technical Requirements

### Data Available

The `ActiveFightBanner` component already receives:
- `campaignId: string`
- `userId: string` (currently unused in implementation)
- `isGamemaster?: boolean` (currently unused in implementation)

The `currentFight: Fight` object includes:
- `characters?: Character[]` - array of characters in the fight
- Each `Character` has a `user_id?: string` property indicating ownership

### Implementation Approach

1. **Find User's Character in Fight**
   - Filter `currentFight.characters` to find characters where `character.user_id === userId`
   - Use the first matching character (if any)
   - Store result in component state or compute on render

2. **Conditional Button Rendering**
   - If `userCharacter` exists: Show "Play as [Character Name]" button linking to player view
   - The existing "Join Fight" button goes to encounter management view
   - Both buttons can be shown if the user is both a player and gamemaster with a character in the fight

3. **Navigation URL**
   - Player view URL: `/encounters/${currentFight.id}/play/${userCharacter.id}`
   - Encounter management URL (existing): `/encounters/${currentFight.id}`

### Component Changes

**File: `src/components/dashboard/ActiveFightBanner.tsx`**

```typescript
// Add state or computed value for user's character
const userCharacter = useMemo(() => {
  if (!currentFight?.characters || !userId) return null
  return currentFight.characters.find(char => char.user_id === userId) || null
}, [currentFight?.characters, userId])

// Add handler for player view navigation
const handlePlayAsCharacter = () => {
  if (currentFight && userCharacter) {
    router.push(`/encounters/${currentFight.id}/play/${userCharacter.id}`)
  }
}
```

### UI/UX Specifications

- Button styling should match existing "Join Fight" button
- Button text: "Play as [Character Name]" to clearly indicate which character
- If both buttons shown, stack vertically on mobile, side-by-side on larger screens
- Use a distinct icon (e.g., user/person icon) to differentiate from the management view button

### Edge Cases

1. **User has no character in fight**: Only show existing "Join Fight" button (to encounter management)
2. **User has multiple characters in fight**: Use first character found, link to their player view
3. **User is gamemaster with a character**: Show both buttons
4. **Fight has no characters yet**: Only show existing button
5. **Character array not loaded**: Fall back to existing button only

## Files to Modify

- `src/components/dashboard/ActiveFightBanner.tsx` - Main implementation

## Testing Considerations

- Test with user who has character in fight (should see player view button)
- Test with user who has no character in fight (should only see management button)
- Test with gamemaster who also has character (should see both buttons)
- Verify correct URL is generated for player view
- Verify navigation works correctly
