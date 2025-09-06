# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Status: Ready for Implementation

## Tasks

### 1. Backend Up Check Combat Action Integration

**1.1** Create database migration for character status field
  - Generate migration: `rails generate migration AddStatusToCharacters status:jsonb`
  - Set default value to empty array `[]`
  - Add index on status field for query performance
  - Run migration in development and test environments

**1.2** Write comprehensive RSpec tests for Up Check combat action processing
  - Test successful Up Check: character stays active (no status change), wounds unchanged
  - Test failed Up Check: "out_of_fight" added to status array (permanent), wounds unchanged
  - Test Fortune point spending adds extra die to Swerve roll
  - Test Mark of Death added when wounds exceed threshold
  - Test no Up Check offered if already "out_of_fight"
  - Test proper WebSocket broadcast of character status changes
  - Test integration with apply_combat_action API endpoint

**1.3** Update CombatActionService to handle Up Check event type
  - Process character_updates with event.type = "up_check"
  - Validate Swerve roll input from player
  - Calculate total: Swerve + character's Toughness value
  - Success: No status change (stays active)
  - Failure: Add "out_of_fight" to status array
  - Handle Fortune point deduction if used
  - Mark of Death already added when threshold was exceeded

**1.4** Add Character model methods for Up Check logic
  - Add `needs_up_check?` method: wounds > threshold && !status.include?("out_of_fight")
  - Add `add_status(value)` and `remove_status(value)` helper methods
  - Check for custom threshold in action_values["Wound Threshold"]
  - Default threshold is 35 for PCs
  - Once "out_of_fight", no more Up Checks this fight

**1.5** Enhance WebSocket broadcasts for Up Check results
  - Broadcast character status changes via CampaignChannel
  - Include Up Check roll result and outcome in broadcast data
  - Update fight participants list when character status changes

**1.6** Update API serializers for Up Check availability
  - Add `needs_up_check` field to character serializer
  - Include status array in character data
  - Include wound threshold and current Toughness

**1.7** Add Up Check logging to combat history
  - Record Up Check attempts with roll results in fight logs
  - Track successful/failed Up Check attempts per character
  - Log each Mark of Death addition

**1.8** Verify all backend tests pass and WebSocket integration works correctly

### 2. Frontend Up Check Panel Component

**2.1** Write comprehensive Jest/React Testing Library tests for UpCheckPanel component
  - Test panel renders only when wounds > threshold && !status.includes("out_of_fight")
  - Test panel does NOT render if character already "out_of_fight"
  - Test Swerve input field accepts dice roll values
  - Test live calculation of Swerve + Toughness total
  - Test Fortune point checkbox functionality
  - Test submit button triggers correct API call
  - Test success/failure toast notifications
  - Test panel disappears after Up Check (success or failure)

**2.2** Create UpCheckPanel component in `src/components/fight/UpCheckPanel.tsx`
  - Follow AttackPanel/HealPanel structure and styling patterns
  - Add Swerve NumberField for player dice roll input
  - Display character's Toughness value (read-only)
  - Show live calculation: Swerve + Toughness = Total
  - Include Fortune point checkbox with current points display

**2.3** Implement UpCheckPanel UI/UX design
  - Use consistent styling with other combat panels
  - Display current Wounds vs Threshold (e.g., "36/35 wounds")
  - Show "Enter your Swerve roll" with dice icon
  - Display "Toughness: X" with character's value
  - Show "Total: X (needs 5+)" with live calculation
  - Fortune checkbox: "Spend Fortune point for extra die (X remaining)"

**2.4** Add Up Check API integration to panel
  - Use apply_combat_action endpoint with character_updates array
  - Send Swerve roll, Toughness, and Fortune usage in event details
  - Update character status and Mark of Death in action_values
  - Handle loading states and error responses

**2.5** Integrate UpCheckPanel with character status updates
  - Subscribe to WebSocket updates for character status changes
  - Auto-hide panel when character becomes active
  - Update panel visibility based on wound threshold detection

**2.6** Add toast notifications for Up Check outcomes
  - Success: "Up Check successful! [Character] is back in the fight"
  - Failure: "Up Check failed. [Character] remains out of the fight"
  - Error handling for API failures

**2.7** Ensure panel responsive design and accessibility
  - Mobile-friendly layout
  - Keyboard navigation support
  - Screen reader compatibility

**2.8** Verify all frontend tests pass and component integrates properly

### 3. Action Bar Up Check Button Integration

**3.1** Write tests for Up Check button visibility and behavior in action bar
  - Test button only shows for PC characters who can attempt Up Check
  - Test button triggers UpCheckPanel display
  - Test button state management and loading indicators
  - Test button integration with character status updates

**3.2** Add Up Check button to character action bar in ActionBar component
  - Position alongside Attack, Heal, and other combat action buttons
  - Use consistent styling and icon design
  - Show button only for eligible PC characters

**3.3** Implement Up Check button click handler
  - Toggle UpCheckPanel visibility
  - Manage button active/inactive states
  - Handle button state during Up Check execution

**3.4** Add Up Check button tooltips and help text
  - Explain Up Check mechanics to players
  - Show wound threshold and current status
  - Provide clear call-to-action messaging

**3.5** Integrate button with real-time character updates
  - Update button visibility when character status changes
  - Handle WebSocket updates for wound threshold changes
  - Auto-hide button when character becomes active

**3.6** Add button loading states and disabled states
  - Disable during Up Check execution
  - Show loading spinner during API calls
  - Prevent multiple simultaneous Up Check attempts

**3.7** Ensure button accessibility and keyboard navigation
  - Proper ARIA labels and roles
  - Keyboard activation support
  - Focus management during panel interactions

**3.8** Verify action bar integration tests pass and UX flows work correctly

### 4. Character Status Management and Wound Detection

**4.1** Write tests for wound threshold detection and Up Check triggering
  - Test PC needs Up Check when wounds exceed threshold (35 default)
  - Test custom thresholds in action_values["Wound Threshold"]
  - Test Mark of Death is added when threshold exceeded
  - Test character status persistence across fight sessions
  - Test status change WebSocket broadcasts

**4.2** Implement wound threshold detection for Up Check triggering
  - Detect when PC wounds exceed threshold
  - Check for custom threshold overrides (e.g., Big Bruiser = 50)
  - Add Mark of Death when threshold exceeded
  - Trigger Up Check requirement notification

**4.3** Add wound status indicators to character display components
  - Show "Out of Fight" status clearly in character cards
  - Display wound points relative to threshold
  - Add visual indicators for Up Check eligibility

**4.4** Implement character status change animations and transitions
  - Smooth transitions when character goes out_of_fight
  - Visual feedback when character returns to active status
  - Clear status change messaging in UI

**4.5** Add wound threshold configuration and management
  - Allow wound threshold customization if needed
  - Document wound threshold business rules
  - Ensure consistent threshold application

**4.6** Integrate status changes with fight participation
  - Update fight participant lists when status changes
  - Handle initiative order when characters go out_of_fight
  - Manage shot assignments for status changes

**4.7** Add character status history and logging
  - Track when characters go out_of_fight due to wounds
  - Log Up Check attempts and outcomes
  - Maintain fight session character status records

**4.8** Verify wound detection tests pass and status management works reliably

### 5. Real-time Updates and WebSocket Integration

**5.1** Write tests for Up Check WebSocket broadcast and subscription handling
  - Test real-time updates when Up Check is performed
  - Test character status change broadcasts to all fight participants
  - Test WebSocket message format and content
  - Test connection handling and error recovery

**5.2** Implement Up Check WebSocket broadcasts in backend
  - Broadcast Up Check results to all campaign members
  - Include Swerve roll, Toughness, total, and outcome in broadcast
  - Include updated character status in broadcast
  - Ensure proper channel subscription management

**5.3** Add Up Check WebSocket subscription handling in frontend
  - Subscribe to Up Check broadcasts via FightChannel
  - Update UI components when receiving Up Check messages
  - Handle character status change updates in real-time

**5.4** Implement real-time panel visibility updates
  - Show/hide UpCheckPanel based on WebSocket updates
  - Update action bar buttons when character status changes
  - Synchronize UI state across multiple connected clients

**5.5** Add real-time fight participant list updates
  - Update active/inactive character lists when Up Check succeeds
  - Maintain consistent fight state across all connected users
  - Handle initiative order updates for status changes

**5.6** Implement WebSocket error handling and recovery
  - Handle connection drops during Up Check attempts
  - Retry failed Up Check operations
  - Provide user feedback for connection issues

**5.7** Add WebSocket message validation and security
  - Validate Up Check broadcast message format
  - Ensure proper user authorization for Up Check actions
  - Prevent unauthorized character status modifications

**5.8** Verify WebSocket integration tests pass and real-time updates work correctly