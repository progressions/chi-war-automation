# Tasks

> Spec: Player Fight Join Link
> Created: 2025-11-26

## Implementation Tasks

- [ ] **Task 1: Add user character detection to ActiveFightBanner**
  - [ ] Add useMemo hook to find user's character in currentFight.characters
  - [ ] Filter by character.user_id === userId
  - [ ] Return first matching character or null

- [ ] **Task 2: Add player view navigation handler**
  - [ ] Create handlePlayAsCharacter function
  - [ ] Navigate to `/encounters/${currentFight.id}/play/${userCharacter.id}`
  - [ ] Only active when userCharacter exists

- [ ] **Task 3: Add conditional "Play as [Character Name]" button**
  - [ ] Render button only when userCharacter is found
  - [ ] Display character name in button text
  - [ ] Match existing button styling
  - [ ] Use appropriate icon (person/user icon)

- [ ] **Task 4: Handle UI layout for multiple buttons**
  - [ ] Ensure both buttons can display (existing "Join Fight" + new player view button)
  - [ ] Stack vertically on mobile, side-by-side on larger screens
  - [ ] Maintain visual consistency

- [ ] **Task 5: Manual testing**
  - [ ] Test with user who has character in fight (should see player view button)
  - [ ] Test with user who has no character in fight (should only see management button)
  - [ ] Test with gamemaster who also has character (should see both buttons)
  - [ ] Verify correct URL generation and navigation

## Files to Modify

- `src/components/dashboard/ActiveFightBanner.tsx`

## Dependencies

- None - all required data is already available in the component
