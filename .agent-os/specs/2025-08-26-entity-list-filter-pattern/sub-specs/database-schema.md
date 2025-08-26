# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-26-entity-list-filter-pattern/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Schema Changes

### Add Active Field to All Entity Tables

The following tables need the `active` boolean field added:

```ruby
# Migration: add_active_field_to_entities.rb

class AddActiveFieldToEntities < ActiveRecord::Migration[8.0]
  def change
    # Add active field to tables that don't have it
    add_column :characters, :active, :boolean, default: true, null: false unless column_exists?(:characters, :active)
    add_column :campaigns, :active, :boolean, default: true, null: false unless column_exists?(:campaigns, :active)
    add_column :fights, :active, :boolean, default: true, null: false unless column_exists?(:fights, :active)
    add_column :vehicles, :active, :boolean, default: true, null: false unless column_exists?(:vehicles, :active)
    add_column :weapons, :active, :boolean, default: true, null: false unless column_exists?(:weapons, :active)
    add_column :schticks, :active, :boolean, default: true, null: false unless column_exists?(:schticks, :active)
    add_column :sites, :active, :boolean, default: true, null: false unless column_exists?(:sites, :active)
    add_column :factions, :active, :boolean, default: true, null: false unless column_exists?(:factions, :active)
    add_column :parties, :active, :boolean, default: true, null: false unless column_exists?(:parties, :active)
    
    # Add indexes for performance
    add_index :characters, :active unless index_exists?(:characters, :active)
    add_index :campaigns, :active unless index_exists?(:campaigns, :active)
    add_index :fights, :active unless index_exists?(:fights, :active)
    add_index :vehicles, :active unless index_exists?(:vehicles, :active)
    add_index :weapons, :active unless index_exists?(:weapons, :active)
    add_index :schticks, :active unless index_exists?(:schticks, :active)
    add_index :sites, :active unless index_exists?(:sites, :active)
    add_index :factions, :active unless index_exists?(:factions, :active)
    add_index :parties, :active unless index_exists?(:parties, :active)
  end
end
```

### Migrate Existing Hidden/Secret Fields

```ruby
# Migration: migrate_hidden_fields_to_active.rb

class MigrateHiddenFieldsToActive < ActiveRecord::Migration[8.0]
  def up
    # Migrate existing hidden fields to active
    if column_exists?(:characters, :hidden)
      execute "UPDATE characters SET active = NOT hidden WHERE hidden IS NOT NULL"
    end
    
    if column_exists?(:sites, :secret)
      execute "UPDATE sites SET active = NOT secret WHERE secret IS NOT NULL"
    end
    
    if column_exists?(:factions, :hidden)
      execute "UPDATE factions SET active = NOT hidden WHERE hidden IS NOT NULL"
    end
    
    # Set any NULL values to true (active by default)
    execute "UPDATE characters SET active = true WHERE active IS NULL"
    execute "UPDATE campaigns SET active = true WHERE active IS NULL"
    execute "UPDATE fights SET active = true WHERE active IS NULL"
    execute "UPDATE vehicles SET active = true WHERE active IS NULL"
    execute "UPDATE weapons SET active = true WHERE active IS NULL"
    execute "UPDATE schticks SET active = true WHERE active IS NULL"
    execute "UPDATE sites SET active = true WHERE active IS NULL"
    execute "UPDATE factions SET active = true WHERE active IS NULL"
    execute "UPDATE parties SET active = true WHERE active IS NULL"
  end
  
  def down
    # Reverse migration if needed
    if column_exists?(:characters, :hidden)
      execute "UPDATE characters SET hidden = NOT active WHERE active IS NOT NULL"
    end
    
    if column_exists?(:sites, :secret)
      execute "UPDATE sites SET secret = NOT active WHERE active IS NOT NULL"
    end
    
    if column_exists?(:factions, :hidden)
      execute "UPDATE factions SET hidden = NOT active WHERE active IS NOT NULL"
    end
  end
end
```

### Remove Deprecated Columns (After Verification)

```ruby
# Migration: remove_deprecated_visibility_columns.rb
# Run this migration only after confirming active field is working correctly

class RemoveDeprecatedVisibilityColumns < ActiveRecord::Migration[8.0]
  def change
    remove_column :characters, :hidden, :boolean if column_exists?(:characters, :hidden)
    remove_column :sites, :secret, :boolean if column_exists?(:sites, :secret)
    remove_column :factions, :hidden, :boolean if column_exists?(:factions, :hidden)
  end
end
```

## Migrations

### Migration Order

1. **AddActiveFieldToEntities** - Adds the `active` field to all entity tables
2. **MigrateHiddenFieldsToActive** - Migrates existing visibility fields to `active`
3. **RemoveDeprecatedVisibilityColumns** - Removes old visibility columns (run after verification)

### Model Scope Updates

Add to all entity models:

```ruby
# app/models/concerns/visibility_scopes.rb
module VisibilityScopes
  extend ActiveSupport::Concern
  
  included do
    scope :active, -> { where(active: true) }
    scope :inactive, -> { where(active: false) }
    scope :visible, ->(show_hidden = false) { show_hidden ? all : active }
  end
end

# Include in each model:
class Character < ApplicationRecord
  include VisibilityScopes
  # ...
end
```

### Index Strategy

- Add index on `active` field for all entities to optimize filtering queries
- Composite indexes on `(campaign_id, active)` may be beneficial for frequently queried entities
- Monitor query performance and add additional indexes as needed

## Data Migration Considerations

- All existing records default to `active: true` to maintain current visibility
- Existing `hidden`, `secret` fields are inverted and migrated to `active`
- Migration includes safety checks with `column_exists?` and `index_exists?`
- Backward compatibility maintained during transition period