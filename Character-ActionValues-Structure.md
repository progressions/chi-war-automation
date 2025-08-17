# Character Action Values Structure

## Overview

In the Chi War application, characters store their game mechanics in a structured JSON field called `action_values`. This document explains the complete structure and purpose of each field based on the Feng Shui 2 RPG system.

## Core Data Structure

The `action_values` field is a JSON hash containing all character mechanical attributes. Every character starts with default values that are merged with any custom values.

### Default Action Values Structure

```ruby
DEFAULT_ACTION_VALUES = {
  # === COMBAT SKILLS ===
  "Guns" => 0,                    # Firearms skill
  "Martial Arts" => 0,            # Hand-to-hand combat skill  
  "Sorcery" => 0,                 # Magic/supernatural skill
  "Scroungetech" => 0,            # Technology/gadget skill
  "Genome" => 0,                  # Genetic manipulation skill
  "Mutant" => 0,                  # Mutant powers skill
  "Creature" => 0,                # Creature abilities skill

  # === DEFENSIVE ATTRIBUTES ===
  "Defense" => 0,                 # Difficulty to hit the character
  "Toughness" => 0,               # Damage resistance
  "Speed" => 0,                   # Initiative and movement

  # === FORTUNE MECHANICS ===
  "Fortune" => 0,                 # Current fortune points
  "Max Fortune" => 0,             # Maximum fortune points
  "FortuneType" => "Fortune",     # Type of fortune (Fortune/Chi/etc)

  # === COMBAT PREFERENCES ===
  "MainAttack" => "Guns",         # Primary attack skill name
  "SecondaryAttack" => nil,       # Secondary attack skill name

  # === STATUS TRACKING ===
  "Wounds" => 0,                  # Current wound level
  "Type" => "PC",                 # Character type classification
  "Marks of Death" => 0,          # Death markers (for dramatic purposes)
  "Archetype" => "",              # Character archetype/template
  "Damage" => 0,                  # Current damage taken
}
```

## Character Type System

Characters are classified by their `Type` field, which determines their role and mechanical behavior:

### Available Types
- **"PC"** - Player Character (heroes)
- **"Ally"** - Non-player allies 
- **"Mook"** - Weak enemies (cannon fodder)
- **"Featured Foe"** - Notable enemies
- **"Boss"** - Major villains
- **"Uber-Boss"** - Ultimate antagonists

### Type-Based Behavior

```ruby
def is_pc?
  action_values.fetch("Type") == "PC"
end

def good_guy?
  action_values.fetch("Type") == "PC" || action_values.fetch("Type") == "Ally"
end

def bad_guy?
  !good_guy?
end
```

## Combat Mechanics

### Attack Skills
Seven different attack skills represent different combat approaches:
- **Guns**: Firearms and ranged weapons
- **Martial Arts**: Unarmed combat and melee weapons
- **Sorcery**: Supernatural/magical attacks
- **Scroungetech**: Technology-based attacks
- **Genome**: Genetic manipulation abilities
- **Mutant**: Mutant powers and abilities
- **Creature**: Monster/creature natural attacks

### Primary Attack Resolution
```ruby
def primary_attack
  main = action_values.fetch("MainAttack")  # Get primary skill name
  action_values.fetch(main)                 # Get skill value
end
```

### Defense and Health
- **Defense**: Target number opponents must beat to hit
- **Toughness**: Reduces incoming damage
- **Wounds**: Current injury level (higher = more hurt)
- **Damage**: Additional damage beyond wounds

## Initiative and Ordering

Characters are sorted in combat using multiple criteria:

```ruby
def sort_order(shot_id=nil)
  character_type = action_values.fetch("Type")
  speed = action_values.fetch("Speed", 0).to_i - impairments.to_i
  [0, Fight::SORT_ORDER.index(character_type), speed * -1, name, shot_id].compact
end
```

This creates priority by:
1. Fight-specific positioning (0)
2. Character type (PCs first, then allies, then enemies)
3. Speed (higher speed goes first, hence * -1)
4. Name (alphabetical tiebreaker)
5. Shot ID (ultimate tiebreaker)

## Data Validation and Integrity

### Automatic Defaults
Before saving, characters automatically get missing default values:

```ruby
def ensure_default_action_values
  self.action_values ||= {}
  self.action_values = DEFAULT_ACTION_VALUES.merge(self.action_values)
end
```

### Type Coercion
Numeric fields are automatically converted to integers:

```ruby
def ensure_integer_action_values
  DEFAULT_ACTION_VALUES.select { |key, value| value == 0 }.each do |key, value|
    self.action_values[key] = self.action_values[key].to_i
  end
end
```

String fields are preserved as their default values if accidentally set to 0:

```ruby
def ensure_non_integer_action_values
  DEFAULT_ACTION_VALUES.reject { |key, value| value == 0 }.each do |key, value|
    if self.action_values[key] == 0
      self.action_values[key] = DEFAULT_ACTION_VALUES[key]
    end
  end
end
```

## Template System

### Character Templates
Characters with `is_template: true` serve as archetypes for creating new characters. Templates should have:
- Appropriate `"Type"` (usually "PC" for player templates)
- Meaningful `"Archetype"` (e.g., "Bandit", "Martial Artist", "Killer")
- Balanced skill distributions appropriate for the archetype

### Template Creation Example
```ruby
Character.create!(
  name: "Bandit",
  is_template: true,
  campaign: campaign,
  action_values: DEFAULT_ACTION_VALUES.merge({
    "Archetype" => "Bandit",
    "Type" => "PC",
    "MainAttack" => "Guns",
    "Guns" => 13,
    "Defense" => 14,
    "Toughness" => 7
  })
)
```

## Related Data Structures

### Skills
Separate from action_values, characters have a `skills` hash for non-combat abilities:

```ruby
DEFAULT_SKILLS = {
  "Deceit" => 0, "Detective" => 0, "Driving" => 0, "Fix-It" => 0,
  "Gambling" => 0, "Intimidation" => 0, "Intrusion" => 0, "Leadership" => 0,
  "Medicine" => 0, "Police" => 0, "Sabotage" => 0, "Seduction" => 0,
  "Constitution" => 0, "Will" => 0, "Notice" => 0, "Strength" => 0
}
```

### Description
Character descriptions are also structured hashes:

```ruby
DEFAULT_DESCRIPTION = {
  "Nicknames" => "", "Age" => "", "Height" => "", "Weight" => "",
  "Hair Color" => "", "Eye Color" => "", "Style of Dress" => "",
  "Appearance" => "", "Background" => "", "Melodramatic Hook" => ""
}
```

## Integration Points

### JSON API Output
The `as_v1_json` method formats action_values for frontend consumption, with special handling for:
- PC vs NPC wound tracking (PCs use character wounds, NPCs use shot counts)
- Shot-specific data merging
- Impairment calculations

### Notion Sync
Characters can sync to Notion databases with field mapping from action_values to Notion properties.

### Database Queries
Characters can be filtered by type using JSON operators:

```ruby
scope :by_type, -> (player_type) do
  where("action_values->>'Type' IN (?)", player_type)
end
```

## Best Practices

1. **Always use the accessor methods** (`is_pc?`, `primary_attack`) rather than direct hash access
2. **Let the validation callbacks handle defaults** - don't manually merge DEFAULT_ACTION_VALUES
3. **Use appropriate Types** for character classification
4. **Set meaningful Archetypes** for templates and important characters
5. **Ensure MainAttack matches an actual skill** the character possesses
6. **Use consistent capitalization** for skill names (matches DEFAULT_ACTION_VALUES keys)

This structure provides a flexible foundation for the Feng Shui 2 RPG system while maintaining data integrity and supporting both player characters and various NPC types.