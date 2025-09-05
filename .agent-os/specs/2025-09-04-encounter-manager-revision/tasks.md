# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-04-encounter-manager-revision/spec.md

> Created: 2025-09-04
> Status: Ready for Implementation

## Tasks

- [ ] 1. Enhance CharacterSelector component with shot labels
  - [ ] 1.1 Write tests for shot label display in CharacterSelector
  - [ ] 1.2 Add shot label rendering logic to CharacterSelector component
  - [ ] 1.3 Style shot labels with proper spacing and visual hierarchy
  - [ ] 1.4 Ensure labels update correctly when characters change positions
  - [ ] 1.5 Verify all tests pass

- [ ] 2. Elevate CharacterSelector to encounter manager level
  - [ ] 2.1 Write tests for elevated CharacterSelector behavior
  - [ ] 2.2 Move CharacterSelector from action panels to Encounter component
  - [ ] 2.3 Add selectedActorId state to EncounterContext
  - [ ] 2.4 Expose onSelect callback from CharacterSelector to parent
  - [ ] 2.5 Wire up selection state management
  - [ ] 2.6 Verify all tests pass

- [ ] 3. Create EncounterActionBar component
  - [ ] 3.1 Write tests for EncounterActionBar component
  - [ ] 3.2 Create EncounterActionBar component with action buttons
  - [ ] 3.3 Implement show/hide logic based on character selection
  - [ ] 3.4 Add proper styling and positioning
  - [ ] 3.5 Verify all tests pass

- [ ] 4. Integrate pre-selected character with action panels
  - [ ] 4.1 Write tests for pre-selected character in action panels
  - [ ] 4.2 Update AttackPanel to accept and use pre-selected character
  - [ ] 4.3 Update BoostPanel to accept and use pre-selected character
  - [ ] 4.4 Update ChasePanel to accept and use pre-selected character
  - [ ] 4.5 Ensure backwards compatibility for direct panel access
  - [ ] 4.6 Verify all tests pass

- [ ] 5. Final integration and polish
  - [ ] 5.1 Test complete workflow from character selection to action execution
  - [ ] 5.2 Adjust MenuBar positioning and layout
  - [ ] 5.3 Ensure WebSocket updates work with new flow
  - [ ] 5.4 Add any necessary performance optimizations
  - [ ] 5.5 Run full test suite and fix any issues
  - [ ] 5.6 Manual testing of all combat scenarios