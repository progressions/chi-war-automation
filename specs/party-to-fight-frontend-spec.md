# Party to Fight Frontend Specification

**Date**: 2025-08-22  
**Status**: Planning  
**Priority**: Medium  
**Component**: Next.js Frontend (shot-client-next)

## Overview

Implement frontend components and user interface to allow users to add entire parties (with all their characters and vehicles) to fights through an intuitive interface. This will integrate with the new API v2 endpoint and provide real-time updates.

## User Experience Requirements

### Current State
- Users must manually add each character and vehicle from a party to a fight individually
- No existing UI components for party-to-fight operations
- Fight management is character-by-character only

### Target User Experience
1. **Party Selection**: Users see dropdown of available parties in current campaign
2. **One-Click Addition**: Single button click adds entire party to fight
3. **Immediate Feedback**: Clear success/error messages with loading states
4. **Real-Time Updates**: Other users see party additions instantly
5. **Bulk Operations**: Support for adding multiple parties to same fight

## Component Architecture

### 1. PartyFilter Component (`src/components/parties/PartyFilter.tsx`)

**Purpose**: Autocomplete dropdown for party selection within current campaign

**Props Interface**:
```typescript
interface PartyFilterProps {
  value?: Party | null;
  onChange: (party: Party | null) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

**Functionality**:
- Fetches parties from current campaign via `useParties` hook
- Implements autocomplete search with fuzzy matching
- Displays party name with member count badge
- Handles loading and error states gracefully
- Clears selection when campaign changes

**Dependencies**:
- `useParties` hook for data fetching
- `Party` type from type definitions
- Existing autocomplete UI patterns

### 2. AddPartyToFightButton Component (`src/components/fights/AddPartyToFightButton.tsx`)

**Purpose**: Action button that triggers party-to-fight addition

**Props Interface**:
```typescript
interface AddPartyToFightButtonProps {
  party: Party | null;
  fightId: string;
  onSuccess?: (party: Party) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
  className?: string;
}
```

**Functionality**:
- Calls API v2 endpoint to add party to fight
- Shows loading spinner during request
- Displays success/error toast notifications
- Disables interaction during API call
- Triggers success callback for parent components

**State Management**:
- `loading` - API request in progress
- `error` - Error message from failed request
- Internal success handling with external callbacks

### 3. PartyToFightSection Component (`src/components/fights/PartyToFightSection.tsx`)

**Purpose**: Complete UI section combining party selection and addition

**Props Interface**:
```typescript
interface PartyToFightSectionProps {
  fightId: string;
  onPartyAdded?: (party: Party) => void;
  className?: string;
}
```

**Functionality**:
- Orchestrates PartyFilter and AddPartyToFightButton
- Manages selected party state
- Handles success/error feedback
- Integrates with existing fight page layout

**Layout**:
```
[Party Selection Dropdown] [Add to Fight Button]
                           [Status Messages]
```

## API Integration

### API Client Method (`src/lib/ApiV2.ts`)

```typescript
export class ApiV2Client {
  async addPartyToFight(partyId: string, fightId: string): Promise<Party> {
    const response = await this.post<Party>(
      `/parties/${partyId}/fight/${fightId}`
    );
    return response;
  }
}
```

### Hook Implementation (`src/hooks/useAddPartyToFight.ts`)

```typescript
interface UseAddPartyToFightResult {
  addPartyToFight: (partyId: string, fightId: string) => Promise<Party>;
  loading: boolean;
  error: Error | null;
}

export function useAddPartyToFight(): UseAddPartyToFightResult {
  // Implementation with API client
  // Error handling and loading states
  // Success callbacks and notifications
}
```

## User Interface Integration

### Fight Page Integration (`src/app/campaigns/[campaignId]/fights/[fightId]/page.tsx`)

**Placement**: Add PartyToFightSection above existing participant list
**Layout**: Horizontal layout on desktop, stacked on mobile
**Responsive**: Collapse to single column on small screens

### Visual Design Requirements

**PartyFilter Dropdown**:
- Match existing autocomplete component styles
- Show party name with member count badge (e.g., "Heroes (5 members)")
- Display character types in tooltip (PC, NPC, Vehicle counts)
- Use consistent spacing and typography

**Add Button**:
- Primary button styling for emphasis
- Loading spinner during API calls
- Disabled state when no party selected
- Success animation on completion

**Feedback Messages**:
- Toast notifications for success/error states
- Error messages with actionable guidance
- Success messages with participant count added

## Real-Time Updates

### ActionCable Integration

**Subscription**: Existing `FightChannel` subscription handles new participants
**Event Types**: 
- `participant_added` - New character/vehicle added to fight
- `participants_bulk_added` - Multiple participants added (new event)

**UI Updates**:
- Participant list refreshes automatically
- Shot order updates if initiative is affected  
- Other users see changes without page refresh
- Loading indicators during real-time sync

## State Management

### Fight Context Updates

**Current Fight State**: Extend existing fight context to handle bulk additions
**Optimistic Updates**: Update UI immediately, rollback on API failure
**Cache Invalidation**: Refresh fight data after successful party addition

### Party Selection State

**Local Component State**: Selected party maintained in PartyToFightSection
**Reset Behavior**: Clear selection after successful addition
**Persistence**: Do not persist selection across page refreshes

## Error Handling & User Feedback

### Error Scenarios

1. **Network Errors**: "Unable to connect. Check your connection and try again."
2. **Authorization Errors**: "You don't have permission to modify this fight."
3. **Not Found Errors**: "Party or fight no longer exists."
4. **Validation Errors**: "Invalid party or fight selection."
5. **Server Errors**: "Something went wrong. Please try again."

### Success Feedback

- **Toast Notification**: "Added [Party Name] to fight (X characters, Y vehicles)"
- **UI Animation**: Brief highlight of newly added participants
- **Clear Selection**: Reset dropdown to encourage additional actions

### Loading States

- **Button Loading**: Spinner replaces button text during API call
- **Dropdown Disabled**: Prevent selection changes during addition
- **Progress Indication**: Clear visual feedback for user patience

## Responsive Design

### Desktop Layout (≥768px)
```
[Party Dropdown (300px)] [Add Button (120px)] [Status (flex)]
```

### Mobile Layout (<768px)
```
[Party Dropdown (full width)]
[Add Button (full width)]
[Status Messages (full width)]
```

### Accessibility Requirements

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: Proper ARIA labels and announcements  
- **Focus Management**: Logical tab order and focus indicators
- **Error Announcements**: Screen reader notifications for errors

## Test Coverage Requirements

### Component Tests

**PartyFilter Component**:
```typescript
describe('PartyFilter', () => {
  it('displays available parties from current campaign');
  it('handles party selection and onChange callback');
  it('shows loading state while fetching parties');
  it('displays error state for failed party fetch');
  it('clears selection when campaign changes');
});
```

**AddPartyToFightButton Component**:
```typescript
describe('AddPartyToFightButton', () => {
  it('triggers API call with correct party and fight IDs');
  it('shows loading state during API request');
  it('displays success feedback on successful addition');
  it('shows error message on API failure');
  it('disables button when no party selected');
});
```

### Integration Tests

**API Client Tests**:
- Mock API responses for success/error scenarios
- Verify correct endpoint and parameters
- Test error handling and response parsing

**Hook Tests**:
- Test loading states and error handling
- Verify API client integration
- Test success callbacks and notifications

### End-to-End Tests (Playwright)

**Complete User Flow** (`test-scripts/test-party-to-fight.js`):
```javascript
describe('Party to Fight Feature', () => {
  // Test setup with gamemaster user and seeded data
  // Navigate to fight page
  // Select party from dropdown
  // Click add button
  // Verify participants appear in fight
  // Test real-time updates with second user
});
```

**Error Scenarios**:
- Test with invalid party/fight combinations
- Test network failure recovery
- Test authorization error handling

## Performance Considerations

### Optimization Strategies

1. **Party List Caching**: Cache party list to avoid repeated API calls
2. **Debounced Search**: Debounce autocomplete search to reduce API load
3. **Optimistic Updates**: Update UI immediately, rollback if needed
4. **Bundle Size**: Lazy load components only when fight page accessed

### Performance Targets

- **Initial Load**: Party dropdown populated within 500ms
- **Search Response**: Autocomplete results within 200ms of typing
- **API Response**: Party addition completed within 1000ms
- **UI Update**: Participant list updated within 100ms of API response

## Acceptance Criteria

### Core Functionality
- [ ] PartyFilter dropdown displays parties from current campaign only
- [ ] Party selection updates parent component state
- [ ] AddPartyToFightButton triggers API call with correct parameters
- [ ] Successful party addition updates fight participant list
- [ ] Error states display user-friendly messages

### User Experience  
- [ ] Loading states provide clear feedback during all operations
- [ ] Success/error notifications appear for all user actions
- [ ] Real-time updates work for multiple concurrent users
- [ ] Responsive design works on mobile and desktop
- [ ] Keyboard navigation and accessibility fully supported

### Integration
- [ ] Components integrate seamlessly with existing fight page
- [ ] API v2 client properly handles all response/error scenarios  
- [ ] ActionCable subscriptions update UI in real-time
- [ ] Fight context state management handles bulk additions
- [ ] Component styling matches existing design system

### Testing
- [ ] Unit tests cover all component functionality and edge cases
- [ ] Integration tests verify API client and hook behavior
- [ ] End-to-end tests validate complete user workflows
- [ ] Error scenarios tested with appropriate user feedback
- [ ] Performance benchmarks met for all user interactions

## Implementation Strategy

### Phase 1: Core Components
1. Create PartyFilter component with basic autocomplete
2. Implement AddPartyToFightButton with API integration
3. Build useAddPartyToFight hook with error handling

### Phase 2: Integration & Polish
1. Create PartyToFightSection combining components
2. Integrate with fight page layout and styling
3. Add real-time updates via ActionCable

### Phase 3: Testing & Optimization
1. Write comprehensive component and integration tests
2. Create end-to-end Playwright test scenarios
3. Performance optimization and accessibility audit

### Development Notes

- **Existing Patterns**: Follow established component organization in `src/components/`
- **Type Safety**: Use existing TypeScript patterns and type definitions
- **Styling**: Match current Tailwind CSS conventions and component styles
- **Error Handling**: Consistent with existing error handling patterns
- **State Management**: Integrate with existing React context patterns