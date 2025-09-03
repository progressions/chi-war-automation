# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-03-chase-relationship-refactoring/spec.md

## Schema Changes

### New Table: chase_relationships

```sql
CREATE TABLE chase_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pursuer_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  evader_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  fight_id uuid NOT NULL REFERENCES fights(id) ON DELETE CASCADE,
  position varchar NOT NULL DEFAULT 'far' CHECK (position IN ('near', 'far')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamp NOT NULL,
  updated_at timestamp NOT NULL,
  
  CONSTRAINT different_vehicles CHECK (pursuer_id != evader_id),
  CONSTRAINT unique_active_relationship UNIQUE(pursuer_id, evader_id, fight_id) WHERE active = true
);

CREATE INDEX idx_chase_relationships_fight ON chase_relationships(fight_id) WHERE active = true;
CREATE INDEX idx_chase_relationships_pursuer ON chase_relationships(pursuer_id) WHERE active = true;
CREATE INDEX idx_chase_relationships_evader ON chase_relationships(evader_id) WHERE active = true;
```

### Vehicle Table Modification

Remove only the "Position" key from action_values JSONB. Keep all other fields unchanged:
- Keep "Chase Points"
- Keep "Pursuer" 
- Keep all other action values

## Rails Migration

```ruby
class CreateChaseRelationships < ActiveRecord::Migration[8.0]
  def change
    create_table :chase_relationships, id: :uuid do |t|
      t.references :pursuer, null: false, foreign_key: { to_table: :vehicles }, type: :uuid
      t.references :evader, null: false, foreign_key: { to_table: :vehicles }, type: :uuid
      t.references :fight, null: false, foreign_key: true, type: :uuid
      t.string :position, null: false, default: 'far'
      t.boolean :active, null: false, default: true
      t.timestamps
    end

    add_index :chase_relationships, :fight_id, where: "active = true"
    add_index :chase_relationships, :pursuer_id, where: "active = true"
    add_index :chase_relationships, :evader_id, where: "active = true"
    
    # Remove Position field from vehicles
    Vehicle.find_each do |vehicle|
      vehicle.action_values&.delete("Position")
      vehicle.save!(validate: false)
    end
  end
end
```