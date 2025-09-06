# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Version: 1.0.0

## Technical Requirements

### Frontend Implementation

- **Up Check Panel Component** - New React component in `shot-client-next/src/components/fight/UpCheckPanel.tsx` following existing panel patterns (AttackPanel, HealPanel, etc.)
  - Display current wounds vs threshold
  - Input field for Swerve roll result
  - Display Toughness value from character stats
  - Show calculated total (Swerve + Toughness)
  - Fortune point spending checkbox with current Fortune points display
  - Submit button to process Up Check result

- **Wound Threshold Detection** - Enhance existing damage processing in fight components
  - Monitor `character.action_values["Wounds"]` vs `SharedService.woundThreshold(character)`
  - Check for custom threshold in `character.action_values["Wound Threshold"]` 
  - Trigger Up Check flow when threshold exceeded for PC characters only

- **Action Bar Integration** - Add Up Check button to fight action bar
  - Show button only when selected character is a PC that needs Up Check
  - Button toggles UpCheckPanel visibility like other action panels
  - Visual indicator (red highlight/badge) for characters needing checks
  - Consistent with AttackPanel, HealPanel, BoostPanel button behavior

- **Real-time Status Updates** - WebSocket integration via Action Cable
  - Listen for Up Check status changes on FightChannel
  - Update character display to show "Out of the fight" status
  - Refresh Fortune point count after spending

### Backend Implementation

- **API Endpoint Usage** - Utilize existing `/api/v2/encounters/:id/apply_combat_action`
  - Send character_updates array with Up Check data
  - Include event with type: "up_check" and details
  - Update action_values for Fortune and Marks of Death
  - Set attributes.status to "active" or "out_of_fight"
  - CombatActionService already handles PC updates correctly

- **Character Model Updates** - Add status tracking
  - New JSONB array field `status` to store multiple status values
  - Add "out_of_fight" to status array on failed Up Check
  - Successful Up Check: character stays active (no status change)
  - Failed Up Check: add "out_of_fight" (permanent for this fight)
  - Increment Marks of Death when wounds exceed threshold
  - No Up Check offered if already "out_of_fight"
  - Validate Up Check calculations server-side
  - Broadcast status changes via Action Cable

- **Wound Threshold Service** - Enhance SharedService calculations
  - Default threshold: 35 for PCs
  - Check for override in `action_values["Wound Threshold"]`
  - Special cases: Big Bruiser = 50

### WebSocket Broadcasting

- **FightChannel Updates** - Broadcast Up Check events
  - Event: "up_check_required" when threshold exceeded
  - Event: "up_check_result" with character status
  - Event: "fortune_point_spent" with updated count

### UI/UX Specifications

- **Up Check Panel Layout**
  - Consistent with existing action panels (AttackPanel, HealPanel, etc.)
  - Shows in the same location as other action panels
  - Panel header: "Up Check for [Character Name]"
  - Clear display of current Wounds vs Threshold
  - Swerve input with dice icon
  - Toughness display (read-only)
  - Total calculation shown live
  - Fortune checkbox with current points displayed

- **Visual Feedback**
  - Toast notification: "Up Check required for [Character Name]"
  - Success: Green toast "Character stays in the fight!"
  - Failure: Red toast "Character is out of the fight"
  - Fortune point usage: Info toast "Fortune point spent for extra die"

- **Character Status Display**
  - Gray out character cards marked "Out of the fight"
  - Add status badge/icon to indicate Out status
  - Disable action buttons for Out characters

### Performance Criteria

- Up Check detection should trigger within 100ms of damage application
- Modal should open within 200ms of button click
- Status updates should propagate to all clients within 500ms
- No blocking operations during Up Check processing

## Approach

The implementation follows a client-server architecture where the frontend handles user interaction and the backend maintains authoritative state. The Up Check flow is integrated into the existing combat system with minimal disruption to current fight mechanics.

Key architectural decisions:
- Reuse existing combat action API to maintain consistency
- Leverage Action Cable for real-time updates across all connected clients
- Implement threshold detection on both client and server for responsive UX and data integrity
- Use existing SharedService pattern for wound threshold calculations

## External Dependencies

- Material-UI Dialog component for modal interface
- Action Cable WebSocket connections for real-time updates
- Existing SharedService calculations for wound thresholds
- Current fight management API endpoints
- Toast notification system for user feedback