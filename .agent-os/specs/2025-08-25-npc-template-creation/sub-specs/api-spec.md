# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-25-npc-template-creation/spec.md

> Created: 2025-08-25
> Version: 1.0.0

## Overview

No new API endpoints or backend controller changes are required. The existing `/api/v2/characters` endpoint already supports all necessary operations through query parameters. Templates exist within each campaign (copied from Master Campaign during campaign creation) and can be filtered using existing query parameters.

## Existing Endpoints Used

### GET /api/v2/characters

**Purpose:** Fetch characters/templates from current campaign with filtering (existing endpoint)

**Query Parameters:** 
- `is_template` (boolean, optional) - Filter for template characters only  
- `character_type` (string, optional) - Filter by action_values->>'Type' ("PC", "Ally", "Mook", "Featured Foe", "Boss", "Uber-Boss")
- `page` (integer, optional) - Page number for pagination (default: 1)
- `per_page` (integer, optional) - Items per page (default: 15)
- `search` (string, optional) - Search by name

**Headers:**
- `Authorization: Bearer {jwt_token}`

**Example Request for Featured Foe Templates:**
```
GET /api/v2/characters?is_template=true&character_type=Featured%20Foe
```

**Response:** 
```json
{
  "characters": [
    {
      "id": "uuid",
      "name": "Ninja Template",
      "is_template": true,
      "campaign_id": "current-campaign-uuid",
      "action_values": {
        "Type": "Featured Foe",
        "Martial Arts": 12,
        "Guns": 0,
        "Sorcery": 0,
        "Defense": 13,
        "Toughness": 7,
        "Speed": 6,
        "Fortune": 0,
        "Max Fortune": 0
      },
      "skills": {},
      "schticks": [],
      "weapons": [],
      "created_at": "2025-08-25T10:00:00Z",
      "updated_at": "2025-08-25T10:00:00Z"
    }
  ],
  "meta": {
    "total": 15,
    "per_page": 15,
    "page": 1,
    "total_pages": 1
  }
}

**Note:** The action_values object contains all the stats needed for the template preview, including combat skills (Martial Arts, Guns, Sorcery) and defensive values (Defense, Toughness, Speed).
```

### POST /api/v2/characters

**Purpose:** Create a new character (existing endpoint used for template instantiation)

**Headers:**
- `Authorization: Bearer {jwt_token}`
- `Content-Type: application/json` or `multipart/form-data` (if including image)

**Request Body for Creating from Template:**
```json
{
  "character": {
    "name": "Ninja Assassin",
    "description": "A deadly ninja created from template",
    "is_template": false,
    "action_values": {
      "Type": "Featured Foe",
      "Martial Arts": 12,
      "Defense": 13,
      "Toughness": 7,
      "Speed": 6
    },
    "skills": {},
    "impairments": 0,
    "color": "#FF0000"
  }
}
```

**Note:** The frontend will first fetch the template data, then create a new character with that data (setting `is_template: false` and applying any user customizations).

## Frontend Implementation Strategy

### Template Fetching

The frontend will make requests to the existing characters endpoint with appropriate filters:

```typescript
// Fetch all Featured Foe templates from current campaign
const response = await client.get('/api/v2/characters', {
  params: {
    is_template: true,
    character_type: 'Featured Foe'
  }
});

// Fetch all NPC templates grouped by type
const npcTypes = ['Ally', 'Mook', 'Featured Foe', 'Boss', 'Uber-Boss'];
const templatesByType = {};

for (const type of npcTypes) {
  const response = await client.get('/api/v2/characters', {
    params: {
      is_template: true,
      character_type: type
    }
  });
  templatesByType[type] = response.data.characters;
}
```

### Character Creation from Template

The frontend will:
1. Fetch the selected template from current campaign
2. Copy its data (all fields including action_values, skills, schticks, weapons)
3. Set `is_template: false`
4. Allow user customization (name, description, etc.)
5. POST to the standard `/api/v2/characters` endpoint

```typescript
// Fetch template
const templateResponse = await client.get(`/api/v2/characters/${templateId}`);
const template = templateResponse.data;

// Create character from template
const newCharacter = {
  ...template,
  id: undefined, // Remove ID so a new one is generated
  is_template: false,
  name: userProvidedName || template.name,
  description: userProvidedDescription || template.description
};

// Create the character
const response = await client.post('/api/v2/characters', {
  character: newCharacter
});
```

## Backend Requirements

### Minimal Model Updates

Add scopes to the Character model if not already present:

```ruby
# app/models/character.rb
scope :templates, -> { where(is_template: true) }
scope :by_character_type, ->(type) { 
  where("action_values->>'Type' = ?", type) 
}
```

### Controller Support

The existing `Api::V2::CharactersController#index` action should support:
- Filtering by `is_template` parameter 
- Filtering by `character_type` parameter (maps to `action_values->>'Type'`)

If these filters aren't already supported, they can be added with minimal changes:

```ruby
# In index action
query = current_campaign.characters # Existing behavior
query = query.templates if params[:is_template] == 'true'
query = query.by_character_type(params[:character_type]) if params[:character_type].present?
```

## Summary

This implementation requires:
1. **No new API endpoints** - uses existing `/api/v2/characters` endpoints
2. **No new controller actions** - uses existing index and create actions
3. **Minimal backend changes** - possibly just two new scopes on Character model
4. **Frontend-driven logic** - template selection and customization handled client-side
5. **Templates in current campaign** - templates already exist in each campaign (copied during campaign creation)