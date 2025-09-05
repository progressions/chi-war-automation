# Technical Specification

This is the technical specification for the spec detailed in @specs/2025-09-05-vehicle-chase-defeat-thresholds/spec.md

## Technical Requirements

### Frontend Implementation (shot-client-next)

#### VehicleService Extensions
- Add `isDefeated(vehicle: Vehicle): boolean` method to check if chase points >= defeat threshold
- Add `getDefeatThreshold(vehicle: Vehicle): number` method to get threshold based on driver type
- Add `getDefeatType(vehicle: Vehicle): "crashed" | "boxed_in" | null` method to determine defeat type
  - Check vehicle.was_rammed_or_damaged field (provided from shot record by backend)
  - Return "crashed" if damaged and defeated, "boxed_in" if defeated without damage
- Utilize existing `CS.type(vehicle.driver)` to determine driver type
- Use existing `woundThresholds` from SharedService for threshold values (serious property)

#### Important: Fight-Scoped Data
- **Impairments**: Use vehicle.impairments (which backend populates from shot.impairments when in fight context)
- **Was Rammed or Damaged**: Use vehicle.was_rammed_or_damaged (which backend populates from shot.was_rammed_or_damaged)
- Both values come from the shot record when vehicles are serialized in a fight context

#### UI Components Updates
- **VehicleDetail.tsx**: Add defeat status indicator
  - Display "CRASHED" or "BOXED IN" badge based on `VehicleService.getDefeatType(vehicle)`
  - Use Material-UI Chip with error severity for "CRASHED", warning severity for "BOXED IN"
  - Position prominently in the vehicle detail header area
  
- **ChaseResolution.tsx**: Add defeat status messaging
  - When vehicle crashed and pursuing: "Vehicle crashed - Target escaped!"
  - When vehicle crashed and evading: "Vehicle crashed - Caught by pursuer!"
  - When vehicle boxed in and pursuing: "Vehicle boxed in - Target escaped!"
  - When vehicle boxed in and evading: "Vehicle boxed in - Caught by pursuer!"


### Backend Implementation (shot-server)

#### Vehicle Model Extensions
- Add `defeated_in_chase?` method to check defeat status
  - Calculate based on chase points and driver type
  - Return boolean indicating defeat status
- Add `defeat_type(shot)` method to determine "crashed" or "boxed_in"
  - Check shot.was_rammed_or_damaged boolean field
  - Return "crashed" if was damaged and defeated, "boxed_in" if defeated without damage, nil if not defeated

#### ChaseActionService Updates
- Modify `apply_chase_action` logic to:
  - Set shot.was_rammed_or_damaged to true when action type is ram, sideswipe, or weapon attack
  - Check for defeat crossing when updating chase points
  - When defeat threshold crossed, create fight_event record with specific message:
    - "[Vehicle Name] has crashed!" if shot.was_rammed_or_damaged is true
    - "[Vehicle Name] is boxed in!" if shot.was_rammed_or_damaged is false
- Broadcast defeat event via existing ActionCable infrastructure with defeat type

#### Database Migration
- Add `was_rammed_or_damaged` boolean field to shots table
  - Default value: false
  - Only relevant for shots with vehicles (not characters)

#### API Response Enhancements
- Include `is_defeated_in_chase` boolean in vehicle JSON serialization (when serialized with shot context)
- Include `defeat_type` ("crashed", "boxed_in", or null) in vehicle JSON serialization (when serialized with shot context)
- Include `defeat_threshold` value for frontend display
- Include `was_rammed_or_damaged` from the associated shot record
- Include `impairments` from the associated shot record (not from vehicle.impairments)
- Ensure driver type is properly included in vehicle responses

#### Shot Serialization
- When vehicles are serialized in fight context, fight-specific data comes from shot:
  - `impairments` from shot.impairments
  - `was_rammed_or_damaged` from shot.was_rammed_or_damaged
- Chase Points and Condition Points remain in vehicle's action_values as they persist across fights
- This ensures fight-specific state (impairments, damage history) is properly scoped while maintaining vehicle damage tracking

### Real-time Updates
- Use existing ActionCable infrastructure
- Broadcast defeat events on FightChannel
- Include vehicle ID, defeat status, and threshold in broadcast payload

### Performance Considerations
- Defeat calculation is simple threshold comparison (O(1))
- No database schema changes required
- Leverage existing caching for character/vehicle type lookups

### Testing Requirements
- Unit tests for `isDefeated` and `getDefeatThreshold` methods
- Component tests for defeat indicator display
- Integration tests for defeat detection on chase point updates
- E2E test for complete chase defeat scenario
