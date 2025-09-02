# Character Edit Dialog - Implementation Tasks

## Phase 1: Frontend UI Components
> Create the edit button and dialog component structure

### 1.1 Add Edit Button to CharacterDetail
- [ ] Import MdEdit icon from react-icons/md
- [ ] Add edit button next to existing action buttons
- [ ] Style button with consistent sizing and hover effects
- [ ] Add tooltip "Edit character details"
- [ ] Create onClick handler to open dialog

### 1.2 Create CharacterEditDialog Component
- [ ] Create new file `src/components/encounters/CharacterEditDialog.tsx`
- [ ] Define TypeScript interface for props (open, onClose, character, shot)
- [ ] Import Material-UI Dialog components
- [ ] Set up basic dialog structure with title and actions
- [ ] Export component from encounters index.ts

### 1.3 Implement Form Fields
- [ ] Add TextField for character name
- [ ] Import and use NumberField component for numeric inputs
- [ ] Add NumberField for current shot (0-30 range)
- [ ] Add NumberField for wounds (0-99 range)
- [ ] Add NumberField for impairments (0-10 range)
- [ ] Add NumberField for marks of death (0-5 range)

### 1.4 Form Layout and Styling
- [ ] Apply vertical Stack layout for form fields
- [ ] Set dialog maxWidth to "sm" for compact size
- [ ] Add proper spacing between form elements
- [ ] Style save/cancel buttons with appropriate colors
- [ ] Ensure mobile responsiveness

## Phase 2: State Management
> Implement local state and form handling

### 2.1 Initialize Form State
- [ ] Create useState hooks for each form field
- [ ] Initialize state with current character values
- [ ] Handle null/undefined values with defaults
- [ ] Create helper function to determine impairment source (PC vs non-PC)

### 2.2 Form Change Handlers
- [ ] Create onChange handlers for each field
- [ ] Implement real-time validation for numeric ranges
- [ ] Show validation errors for out-of-range values
- [ ] Disable save button when validation fails

### 2.3 Dialog Control State
- [ ] Manage loading state during save operations
- [ ] Handle dialog open/close state properly
- [ ] Reset form state when dialog opens
- [ ] Clear form errors on close

## Phase 3: Character Type Logic
> Handle PC vs non-PC impairment storage

### 3.1 Character Type Detection
- [ ] Create helper function to check if character is PC
- [ ] Determine impairment storage location based on type
- [ ] Handle edge cases for undefined character types

### 3.2 Impairment Field Logic
- [ ] Read impairments from correct source on dialog open
- [ ] Prepare correct update payload based on character type
- [ ] Add comments explaining the PC vs non-PC distinction

## Phase 4: API Client Methods
> Create or update API integration methods

### 4.1 Character Update Method
- [ ] Create updateCharacterCombatStats method in characterClient
- [ ] Handle action_values nested updates
- [ ] Include name and PC impairments in payload
- [ ] Add proper TypeScript typing for parameters

### 4.2 Shot Update Method
- [ ] Create or verify updateShot method exists
- [ ] Handle current_shot and non-PC impairments
- [ ] Ensure shot_id is included in payload
- [ ] Add error handling for missing shot records

### 4.3 Combined Update Logic
- [ ] Create wrapper function to handle both updates
- [ ] Determine which endpoints to call based on changes
- [ ] Handle parallel API calls when needed
- [ ] Implement proper error aggregation

## Phase 5: Save Implementation
> Implement the save functionality with optimistic updates

### 5.1 Optimistic Update Setup
- [ ] Store original values before update
- [ ] Apply changes to UI immediately
- [ ] Prepare rollback data structure

### 5.2 Save Handler Implementation
- [ ] Create async handleSave function
- [ ] Disable form during save operation
- [ ] Show loading indicator on save button
- [ ] Make appropriate API calls based on character type

### 5.3 Success Handling
- [ ] Close dialog on successful save
- [ ] Show success toast with character name
- [ ] Trigger encounter context refresh if needed
- [ ] Clear form state

### 5.4 Error Handling
- [ ] Rollback optimistic updates on failure
- [ ] Show error toast with meaningful message
- [ ] Keep dialog open for retry
- [ ] Log errors for debugging

## Phase 6: Backend API Updates
> Ensure backend properly handles the update requests

### 6.1 Character Controller Updates
- [ ] Verify V2 characters controller accepts nested action_values
- [ ] Add validation for marks of death range (0-5)
- [ ] Ensure impairments validation (0-10) for PCs
- [ ] Add WebSocket broadcast after update

### 6.2 Shot Controller Updates
- [ ] Verify or create shot update endpoint
- [ ] Handle current_shot updates
- [ ] Handle non-PC impairments updates
- [ ] Add WebSocket broadcast after update

### 6.3 Model Validations
- [ ] Add Character model validation for marks of death
- [ ] Add Shot model validation for shot number range
- [ ] Ensure proper error messages for validation failures
- [ ] Test validation with edge cases

## Phase 7: WebSocket Integration
> Ensure real-time updates work correctly

### 7.1 Broadcast Configuration
- [ ] Verify broadcast_encounter_update! method exists
- [ ] Ensure it's called after character updates
- [ ] Ensure it's called after shot updates
- [ ] Test broadcast payload contains necessary data

### 7.2 Frontend Reception
- [ ] Verify EncounterContext receives updates
- [ ] Ensure character data refreshes in UI
- [ ] Test multiple client synchronization
- [ ] Handle connection loss gracefully

## Phase 8: Testing
> Comprehensive testing of the feature

### 8.1 Component Testing
- [ ] Test edit button renders correctly
- [ ] Test dialog opens with correct values
- [ ] Test form validation for each field
- [ ] Test save and cancel button behaviors

### 8.2 Integration Testing
- [ ] Test PC character updates
- [ ] Test non-PC character updates
- [ ] Test concurrent edits from multiple users
- [ ] Test WebSocket broadcast reception

### 8.3 Edge Case Testing
- [ ] Test with characters missing values
- [ ] Test with maximum/minimum values
- [ ] Test network error handling
- [ ] Test rapid sequential saves

### 8.4 Manual Testing
- [ ] Test on desktop browsers
- [ ] Test on mobile devices
- [ ] Test keyboard navigation (Tab, Enter, ESC)
- [ ] Test screen reader compatibility

## Phase 9: Polish and Documentation
> Final refinements and documentation

### 9.1 UI Polish
- [ ] Add smooth transitions for dialog open/close
- [ ] Ensure consistent spacing and alignment
- [ ] Add keyboard shortcuts (Ctrl+S to save)
- [ ] Fine-tune loading states

### 9.2 Code Cleanup
- [ ] Remove console.log statements
- [ ] Add JSDoc comments for complex functions
- [ ] Ensure consistent code formatting
- [ ] Run linter and fix any issues

### 9.3 Documentation
- [ ] Update component documentation
- [ ] Add usage examples to README
- [ ] Document the PC vs non-PC logic
- [ ] Create troubleshooting guide

## Completion Checklist

### Must Have
- [ ] Edit button visible on all characters in encounters
- [ ] Dialog opens with pre-populated values
- [ ] All fields save correctly
- [ ] PC/non-PC impairment logic works
- [ ] Real-time updates via WebSocket
- [ ] Error handling with user feedback

### Should Have
- [ ] Keyboard navigation support
- [ ] Mobile-responsive design
- [ ] Loading states during save
- [ ] Validation with error messages

### Nice to Have
- [ ] Keyboard shortcuts
- [ ] Smooth animations
- [ ] Batch update optimization
- [ ] Undo functionality (future)

## Dependencies and Blockers

### Dependencies
- Existing NumberField component must support required ranges
- API V2 endpoints must accept nested action_values
- WebSocket infrastructure must be functional
- Toast notification system must be available

### Potential Blockers
- API endpoint modifications may require backend deployment
- WebSocket broadcasting might need optimization for performance
- Character type detection logic needs verification with edge cases

## Testing Scenarios

### Scenario 1: Edit PC Character
1. Open encounter with PC character
2. Click edit button
3. Change wounds from 0 to 5
4. Change impairments from 0 to 2
5. Save changes
6. Verify character model updated
7. Verify other clients see updates

### Scenario 2: Edit Boss Character
1. Open encounter with Boss character
2. Click edit button
3. Change current shot from 15 to 10
4. Change marks of death from 0 to 2
5. Save changes
6. Verify shot association updated
7. Verify initiative order updates

### Scenario 3: Network Error
1. Open edit dialog
2. Disconnect network
3. Make changes and save
4. Verify error message appears
5. Verify values rollback
6. Reconnect and retry successfully

## Time Estimates

- Phase 1: Frontend UI Components - 2 hours
- Phase 2: State Management - 1.5 hours
- Phase 3: Character Type Logic - 1 hour
- Phase 4: API Client Methods - 1.5 hours
- Phase 5: Save Implementation - 2 hours
- Phase 6: Backend API Updates - 2 hours
- Phase 7: WebSocket Integration - 1 hour
- Phase 8: Testing - 3 hours
- Phase 9: Polish and Documentation - 1 hour

**Total Estimated Time: 15 hours**

## Success Metrics

- Dialog save operations complete within 2 seconds
- Zero data loss during concurrent edits
- 100% of character types handled correctly
- Real-time updates delivered within 500ms
- Error rate less than 1% for save operations
- User satisfaction with editing workflow improved