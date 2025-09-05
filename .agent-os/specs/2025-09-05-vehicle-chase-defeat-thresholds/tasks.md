# Task List: Vehicle Chase Defeat Thresholds

## Backend Tasks (shot-server)

### 1. Database Migration
- [ ] Create migration to add `was_rammed_or_damaged` boolean column to shots table
  - Default value: false
  - Add index for performance
  - Run migration in development and test environments

### 2. Vehicle Model Enhancements
- [ ] Add `defeated_in_chase?` method to Vehicle model
  - Calculate based on chase points vs driver type threshold
  - Use woundThresholds serious values (35 for Featured Foe/PC/Ally, 50 for Boss/Uber Boss)
- [ ] Add `defeat_type(shot)` method to Vehicle model
  - Check shot.was_rammed_or_damaged
  - Return "crashed" if damaged and defeated
  - Return "boxed_in" if defeated without damage
  - Return nil if not defeated
- [ ] Add `defeat_threshold` method to calculate threshold based on driver type

### 3. ChaseActionService Updates
- [ ] Modify `apply_chase_action` to set shot.was_rammed_or_damaged = true for ram/sideswipe/weapon actions
- [ ] Add defeat detection after updating chase points
- [ ] Create fight_event record when vehicle crosses defeat threshold
  - Message: "[Vehicle] has crashed!" or "[Vehicle] is boxed in!"
- [ ] Trigger WebSocket broadcast on defeat

### 4. API Serialization Updates
- [ ] Update vehicle JSON serialization (as_v1_json and serializers)
  - Add `is_defeated_in_chase` boolean
  - Add `defeat_type` field ("crashed", "boxed_in", or null)
  - Add `defeat_threshold` value
  - Add `was_rammed_or_damaged` from shot record
  - Ensure `impairments` comes from shot, not vehicle model
- [ ] Update vehicles controller responses to include defeat information

## Frontend Tasks (shot-client-next)

### 5. VehicleService Extensions
- [ ] Add `isDefeated(vehicle: Vehicle): boolean` method
  - Check if chase points >= defeat threshold
- [ ] Add `getDefeatThreshold(vehicle: Vehicle): number` method
  - Calculate based on driver type using woundThresholds
- [ ] Add `getDefeatType(vehicle: Vehicle): "crashed" | "boxed_in" | null` method
  - Use vehicle.was_rammed_or_damaged field from backend

### 6. UI Component Updates
- [ ] Update VehicleDetail.tsx
  - Add defeat status badge/indicator
  - Display "CRASHED" with error severity for crashed vehicles
  - Display "BOXED IN" with warning severity for boxed in vehicles
  - Position prominently in vehicle detail header
- [ ] Update ChaseResolution.tsx (if exists) or relevant chase UI
  - Add defeat-specific messaging based on pursuer/evader status
  - "Vehicle crashed - Target escaped!" (crashed pursuer)
  - "Vehicle crashed - Caught by pursuer!" (crashed evader)
  - "Vehicle boxed in - Target escaped!" (boxed in pursuer)
  - "Vehicle boxed in - Caught by pursuer!" (boxed in evader)

### 7. Real-time Updates
- [ ] Handle vehicle_defeated_in_chase WebSocket events
  - Update vehicle state when defeat event received
  - Display fight log entry for defeat
  - Ensure UI updates reflect new defeat status

## Testing Tasks

### 8. Backend Tests
- [ ] Write RSpec tests for Vehicle model defeat methods
  - Test defeated_in_chase? with various chase points and driver types
  - Test defeat_type with different damage scenarios
- [ ] Write tests for ChaseActionService defeat detection
  - Test ram/sideswipe/weapon actions set was_rammed_or_damaged
  - Test fight_event creation on defeat
  - Test WebSocket broadcast triggering
- [ ] Test API serialization includes defeat fields correctly

### 9. Frontend Tests
- [ ] Write tests for VehicleService defeat methods
  - Test isDefeated threshold calculations
  - Test getDefeatType logic
- [ ] Test UI components display defeat indicators correctly
- [ ] Test WebSocket event handling updates UI properly

### 10. End-to-End Testing
- [ ] Test complete chase scenario with vehicle defeat
  - Add vehicles to fight
  - Apply chase actions to accumulate points
  - Verify ram/sideswipe actions set damage flag
  - Confirm defeat detection at threshold
  - Check correct defeat type displayed
  - Verify fight log entry created
  - Test both crashed and boxed in scenarios
- [ ] Test that was_rammed_or_damaged resets for new fights
- [ ] Test impairments come from shot, not vehicle

## Verification Checklist

- [ ] Defeat thresholds match Feng Shui 2 rules (35 for most, 50 for Boss/Uber Boss)
- [ ] Crashed vs Boxed In determined correctly based on damage history
- [ ] Fight-scoped data (impairments, was_rammed_or_damaged) properly isolated per fight
- [ ] Chase Points and Condition Points remain in vehicle action_values
- [ ] UI clearly indicates defeat status and type
- [ ] Fight log messages are appropriate for defeat type
- [ ] Real-time updates work for all connected clients
- [ ] No data persistence issues between different fights/chases