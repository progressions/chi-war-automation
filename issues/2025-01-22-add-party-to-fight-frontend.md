# Issue: Add Party to Fight Feature - Frontend Implementation

**Date**: 2025-01-22  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description

The backend API already supports adding an entire Party (with all its Characters and Vehicles) to a Fight via the endpoint `POST /api/v1/parties/{party_id}/fight/{fight_id}`. However, there is no frontend interface to utilize this functionality. Users currently need to manually add individual Characters and Vehicles from a Party to a Fight one by one.

This issue involves implementing a frontend feature that allows users to:
1. Select a Party using the existing PartyFilter component
2. Click an "Add Party to Fight" button
3. Automatically add all Characters and Vehicles from that Party to the current Fight

## Steps to Reproduce

Current workflow (inefficient):
1. Navigate to a Fight page
2. Manually search for and add each Character from a Party individually
3. Manually search for and add each Vehicle from a Party individually
4. Repeat for each Party member

## Expected Behavior

Improved workflow:
1. Navigate to a Fight page
2. Use PartyFilter component to select a Party
3. Click "Add Party to Fight" button
4. All Characters and Vehicles from the selected Party are automatically added to the Fight
5. UI updates to reflect the newly added participants
6. Real-time updates broadcast to other users via ActionCable

## Actual Behavior

No frontend interface exists to add entire Parties to Fights. Users must add each Party member individually.

## Related Files

### Backend (Already Implemented)
- `/shot-server/app/controllers/api/v1/parties_controller.rb:51-68` - `fight` method implementation
- `/shot-server/config/routes.rb` - Route: `post "fight/:fight_id", to: "parties#fight"`
- `/shot-server/spec/requests/api/v1/parties_spec.rb` - Tests for party to fight functionality

### Frontend (Needs Implementation)
- `/shot-client-next/src/components/parties/PartyFilter.tsx` - Currently empty component
- `/shot-client-next/src/lib/client/partyClient.ts` - Needs `addToFight` method
- Fight page components that need "Add Party" functionality
- Encounter context for real-time updates

## Screenshots/Evidence

- Backend API endpoint exists and is tested (see parties_spec.rb lines with "adds a party to a fight")
- PartyFilter component exists but is currently empty (`export default function PartyFilter() { return <></> }`)

## Investigation Notes

### Backend API Details
The existing `Api::V1::PartiesController#fight` method:
- Takes `party_id` and `fight_id` as URL parameters
- Iterates through party.characters and party.vehicles  
- Creates Shot records for each (with shot: 0) if they don't already exist in the fight
- Prevents duplicate additions
- Returns the party as JSON response

### Frontend Architecture Considerations
- The app uses ActionCable for real-time fight updates via `EncounterContext`
- PartyFilter component needs to be implemented to select parties
- Fight pages likely need new "Add Party" button and associated logic
- API client needs new method to call the backend endpoint

## Potential Solution

### Phase 1: API Client Method
1. Add `addToFight(partyId: string, fightId: string)` method to `partyClient.ts`
2. Make POST request to `/api/v1/parties/${partyId}/fight/${fightId}`

### Phase 2: PartyFilter Implementation  
1. Implement PartyFilter component similar to other autocomplete filters
2. Allow selection of parties from current campaign
3. Provide callback for selected party

### Phase 3: Fight Page Integration
1. Add PartyFilter and "Add Party to Fight" button to fight/encounter pages
2. Handle button click to call API client method
3. Update local state and trigger ActionCable updates
4. Provide user feedback for success/error states

### Phase 4: Real-time Updates
1. Ensure ActionCable broadcasts include party additions
2. Update encounter context to handle bulk character/vehicle additions
3. Refresh fight participants list in real-time

## Related Issues

None currently, but this feature would improve the user experience for managing large combat encounters with multiple parties.