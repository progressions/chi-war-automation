# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-01-vehicle-chase-system/spec.md

## Schema Changes

### Modifications to Vehicles Table

Add new columns to the existing `vehicles` table:

```sql
ALTER TABLE vehicles
ADD COLUMN squeal integer DEFAULT 0,
ADD COLUMN crunch integer DEFAULT 0,
ADD COLUMN chase_points integer DEFAULT 0,
ADD COLUMN condition_points integer DEFAULT 0,
ADD COLUMN driver_id uuid REFERENCES characters(id) ON DELETE SET NULL,
ADD COLUMN chase_role varchar(20) CHECK (chase_role IN ('pursuer', 'evader', NULL));

-- Add indexes for performance
CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);
CREATE INDEX idx_vehicles_chase_role ON vehicles(chase_role) WHERE chase_role IS NOT NULL;
```

**Rationale:**
- `squeal` and `crunch` are vehicle-specific values that may differ from calculated defaults
- `chase_points` and `condition_points` track accumulated damage during active chases
- `driver_id` establishes the current driver relationship
- `chase_role` identifies whether vehicle is pursuing or evading in current chase

### New Chases Table

Create a table to track active vehicle chases within fights:

```sql
CREATE TABLE chases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fight_id uuid NOT NULL REFERENCES fights(id) ON DELETE CASCADE,
  status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at timestamp,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX idx_chases_fight_id ON chases(fight_id);
CREATE INDEX idx_chases_status ON chases(status);
```

**Rationale:**
- Links chases to their parent fight/encounter
- Tracks chase lifecycle with status field
- Timestamps for duration tracking and analytics

### Chase Participants Join Table

Track which vehicles are participating in which chases:

```sql
CREATE TABLE chase_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chase_id uuid NOT NULL REFERENCES chases(id) ON DELETE CASCADE,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL CHECK (role IN ('pursuer', 'evader')),
  chase_points integer NOT NULL DEFAULT 0,
  condition_points integer NOT NULL DEFAULT 0,
  eliminated_at timestamp,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chase_id, vehicle_id)
);

-- Add indexes
CREATE INDEX idx_chase_participants_chase_id ON chase_participants(chase_id);
CREATE INDEX idx_chase_participants_vehicle_id ON chase_participants(vehicle_id);
```

**Rationale:**
- Allows multiple vehicles in same chase with different roles
- Tracks individual chase/condition points per vehicle per chase
- Preserves chase history after vehicle is eliminated

### Chase Gaps Table

Track distance relationships between vehicles:

```sql
CREATE TABLE chase_gaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chase_id uuid NOT NULL REFERENCES chases(id) ON DELETE CASCADE,
  pursuer_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  evader_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  distance varchar(10) NOT NULL DEFAULT 'far' CHECK (distance IN ('near', 'far')),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chase_id, pursuer_id, evader_id)
);

-- Add indexes
CREATE INDEX idx_chase_gaps_chase_id ON chase_gaps(chase_id);
CREATE INDEX idx_chase_gaps_distance ON chase_gaps(distance);
```

**Rationale:**
- Tracks specific distance between each pursuer-evader pair
- Supports multiple pursuers at different distances
- Enables complex multi-vehicle chase scenarios

### Modifications to Shots Table

Add chase-related fields to track vehicle actions:

```sql
ALTER TABLE shots
ADD COLUMN vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
ADD COLUMN is_driving_action boolean DEFAULT false;

-- Add index
CREATE INDEX idx_shots_vehicle_id ON shots(vehicle_id) WHERE vehicle_id IS NOT NULL;
```

**Rationale:**
- Links shots to vehicles for initiative tracking
- Marks mandatory first-action driving checks
- Maintains compatibility with existing shot system

## Migration Strategy

1. Add columns to existing tables with safe defaults
2. Create new tables in dependency order
3. Backfill squeal/crunch values using formula (Handling + 2, Frame + 2)
4. Add constraints after data migration
5. Create indexes last to avoid blocking during migration

## Data Integrity Rules

- Vehicle can only have one active driver at a time
- Vehicle can only participate in one active chase per fight
- Chase points and condition points reset when chase ends
- Gap distances default to 'far' when chase begins
- Eliminated vehicles remain in chase_participants for history