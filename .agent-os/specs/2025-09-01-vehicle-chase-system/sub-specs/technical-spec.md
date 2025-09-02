# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-09-01-vehicle-chase-system/spec.md

## Implementation Dependency

**IMPORTANT:** The ChasePanel implementation should closely follow the patterns and architecture established by the AttackPanel component, which is currently under development. Once AttackPanel is finalized, this specification should be reviewed and updated to ensure:
- Consistent API communication patterns
- Matching form state management approach
- Similar UI/UX structure and flow
- Parallel WebSocket integration methods
- Aligned calculation and resolution display patterns

The ChasePanel should feel like a natural companion to AttackPanel, sharing the same architectural decisions and user interaction patterns.

### Backend State Management

The backend is developing a system of **atomic combat state updates** for the AttackPanel that will be adapted for the chase system. This approach ensures:
- Transactional consistency for all state changes
- Atomic updates that prevent race conditions
- Rollback capability for failed operations
- Consistent state broadcasting via WebSocket

The chase system will leverage this same atomic update pattern for:
- Chase point modifications
- Gap distance changes
- Driver assignments
- Vehicle eliminations
- Multi-vehicle chase coordination

## Technical Requirements

### Frontend Components

- **ChasePanel Component** (`src/components/encounters/ChasePanel.tsx`)
  - Mirror structure of existing AttackPanel
  - Sections: Driver selection, Target vehicle selection, Action type (Driving Check/Sideswipe), Resolution display
  - Real-time WebSocket updates for chase state changes
  - Display Squeal and Crunch values for selected vehicles
  - Show current chase points, condition points, and gap distances

- **DriverAssignment Component** (`src/components/vehicles/DriverAssignment.tsx`)
  - Modal or inline UI for assigning characters to vehicles as drivers
  - Dropdown/autocomplete for available characters
  - Display current driver with option to change
  - Validate driver availability (not already driving another vehicle)

- **ChaseTracker Component** (`src/components/encounters/ChaseTracker.tsx`)
  - Visual display of all active chase participants
  - Show Pursuer/Evader roles with color coding
  - Display chase points with progress bars (0-35/50)
  - Gap distance indicators (Near/Far) between vehicles
  - Impairment indicators based on chase point thresholds

### State Management

- **ChaseContext** (`src/contexts/ChaseContext.tsx`)
  - Manage active chase state within encounters
  - Track participating vehicles and their roles
  - Store chase points, condition points, gap distances
  - Handle real-time updates via WebSocket subscriptions

- **Integration with EncounterContext**
  - Extend existing encounter state to include chase data
  - Coordinate with Shot system for initiative using vehicle Acceleration
  - Apply Impairment from chase points (capped at -2 total)

### Form State Management

- **ChaseFormData Interface**
  ```typescript
  interface ChaseFormData {
    driverShotId: string
    targetVehicleId: string
    actionType: 'driving_check' | 'sideswipe'
    boostValue: number
    swerve: number
    outcome: number
    chasePointsApplied: number
    conditionPointsApplied: number
    gapChange: 'closer' | 'farther' | 'no_change'
  }
  ```

### Calculations

- **Driving Check Resolution**
  - Difficulty = Target driver's Driving value
  - On success: Chase Points = Outcome + Attacker's Squeal - Target's Handling
  - Gap changes based on Pursuer/Evader role and success

- **Sideswipe Resolution** (only when Near)
  - Similar to Driving Check but adds Condition Points
  - Condition Points = Outcome + Attacker's Crunch - Target's Frame

- **Impairment Application**
  - 25-29 Chase Points: -1 Impairment
  - 30-34 Chase Points: -2 Impairment
  - Stacks with Wound Impairment (max -2 total)
  - Boss/Uber-Boss vehicles ignore chase point Impairment

### WebSocket Integration

- **Chase Channel Subscriptions**
  - Subscribe to chase state updates in EncounterContext
  - Broadcast chase actions and results to all participants
  - Real-time sync of chase points, gap distances, driver changes

### Performance Considerations

- Debounce chase state updates to prevent excessive re-renders
- Memoize complex calculations (Squeal, Crunch, Impairment)
- Lazy load ChasePanel only when chase is active
- Use React.memo for chase sub-components to prevent unnecessary updates