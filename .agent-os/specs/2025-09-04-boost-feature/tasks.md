# Spec Tasks

## Tasks

- [ ] 1. Backend Combat Action Integration
  - [ ] 1.1 Write tests for boost action in combat_action_update endpoint
  - [ ] 1.2 Add `:boost` action type to EncountersController#combat_action_update
  - [ ] 1.3 Implement boost logic in CombatService within transaction block
  - [ ] 1.4 Create CharacterEffect records with appropriate attack/defense modifiers
  - [ ] 1.5 Handle Fortune spending for PC characters (deduct point if requested)
  - [ ] 1.6 Ensure single WebSocket broadcast with all updates
  - [ ] 1.7 Verify all backend tests pass

- [ ] 2. Frontend Boost Panel Component
  - [ ] 2.1 Write tests for BoostPanel component
  - [ ] 2.2 Create BoostPanel component structure mirroring AttackPanel
  - [ ] 2.3 Implement character selector for boost initiator
  - [ ] 2.4 Implement target selector following Attack Panel targeting rules
  - [ ] 2.5 Add boost type selector (Attack/Defense radio buttons)
  - [ ] 2.6 Add Fortune enhancement button for PC characters (no input field)
  - [ ] 2.7 Verify component tests pass

- [ ] 3. Frontend Integration and API Connection
  - [ ] 3.1 Write tests for boost API integration
  - [ ] 3.2 Add boost action to combat API client using combat_action_update
  - [ ] 3.3 Integrate BoostPanel into fight interface with toggle button
  - [ ] 3.4 Implement form submission and API call logic
  - [ ] 3.5 Handle loading states and error responses
  - [ ] 3.6 Verify integration tests pass

- [ ] 4. Real-time WebSocket Updates
  - [ ] 4.1 Write tests for WebSocket boost event handling
  - [ ] 4.2 Ensure combat_action_update broadcasts include boost updates
  - [ ] 4.3 Handle boost events in frontend WebSocket subscription
  - [ ] 4.4 Update fight state with boost-related character changes
  - [ ] 4.5 Verify CharacterEffect display updates automatically
  - [ ] 4.6 Verify all real-time tests pass

- [ ] 5. End-to-End Testing and Documentation
  - [ ] 5.1 Write E2E test script for complete boost workflow
  - [ ] 5.2 Test PC boost with Fortune enhancement
  - [ ] 5.3 Test NPC/Ally boost without Fortune option
  - [ ] 5.4 Test multiple boosts on same character (stacking)
  - [ ] 5.5 Verify CharacterEffect UI displays boost modifiers correctly
  - [ ] 5.6 Update CLAUDE.md with boost feature documentation
  - [ ] 5.7 Verify all E2E tests pass