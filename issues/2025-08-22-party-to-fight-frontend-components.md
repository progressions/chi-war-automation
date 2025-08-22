# Issue: Party to Fight Frontend Components Implementation

**Date**: 2025-08-22  
**Priority**: Medium  
**Category**: Frontend  
**Status**: Open

## Description

Implement frontend components and user interface to allow users to add entire parties (with all their characters and vehicles) to fights through an intuitive interface. This will integrate with the new API v2 endpoint and provide a streamlined user experience with real-time updates.

Currently, users must manually add each character and vehicle from a party to a fight individually. This feature will allow adding entire parties with a single action.

## Steps to Reproduce

Current workflow (inefficient):
1. Navigate to a Fight page
2. Use character/vehicle search to find each party member individually
3. Add each character one by one
4. Add each vehicle one by one
5. Repeat for all party members

## Expected Behavior

Improved workflow:
1. Navigate to a Fight page
2. Use PartyFilter dropdown to select a party from current campaign
3. Click "Add Party to Fight" button
4. All characters and vehicles from selected party are automatically added
5. UI updates immediately to show new participants
6. Real-time updates broadcast to other users via ActionCable
7. Clear success/error feedback provided to user

## Actual Behavior

No frontend interface exists to add entire parties to fights. Users must add each party member individually, making large encounters tedious to set up.

## Related Files

### Frontend Files to Create
- `/shot-client-next/src/components/parties/PartyFilter.tsx` - Autocomplete dropdown for party selection
- `/shot-client-next/src/components/fights/AddPartyToFightButton.tsx` - Action button component
- `/shot-client-next/src/components/fights/PartyToFightSection.tsx` - Combined UI section
- `/shot-client-next/src/hooks/useAddPartyToFight.ts` - Custom hook for API integration
- `/shot-client-next/test-scripts/test-party-to-fight.js` - End-to-end Playwright test

### Frontend Files to Modify
- `/shot-client-next/src/lib/ApiV2.ts` - Add `addPartyToFight` method
- `/shot-client-next/src/app/campaigns/[campaignId]/fights/[fightId]/page.tsx` - Integrate new components
- Fight context and ActionCable subscriptions for real-time updates

### Component Dependencies
- Existing autocomplete component patterns
- Current fight page layout and styling
- ActionCable integration for real-time updates
- Toast notification system for user feedback

## Screenshots/Evidence

- PartyFilter component currently exists but is empty (`export default function PartyFilter() { return <></> }`)
- Fight pages have manual character/vehicle addition interface
- No bulk party addition functionality exists in current UI

## Investigation Notes

### Component Architecture Requirements

#### PartyFilter Component
- Autocomplete dropdown using existing patterns
- Fetches parties from current campaign only  
- Shows party name with member count badge
- Handles loading/error states gracefully
- Provides selection callback to parent

#### AddPartyToFightButton Component  
- Calls new API v2 endpoint for party addition
- Shows loading spinner during API request
- Displays success/error notifications
- Disables during operation to prevent duplicate calls
- Integrates with existing button styling

#### PartyToFightSection Component
- Combines PartyFilter and AddPartyToFightButton
- Manages selected party state locally
- Handles API success/error scenarios
- Integrates with fight page layout seamlessly

### API Integration Requirements
- New `addPartyToFight(partyId, fightId)` method in ApiV2 client
- Custom hook `useAddPartyToFight` for state management
- Error handling for network failures, authorization, validation
- Loading states and user feedback throughout process

### Real-time Updates
- ActionCable subscription to `FightChannel` for participant changes
- UI updates when other users add parties to same fight
- Optimistic updates with rollback on failure
- Smooth integration with existing real-time fight features

## Acceptance Criteria

### Core Functionality
- [ ] PartyFilter dropdown displays parties from current campaign only
- [ ] Party selection triggers parent component callback
- [ ] AddPartyToFightButton calls API v2 endpoint with correct parameters
- [ ] Successful party addition updates fight participant list immediately
- [ ] Multiple parties can be added to same fight sequentially

### User Experience
- [ ] Loading states provide clear feedback during all operations
- [ ] Success notifications show number of characters/vehicles added
- [ ] Error messages are user-friendly and actionable
- [ ] Component styling matches existing design system
- [ ] Responsive design works on mobile and desktop devices

### Integration & Real-time
- [ ] Components integrate seamlessly with existing fight page layout
- [ ] Real-time updates work for multiple concurrent users
- [ ] ActionCable subscriptions handle bulk participant additions
- [ ] Fight context state management supports party additions
- [ ] UI performance remains smooth with large parties (20+ members)

### Accessibility & Quality
- [ ] Full keyboard navigation support for all interactions
- [ ] Screen reader compatibility with proper ARIA labels
- [ ] Focus management and logical tab order
- [ ] Error announcements for screen reader users
- [ ] Consistent with existing accessibility patterns

### Testing Coverage
- [ ] Unit tests for all components cover functionality and edge cases
- [ ] Integration tests verify API client and hook behavior
- [ ] End-to-end Playwright tests validate complete user workflows
- [ ] Error scenario testing with appropriate user feedback
- [ ] Performance tests for large party operations

## Implementation Strategy

### Phase 1: Core Components (Week 1)
1. Create PartyFilter component with autocomplete functionality
2. Implement AddPartyToFightButton with API integration
3. Build useAddPartyToFight hook with error handling
4. Add addPartyToFight method to ApiV2 client

### Phase 2: Integration & Styling (Week 2)  
1. Create PartyToFightSection combining individual components
2. Integrate components with fight page layout
3. Apply consistent styling and responsive design
4. Implement success/error notification system

### Phase 3: Real-time & Testing (Week 3)
1. Add ActionCable integration for real-time updates
2. Write comprehensive component unit tests
3. Create integration tests for API client and hooks
4. Build end-to-end Playwright test scenarios

### Phase 4: Polish & Optimization (Week 4)
1. Performance optimization for large parties
2. Accessibility audit and improvements  
3. User experience testing and refinements
4. Documentation and code review

## Related Issues

- Backend companion issue: `2025-08-22-party-to-fight-backend-api-v2.md`
- Original combined issue: `2025-01-22-add-party-to-fight-frontend.md` (to be removed)
- Related specification: `/specs/party-to-fight-frontend-spec.md`

## Dependencies

This frontend implementation depends on:
- Backend API v2 endpoint completion (`2025-08-22-party-to-fight-backend-api-v2.md`)
- Existing party and fight data models
- Current ActionCable real-time infrastructure
- Established component and styling patterns