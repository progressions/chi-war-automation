# Spec Requirements Document

> Spec: Vehicle Chase Defeat Thresholds
> Created: 2025-09-05

## Overview

Implement vehicle chase defeat detection based on chase points exceeding driver-type-specific thresholds, providing visual indicators and fight log entries when vehicles are defeated in chase scenes. Vehicles are defeated as either "Crashed" (if previously rammed, sideswiped, or weapon-damaged) or "Boxed In" (otherwise). This feature ensures proper chase resolution logic where pursuing vehicles that are defeated means successful evasion, while evading vehicles that are defeated means successful pursuit.

## User Stories

### Gamemaster Managing Vehicle Chases

As a Gamemaster, I want to see when a vehicle has been defeated in a chase based on its chase points, so that I can properly resolve chase scenes according to the game rules.

During a chase scene, when vehicles accumulate chase points from successful attacks against them, I need to know when a vehicle has reached its defeat threshold. The system should automatically detect when a vehicle's chase points equal or exceed the threshold based on the driver's type (Featured Foe = 35, PC/Ally = 35, Boss/Uber Boss = 50). When this happens, I should see a clear visual indicator on the vehicle's detail block showing both that it has been defeated AND the type of defeat - "CRASHED" (if the vehicle was rammed, sideswiped, or weapon-damaged at any point) or "BOXED IN" (if it reached 35 Chase Points without being rammed, sideswiped, or weapon-damaged). A log entry should appear in the fight history specifying the defeat type. This helps me narrate the appropriate outcome: crashed vehicles result in spectacular crashes while boxed-in vehicles are immobilized less dramatically (traffic, overheating, wrong turn, tire puncture, etc.).

### Player Tracking Vehicle Status

As a Player driving a vehicle in a chase, I want to clearly see when my vehicle has been defeated, so that I understand the chase outcome.

While participating in a vehicle chase, my vehicle accumulates chase points when other participants successfully make driving attacks against me. When my vehicle reaches its defeat threshold (35 chase points for PC drivers), I need a clear visual indicator showing both that my vehicle has been defeated and how it was defeated - "CRASHED" if I was rammed/sideswiped/weapon-damaged, or "BOXED IN" if I wasn't. This defeat status and type tells me the chase is over and helps me understand the narrative outcome (spectacular crash vs. immobilized by traffic/obstacles).

## Spec Scope

1. **Vehicle Defeat Detection** - Automatically detect when a vehicle's chase points equal or exceed the threshold based on driver type
2. **Defeat Type Determination** - Track whether vehicle was rammed/sideswiped/weapon-damaged to determine "Crashed" vs "Boxed In" status
3. **Visual Defeat Indicator** - Display clear indicators on the vehicle detail block showing both defeat status and type (CRASHED or BOXED IN)
4. **Fight Log Entry** - Generate a log entry in the fight history specifying defeat type: "[Vehicle] has crashed!" or "[Vehicle] is boxed in!"
5. **Threshold Calculation** - Use existing woundThresholds serious values: Featured Foe/PC/Ally = 35, Boss/Uber Boss = 50
6. **Chase Resolution Display** - Show appropriate messaging based on defeat type and pursuer/evader status

## Out of Scope

- Automatic removal of defeated vehicles from the chase
- Passenger effects or consequences
- Warning indicators at lower thresholds
- Automatic re-entry mechanics
- Special UI animations or effects
- Modifications to impairment mechanics
- Condition Points defeat handling (separate from Chase Points)

## Expected Deliverable

1. Vehicle detail blocks display defeat status ("CRASHED" or "BOXED IN") when chase points meet or exceed driver-type-based thresholds
2. Fight log shows specific entries: "[Vehicle] has crashed!" or "[Vehicle] is boxed in!" when vehicles cross defeat threshold
3. System tracks ram/sideswipe/weapon damage history to determine correct defeat type
4. Defeat status and type update in real-time as chase points are modified during gameplay