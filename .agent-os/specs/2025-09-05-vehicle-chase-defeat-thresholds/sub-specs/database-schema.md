# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-05-vehicle-chase-defeat-thresholds/spec.md

## Changes

### Add Column to Shots Table

**Table:** shots
**New Column:** was_rammed_or_damaged

**Migration:**
```ruby
class AddWasRammedOrDamagedToShots < ActiveRecord::Migration[8.0]
  def change
    add_column :shots, :was_rammed_or_damaged, :boolean, default: false, null: false
    add_index :shots, :was_rammed_or_damaged
  end
end
```

## Specifications

- **Column Type:** boolean
- **Default Value:** false
- **Nullable:** No
- **Index:** Yes (for filtering vehicles that have been damaged in chase queries)

## Rationale

- **Fight-Scoped Data:** This damage history is specific to a vehicle's participation in a particular fight/chase, not a permanent attribute of the vehicle itself
- **Automatic Scoping:** By storing on the Shot record, the data is automatically scoped to the specific fight without manual reset logic
- **Clean Separation:** Keeps fight-specific state separate from the vehicle's permanent attributes
- **Performance:** Indexed for efficient queries when checking defeat types across multiple vehicles in a chase