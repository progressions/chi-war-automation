# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-06-up-check-system/spec.md

> Created: 2025-09-06
> Version: 1.0.0

## Schema Changes

### New Column: characters.status

**Table:** characters  
**Column:** status  
**Type:** JSONB  
**Default:** []  
**Nullable:** YES  

## Migration Specification

```ruby
class AddStatusToCharacters < ActiveRecord::Migration[8.0]
  def change
    add_column :characters, :status, :jsonb, default: []
    add_index :characters, :status, using: :gin
  end
end
```

## Column Details

### status (JSONB)

**Purpose:** Store dynamic character states that affect combat and gameplay

**Possible Values:**
- `[]` - No active status (default)
- `["up_check_required"]` - PC must make an Up Check before continuing
- `["out_of_fight"]` - Character (PC, NPC, or Mook) has been defeated and removed from combat
- Multiple statuses can be combined: `["up_check_required", "other_status"]`

**GM Override:**
- Status can be manually cleared/modified through Edit Character dialog
- Allows narrative flexibility for healing or dramatic moments

**Indexing Strategy:**
- GIN index for efficient JSONB containment queries
- Allows fast queries like: `Character.where("status @> ?", '["up_check_required"]'.to_json)`

## Model Updates

### Character Model

```ruby
# app/models/character.rb

# Add to existing validations
validate :valid_status_array

# Scope additions
scope :requiring_up_check, -> { where("status @> ?", '["up_check_required"]'.to_json) }
scope :out_of_fight, -> { where("status @> ?", '["out_of_fight"]'.to_json) }
scope :in_fight, -> { where.not("status @> ?", '["out_of_fight"]'.to_json) }

# Status helper methods
def up_check_required?
  status.include?("up_check_required")
end

def out_of_fight?
  status.include?("out_of_fight")
end

def add_status(new_status)
  update(status: (status + [new_status]).uniq)
end

def remove_status(status_to_remove)
  update(status: status - [status_to_remove])
end

def clear_status
  update(status: [])
end

private

def valid_status_array
  return if status.is_a?(Array)
  errors.add(:status, "must be an array")
end
```

## Serializer Updates

```ruby
# app/serializers/character_serializer.rb

# Add to attributes
attribute :status

# Ensure status is always an array
def status
  object.status || []
end
```

## Data Integrity Rules

1. **Status Array Validation**
   - Must always be an array (can be empty)
   - Only string values allowed in array
   - No duplicate values within array

2. **Status Transitions**
   - "up_check_required" → [] (success) or ["out_of_fight"] (failure)
   - "up_check_required" → [] (if healed below threshold before check)
   - "out_of_fight" → [] (only through GM intervention in Edit Character)
   - Multiple statuses can coexist except mutually exclusive pairs

3. **Automatic Status Management**
   - Set "up_check_required" when PC wounds >= threshold (can happen multiple times)
   - Clear "up_check_required" on successful Up Check or healing below threshold
   - Set "out_of_fight" on failed Up Check or NPC/Mook defeat
   - NPCs/Mooks get "out_of_fight" when defeated (no Up Check required)

## Performance Considerations

- JSONB chosen over array column for flexibility and future extensibility
- GIN index enables fast containment queries without full table scans
- Status checks cached in memory during active fights
- Minimal overhead for characters without active statuses (empty array)

## Migration Rollback Strategy

```ruby
class AddStatusToCharacters < ActiveRecord::Migration[8.0]
  def change
    add_column :characters, :status, :jsonb, default: []
    add_index :characters, :status, using: :gin
  end

  def down
    remove_index :characters, :status
    remove_column :characters, :status
  end
end
```

## Fight Events Logging

### fight_events Table Updates

**Event Type:** `up_check`

**Event Data Structure:**
```json
{
  "character_id": "uuid",
  "character_name": "Character Name",
  "swerve": 3,
  "fortune": 2,
  "toughness": 2,
  "total": 7,
  "threshold": 5,
  "passed": true,
  "Marks of Death": 2,
  "fortune_used": true
}
```

## Marks of Death Updates

### action_values JSONB (Existing Field)

**Storage Location:** `characters.action_values["Marks of Death"]` (already exists)

**Persistence:** Marks of Death persist between fights and sessions (existing behavior)

**New Increment Triggers:**
- When PC reaches wound threshold
- When Fortune die used in Up Check
- Manual adjustment available through character edit (existing)

## Future Extensibility

The JSONB status field allows for future status effects without schema changes:
- `["stunned"]` - Skip next action
- `["impaired"]` - Penalties to rolls
- `["blessed"]` - Temporary bonuses
- `["marked"]` - Targeted by specific enemy

Each new status can be added to the array without affecting existing functionality.