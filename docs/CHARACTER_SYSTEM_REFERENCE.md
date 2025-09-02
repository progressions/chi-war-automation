# Chi War Character System - Complete Reference Guide

## Overview

The Chi War Character system is built around the Feng Shui 2 RPG mechanics, supporting both player characters (PCs) and non-player characters (NPCs) with a rich action value system, skills, descriptions, and combat mechanics. Characters can participate in fights through the Shot system and are organized within campaigns.

## Backend Character Model (`Character`)

### Database Schema

```ruby
# Primary table: characters
id: uuid (primary key)
name: string (required, unique within campaign)
active: boolean (default: true, soft delete mechanism)
campaign_id: uuid (required, belongs to Campaign)
user_id: uuid (optional, character owner)
faction_id: uuid (optional, belongs to Faction)
juncture_id: uuid (optional, belongs to Juncture)

# JSON fields for flexible data storage
action_values: jsonb (combat stats, character type, attacks)
description: jsonb (appearance, background, physical traits)
skills: jsonb (skill values for various abilities)

# Additional fields
color: string (display color for UI)
image_url: string (character portrait)
impairments: integer (combat penalty from wounds)
defense: integer (legacy field, now stored in action_values)
notion_page_id: uuid (Notion integration)
last_synced_to_notion_at: datetime
task: boolean (AI generation task flag)
summary: string (brief character description)
wealth: string (economic status)
is_template: boolean (template character for duplication)

# Timestamps
created_at: datetime
updated_at: datetime
```

### Action Values System

⚠️ **CRITICAL**: The `action_values` JSONB field contains BOTH combat stats AND character metadata including the character's Type (PC, NPC, etc). When filtering by "character_type" in the API, you're actually filtering by `action_values["Type"]`, NOT a separate database column.

Action Values are the core mechanical stats stored in the `action_values` JSONB field:

#### Combat Action Values (Integer-based)
- **Guns**: Firearms attack value (typically 0-20, max ~25)
- **Martial Arts**: Hand-to-hand combat value (typically 0-20, max ~25)
- **Sorcery**: Magic attack value (typically 0-20, max ~25)
- **Scroungetech**: Future tech attack value (typically 0-20, max ~25)
- **Genome**: Genetic enhancement value (typically 0-20, max ~25)
- **Mutant**: Mutation power value (typically 0-20, max ~25)
- **Creature**: Monster/creature attack value (typically 0-20, max ~25)
- **Defense**: Defensive rating (typically 0-20, max ~25)
- **Toughness**: Damage resistance (typically 0-20, max ~25)
- **Speed**: Initiative and movement (typically 0-20, max ~25)

#### Fortune System
- **Fortune**: Current fortune points (typically 0-10, max ~15)
- **Max Fortune**: Maximum fortune points (typically 0-10, max ~15)
- **FortuneType**: Type of fortune ("Fortune", "Chi", "Magic", etc.)

#### Character Configuration
- **MainAttack**: Primary attack type (references one of the attack values)
- **SecondaryAttack**: Secondary attack type (optional)
- **Type**: ⚠️ **IMPORTANT: Character classification stored in action_values JSON** (PC, Ally, Mook, Featured Foe, Boss, Uber-Boss)
- **Archetype**: Character archetype/class (string)
- **Wounds**: Current wound points (typically 0-50)
- **Damage**: Weapon damage modifier (string/number)
- **Marks of Death**: Death spiral markers (0-5)

### Default Values

```ruby
DEFAULT_ACTION_VALUES = {
  "Guns" => 0, "Martial Arts" => 0, "Sorcery" => 0,
  "Scroungetech" => 0, "Genome" => 0, "Mutant" => 0,
  "Creature" => 0, "Defense" => 0, "Toughness" => 0,
  "Speed" => 0, "Fortune" => 0, "Max Fortune" => 0,
  "FortuneType" => "Fortune", "MainAttack" => "Guns",
  "SecondaryAttack" => nil, "Wounds" => 0, "Type" => "PC",
  "Marks of Death" => 0, "Archetype" => "", "Damage" => 0
}
```

### Character Types

```ruby
CHARACTER_TYPES = [
  "PC",           # Player Character
  "Ally",         # Friendly NPC
  "Mook",         # Weak enemy (special mechanics)
  "Featured Foe", # Named opponent
  "Boss",         # Major antagonist
  "Uber-Boss"     # Campaign-ending threat
]
```

### Description System

Physical and background information stored in `description` JSONB:

```ruby
DEFAULT_DESCRIPTION = {
  "Nicknames" => "", "Age" => "", "Height" => "",
  "Weight" => "", "Hair Color" => "", "Eye Color" => "",
  "Style of Dress" => "", "Appearance" => "",
  "Background" => "", "Melodramatic Hook" => ""
}
```

### Skills System

Various abilities stored in `skills` JSONB with default values:

```ruby
DEFAULT_SKILLS = {
  "Deceit" => 0, "Detective" => 0, "Driving" => 0,
  "Fix-It" => 0, "Gambling" => 0, "Intimidation" => 0,
  "Intrusion" => 0, "Leadership" => 0, "Medicine" => 0,
  "Police" => 0, "Sabotage" => 0, "Seduction" => 0,
  "Constitution" => 0, "Will" => 0, "Notice" => 0, "Strength" => 0
}
```

### Model Relationships

```ruby
# Core relationships
belongs_to :campaign (required)
belongs_to :user, optional: true # Character owner
belongs_to :faction, optional: true # Organizational allegiance
belongs_to :juncture, optional: true # Time period

# Combat system
has_many :shots, dependent: :destroy # Initiative tracking
has_many :fights, through: :shots # Combat encounters
has_many :character_effects # Temporary effects in fights

# Equipment and abilities
has_many :character_schticks, dependent: :destroy
has_many :schticks, through: :character_schticks # Special abilities
has_many :carries
has_many :weapons, through: :carries # Equipment

# Social organization
has_many :memberships
has_many :parties, through: :memberships # Groups
has_many :attunements
has_many :sites, through: :attunements # Locations

# Progression tracking
has_many :advancements # Character development
has_many :image_positions # UI positioning data

# File attachments
has_one_attached :image # Character portrait
```

### Included Concerns

1. **Broadcastable**: Real-time updates via WebSocket
2. **WithImagekit**: Image management with ImageKit service
3. **OnboardingTrackable**: Track user onboarding milestones
4. **CacheVersionable**: Cache invalidation management

### Key Model Methods

#### Character Identification
```ruby
def is_pc?
  action_values.fetch("Type") == "PC"
end

def good_guy?
  ["PC", "Ally"].include?(action_values.fetch("Type"))
end

def bad_guy?
  !good_guy?
end
```

#### Combat Mechanics
```ruby
def primary_attack
  main = action_values.fetch("MainAttack")
  action_values.fetch(main)
end

def sort_order(shot_id=nil)
  character_type = action_values.fetch("Type")
  speed = action_values.fetch("Speed", 0).to_i - impairments.to_i
  [0, Fight::SORT_ORDER.index(character_type), speed * -1, name, shot_id].compact
end
```

#### Data Export/Import
```ruby
def as_v1_json(args={})
  # Complex JSON serialization for API v1
  # Includes all character data plus fight-specific information
end

def as_notion(args={})
  # Format data for Notion integration
end

def attributes_from_notion(page)
  # Import data from Notion pages
end
```

### Validations and Business Rules

1. **Name uniqueness** within campaign scope
2. **Owner validation**: New owner must be campaign member (except gamemaster)
3. **Association validation**: All related entities must belong to same campaign
4. **Data integrity**: Automatic JSON field initialization and type coercion

## Frontend TypeScript Types

### Core Interfaces

```typescript
// Union type for all characters
export type Character = Vehicle | Person

// Character categories
export type CharacterCategory = "character" | "vehicle"

// Character types enum
export type CharacterType =
  | "PC" | "Ally" | "Mook" 
  | "Featured Foe" | "Boss" | "Uber-Boss"
```

### Person Interface

```typescript
export interface Person extends BaseEntity {
  id: string
  name: string
  active: boolean
  impairments: number
  color: string
  faction_id: string | null
  faction: Faction
  action_values: ActionValues
  description: DescriptionValues
  schticks: Schtick[]
  schtick_ids?: string[]
  skills: SkillValues
  advancements: Advancement[]
  advancement_ids?: string[]
  sites: Site[]
  site_ids?: string[]
  weapons: Weapon[]
  weapon_ids?: string[]
  party_ids?: string[]
  user?: User
  user_id: string
  created_at: string
  updated_at: string
  new?: boolean
  category: CharacterCategory
  count: number
  driver?: Character
  location?: string
  image_url: string
  task: boolean
  notion_page_id: string | null
  wealth: string
  juncture_id: string | null
}
```

### ActionValues Interface

```typescript
export interface ActionValues {
  [key: string]: string | number | null | undefined | boolean
  Guns?: number
  "Martial Arts"?: number
  Sorcery?: number
  Scroungetech?: number
  Genome?: number
  Creature?: number
  Defense?: number
  Toughness?: number
  Speed?: number
  Fortune?: number
  "Max Fortune"?: number
  FortuneType?: string
  MainAttack?: string
  SecondaryAttack?: string | null
  Wounds: number
  Type?: CharacterType
  Damage?: number
  Vehicle?: boolean
  "Marks of Death": number
  Archetype: Archetype
}
```

### Skills and Description Types

```typescript
export interface SkillValues {
  [key: string]: number | undefined
  Deceit?: number
  Detective?: number
  Driving?: number
  "Fix-It"?: number
  // ... all skill types
}

export type DescriptionValues = {
  [key in DescriptionKeys]: string
}

export enum DescriptionKeys {
  Nicknames = "Nicknames",
  Age = "Age",
  Height = "Height",
  Weight = "Weight",
  HairColor = "Hair Color",
  EyeColor = "Eye Color",
  StyleOfDress = "Style of Dress",
  Appearance = "Appearance",
  Background = "Background",
  MelodramaticHook = "Melodramatic Hook",
}
```

## API Endpoints (V2)

### RESTful Character Operations

```
GET    /api/v2/characters              # List characters with filtering
POST   /api/v2/characters              # Create new character
GET    /api/v2/characters/:id          # Show character details
PATCH  /api/v2/characters/:id          # Update character
DELETE /api/v2/characters/:id          # Delete character (soft delete)
```

### Special Actions

```
POST   /api/v2/characters/:id/duplicate    # Clone character
POST   /api/v2/characters/import           # Import from PDF
GET    /api/v2/characters/:id/pdf          # Export to PDF
PATCH  /api/v2/characters/:id/sync         # Sync with Notion
DELETE /api/v2/characters/:id/remove_image # Remove character image
```

### Query Parameters

**Filtering:**
- `faction_id`: Filter by faction (use "__NONE__" for no faction)
- `juncture_id`: Filter by juncture
- `user_id`: Filter by owner
- `character_type`: ⚠️ **Filters by action_values["Type"]** (PC, Ally, Mook, etc.)
- `archetype`: Filter by archetype
- `search`: Name search (ILIKE)
- `party_id`: Characters in specific party
- `fight_id`: Characters in specific fight
- `site_id`: Characters attuned to specific site

**Template System:**
- `template_filter`: "templates", "non-templates", "all" (admin only)
- `is_template`: Legacy boolean parameter

**Visibility:**
- `visibility`: "visible", "hidden", "all"
- `show_hidden`: Boolean for hidden characters

**Pagination & Sorting:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)
- `sort`: "name", "created_at", "updated_at", "type", "archetype"
- `order`: "ASC" or "DESC"

## Frontend Services & Components

### CharacterService

The frontend `CharacterService` provides methods for character manipulation:

#### State Modification Methods
```typescript
// Action value changes
changeAttackValue(character, attackName, value): Character
changeFortuneValue(character, value): Character
changeFortuneType(character, fortuneType): Character

// Combat mechanics
takeSmackdown(character, smackdown, toughness?): Character
takeRawWounds(character, wounds): Character
healWounds(character, wounds): Character
fullHeal(character): Character

// Skill and description updates
updateSkill(character, key, value): Character
changeDescriptionValue(character, key, value): Character
```

#### Data Reading Methods
```typescript
// Action values (adjusted for impairments)
mainAttackValue(character): number
defense(character): number
skill(character, key): number

// Raw values (not modified by impairments)
speed(character): number
toughness(character): number
maxFortune(character): number

// Calculated values
calculateWounds(character, smackdown, toughness?): number
wounds(character): number
seriousWounds(character): boolean
```

### Component Architecture

**Main Components:**
- `View`: Master character list with filtering
- `Table`: Desktop table view
- `CharactersMobile`: Mobile card view
- `Show`: Individual character display
- `CreatePage`: Character creation form
- `GeneratePage`: AI character generation
- `ImportPage`: PDF import functionality

**Display Components:**
- `display/ActionValues`: Action value grid
- `display/Skills`: Skill list
- `display/Description`: Character description
- `display/Associations`: Related entities (parties, sites, weapons, schticks)

**Edit Components:**
- `edit/ActionValuesEdit`: Action value editing forms
- `edit/SkillsManager`: Skill editing interface
- `edit/DescriptionValue`: Description field editor

## Combat System Integration

### Shot System

Characters participate in fights through the Shot model:

```ruby
class Shot < ApplicationRecord
  belongs_to :fight
  belongs_to :character, optional: true
  belongs_to :vehicle, optional: true
  has_many :character_effects
end
```

**Shot represents:**
- A character's position in initiative order
- Current combat status (location, impairments, count)
- Temporary effects during the fight
- Vehicle driving relationships

### Initiative Calculation

Character sort order in fights:
1. Character type priority (PC → Ally → Featured Foe → Boss → Uber-Boss → Mook)
2. Speed value minus impairments (descending)
3. Alphabetical name
4. Shot ID as tiebreaker

## Character Creation Workflows

### Manual Creation
1. Choose character type (PC, NPC types)
2. Set basic information (name, archetype)
3. Assign action values and skills
4. Add description details
5. Select faction, juncture, equipment
6. Upload character image

### AI Generation
1. Provide character concept prompt
2. AI generates full character data
3. Review and edit generated values
4. Save with generated image

### Template Duplication
1. Admin creates template characters (`is_template: true`)
2. Users can duplicate templates across campaigns
3. Automatic name uniqueness resolution
4. Association matching by name in target campaign

### PDF Import
1. Upload Feng Shui 2 character sheet PDF
2. PDF parsing extracts character data
3. Automatic weapon and schtick matching
4. Manual review and adjustment

## Advanced Features

### Notion Integration
- Bidirectional sync with Notion database
- Character data export to structured Notion pages
- Import updates from Notion back to Chi War

### Image Management
- ImageKit integration for image hosting
- Automatic image optimization and delivery
- Image positioning system for UI customization

### Real-time Updates
- WebSocket broadcasts for character changes
- Live updates during combat encounters
- Campaign-wide character synchronization

### Caching Strategy
- Redis caching for character lists
- Cache invalidation on character changes
- Campaign-scoped cache versioning

## Business Rules & Permissions

### Ownership Rules
1. **Campaign Gamemaster**: Can manage all characters in campaign
2. **Character Owner**: Can edit their own characters
3. **Admin Users**: Full access to all characters including templates
4. **Regular Users**: Cannot see template characters

### Template System
- Only admin users can create and manage templates
- Templates are campaign-agnostic for reuse
- Non-admin users automatically get `is_template: false`
- Template duplication creates non-template copies

### Association Constraints
- All character associations must belong to same campaign
- Faction, juncture, schticks, weapons, parties, sites must match campaign
- User assignment requires campaign membership (except gamemaster)

## Performance Considerations

### Database Optimization
- JSONB indexes on `action_values` for efficient filtering
- Composite indexes for common query patterns
- UUID primary keys for scalability
- Soft deletes via `active` flag

### Frontend Optimization
- Paginated character lists (15 per page default)
- Selective data loading with appropriate serializers
- Image lazy loading and optimization
- Component-level caching where appropriate

This comprehensive guide covers the complete Character system in Chi War, from low-level database structure to high-level user interactions. The system is designed to be flexible, performant, and true to the Feng Shui 2 RPG mechanics while providing modern web application features.