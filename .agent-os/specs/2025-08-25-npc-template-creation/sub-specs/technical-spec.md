# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-25-npc-template-creation/spec.md

> Created: 2025-08-25
> Version: 1.0.0

## Technical Requirements

### Backend Requirements

- **No Backend Changes Required**
  - The existing API already supports filtering by is_template and character_type parameters
  - Templates exist within each campaign (copied during campaign creation)
  - Character model's action_values["Type"] field already distinguishes between PC, Ally, Mook, Featured Foe, Boss, and Uber-Boss
  - Existing is_template boolean flag functionality is already in place

- **API Usage**
  - Use existing `/api/v2/characters` endpoint with query parameters
  - Filter with `is_template=true` and `character_type=Featured Foe` etc.
  - No modifications to existing endpoints required

- **Query Optimization**
  - Add database indexes for efficient filtering by is_template and action_values->>'Type'
  - Implement query scopes for type-specific template fetching

### Frontend Requirements

- **SpeedDial Menu Enhancement**
  - Add "Create from Template" option to existing SpeedDial on characters list page
  - Position alongside existing "Create (PC)", "Import (from PDF)", "Generate (by AI)" options
  - Navigate to new template selection page on click

- **Template Selection Page**
  - New dedicated page for NPC template selection
  - Display templates organized by character type (Ally, Mook, Featured Foe, Boss, Uber-Boss)
  - Show simplified template preview cards
  - One-click selection to create new character from template

- **Template Preview Cards**
  - Display template name prominently
  - Show character Type badge (Featured Foe, Boss, etc.)
  - List key Action Values in a clean, scannable format:
    - Primary combat skills (Martial Arts, Guns, Sorcery)
    - Defensive values (Defense, Toughness)
    - Other key stats (Speed, Fortune, etc.)
  - Minimal visual design focused on readability
  - Optional: Show any special abilities or schticks as simple text

- **Template Library Component**
  - Create new component for browsing templates organized by type
  - Add tabs or dropdown for filtering by character type
  - Display template stats and descriptions

- **API Client Updates**
  - Update character API client to support template_type parameter
  - Add methods for fetching templates by specific character type
  - Cache template lists for performance

### Integration Points

- **Existing Template System**
  - Maintain compatibility with current is_template: true marking
  - Ensure PC template creation flow remains unchanged
  - Templates exist within each campaign
  - Templates are used to create new characters, allowing full customization

- **Campaign Context**
  - Templates are fetched from current campaign
  - Templates were copied from Master Campaign during campaign creation
  - Respect user permissions for template access

### Performance Criteria

- Template list queries should return within 200ms
- Character creation from template should complete within 500ms
- UI should display loading states during template fetching
- Template lists should be paginated if exceeding 20 items per type

## Approach

### Database Schema Changes

```sql
-- Add composite index for template queries
CREATE INDEX idx_characters_template_type 
ON characters (is_template, (action_values->>'Type')) 
WHERE is_template = true;
```

### Backend Implementation

**No Backend Changes Required**

The existing `Api::V2::CharactersController#index` action already handles:
- `is_template` parameter filtering
- `character_type` parameter filtering (action_values->>'Type')
- Standard pagination and search

```ruby
# Existing controller already supports:
GET /api/v2/characters?is_template=true&character_type=Featured%20Foe
```

### Frontend Implementation

1. **Template Selection Page**
```typescript
// src/app/characters/templates/page.tsx
interface NPCType {
  value: string;
  label: string;
  description: string;
}

const NPC_TYPES: NPCType[] = [
  { value: 'Ally', label: 'Ally', description: 'Helpful NPCs' },
  { value: 'Mook', label: 'Mook', description: 'Standard enemies' },
  { value: 'Featured Foe', label: 'Featured Foe', description: 'Notable enemies' },
  { value: 'Boss', label: 'Boss', description: 'Major antagonists' },
  { value: 'Uber-Boss', label: 'Uber-Boss', description: 'Campaign-ending threats' }
];
```

2. **Template Preview Card Component**
```typescript
// src/components/Characters/TemplatePreviewCard.tsx
interface TemplatePreviewCardProps {
  template: Character;
  onSelect: (template: Character) => void;
}

const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({ template, onSelect }) => {
  const actionValues = template.action_values || {};
  
  // Extract key combat and defensive values
  const primaryStats = [
    { label: 'Martial Arts', value: actionValues['Martial Arts'] },
    { label: 'Guns', value: actionValues['Guns'] },
    { label: 'Sorcery', value: actionValues['Sorcery'] },
    { label: 'Defense', value: actionValues['Defense'] },
    { label: 'Toughness', value: actionValues['Toughness'] },
    { label: 'Speed', value: actionValues['Speed'] },
  ].filter(stat => stat.value !== undefined && stat.value > 0);
  
  return (
    <Card onClick={() => onSelect(template)}>
      <CardContent>
        <Typography variant="h6">{template.name}</Typography>
        <Chip label={actionValues['Type']} color="primary" size="small" />
        
        <Box sx={{ mt: 2 }}>
          {primaryStats.map(stat => (
            <Box key={stat.label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">{stat.label}:</Typography>
              <Typography variant="body2" fontWeight="bold">{stat.value}</Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
```

3. **Template API Client Usage**
```typescript
// Use existing API client methods
async getTemplatesByType(type: string): Promise<Character[]> {
  const response = await client.get('/api/v2/characters', {
    params: { 
      is_template: true, 
      character_type: type,
      per_page: 50  // Get more templates at once
    }
  });
  return response.data.characters;
}

// The API already returns action_values with all stats needed for preview
```

## External Dependencies

- No new external dependencies required
- Utilizes existing Rails Active Record JSON operations
- Leverages current React component patterns
- Uses established API client structure