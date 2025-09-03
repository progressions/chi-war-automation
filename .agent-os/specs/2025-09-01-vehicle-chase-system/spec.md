# Spec Requirements Document

> Spec: Vehicle Chase System
> Created: 2025-09-01

## Overview

Implement a comprehensive vehicle chase system within the existing fight mechanics that allows players and GMs to conduct vehicular pursuits and evasions using Feng Shui 2's chase rules. This feature will enable dynamic vehicle combat scenarios with chase point tracking, distance management, and integrated combat actions.

## User Stories

### Gamemaster Vehicle Chase Management

As a gamemaster, I want to initiate and manage vehicle chases during encounters, so that I can run exciting vehicular action sequences.

The GM starts an encounter and has both characters and vehicles participating. When vehicles engage in pursuit, the GM opens the ChasePanel and designates which vehicles are Pursuers and which are Evaders. The GM can see all vehicles' chase points, condition points, and relative distances (Near/Far). As the chase progresses, the GM tracks chase points accumulating toward the 35-point threshold (or 50 for Boss/Uber-Boss vehicles) to determine chase outcomes.

### Player Chase Participation

As a player controlling a vehicle, I want to make driving checks and tactical decisions during chases, so that I can successfully pursue enemies or evade pursuit.

A player whose character is driving a vehicle sees their turn come up in the Shot countdown. For their first action each sequence, they must make a driving check. They select their target vehicle in the ChasePanel, see the calculated Squeal value, and resolve the action. If they're Near an opponent, they can choose to Sideswipe for both Chase and Condition points. The player sees real-time updates of chase points and gap distances.

### Passenger Combat Actions

As a passenger in a vehicle during a chase, I want to take combat actions against other vehicles and their occupants, so that I can contribute to the chase outcome.

A passenger character can use the standard AttackPanel to shoot at enemy vehicles or their occupants while the chase is ongoing. They can also provide Boosts to their driver's driving checks or defense values. The passenger suffers any Impairment from accumulated chase points but can still take meaningful actions to influence the chase.

## Spec Scope

1. **ChasePanel Component** - A new panel similar to AttackPanel for resolving vehicle chase actions, including driver selection, target selection, and action resolution
2. **Chase State Management** - Track active chases, participant vehicles, their roles (Pursuer/Evader), accumulated chase/condition points, and gap distances
3. **Driver Assignment UI** - Interface to assign and change vehicle drivers during encounters
4. **Driving Check Resolution** - Calculate outcomes using vehicle Acceleration, driver Driving skill, Squeal values, and Handling
5. **Distance Gap System** - Manage Near/Far distances between vehicles with appropriate action restrictions

## Out of Scope

- Automatic handling of incapacitated drivers
- Complex terrain or environmental chase modifiers  
- Vehicle modification or upgrade systems during chase
- Chase-specific map or visual path representation
- Branching chase routes or multiple paths
- Weather effects on chase mechanics

## Technical Implementation Details

### Database Architecture

**No new models required** - The chase system leverages existing database models:

#### Vehicle Model (`vehicles` table)
Chase data is stored in the `action_values` JSONB column:
- `"Chase Points"` - Accumulated chase points toward victory (default: 0)
- `"Condition Points"` - Vehicle damage/condition tracking (default: 0)
- `"Pursuer"` - Chase role: "true" (pursuer) or "false" (evader) (default: "true")
- `"Position"` - Gap distance: "near" or "far" (default: "far")
- `"Acceleration"` - Speed stat for driving checks (default: 0)
- `"Handling"` - Maneuverability modifier (default: 0)
- `"Squeal"` - Difficulty for driving checks (default: 0)
- `"Frame"` - Damage resistance (default: 0)
- `"Crunch"` - Damage dealing capability (default: 0)

#### Shot Model (`shots` table)
Manages driver-vehicle relationships in fights:
- `driver_id` - Foreign key to Shot containing the driver character
- `driving_id` - Foreign key to Shot containing the driven vehicle
- `vehicle_id` - Direct reference to Vehicle being driven
- `character_id` - Direct reference to Character driving

This allows tracking:
- Which character is driving which vehicle
- Vehicle participation in initiative order
- Driver assignment changes during encounters

#### Fight Model (existing)
- Contains the encounter context where chases occur
- Manages initiative countdown via shots
- Broadcasts real-time updates via WebSocket

### FS2 Chase Rules Implementation

#### Victory Conditions
- Standard vehicles: 35 chase points to win
- Boss/Uber-Boss vehicles: 50 chase points to win
- Either pursuer catching evader or evader escaping

#### Gap Distance System
- **Near**: Can perform Sideswipe attacks, standard combat actions
- **Far**: Limited to driving checks and ranged attacks

#### Driving Check Mechanics
- **Check**: Vehicle Acceleration + Driver's Driving skill
- **Difficulty**: Target vehicle's Squeal value + modifiers
- **Success**: Gain chase points, potentially change gap distance
- **Sideswipe**: Near position only, deals both Chase and Condition points

## Expected Deliverable

1. Functional ChasePanel that allows selection of driver, target, and chase action type with real-time resolution display
2. Persistent chase state tracking showing all vehicles' chase points, condition points, and relative distances with victory conditions at 35/50 points
3. Driver assignment interface integrated with vehicle management allowing dynamic driver changes during encounters