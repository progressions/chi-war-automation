# Issue: Implement NPC Template System

**Date**: 2025-08-24  
**Priority**: Medium  
**Category**: Backend/Frontend  
**Status**: Open

## Description
Create a comprehensive NPC template system that allows gamemasters to quickly generate common enemy and ally archetypes for their campaigns. The system should provide pre-configured character templates for Mook, Featured Foe, Boss, Uber-Boss, and Ally character types with appropriate stats, equipment, and abilities.

Currently, gamemasters must manually create each NPC from scratch, which is time-consuming and can lead to inconsistent power levels. A template system would streamline campaign preparation and ensure balanced encounters.

## Steps to Reproduce
Current workflow for creating NPCs:
1. Navigate to campaign characters page
2. Click "Create Character" 
3. Select character type (Mook, Featured Foe, etc.)
4. Manually fill in all stats, attributes, and equipment
5. Save character
6. Repeat for each NPC needed

## Expected Behavior
Enhanced workflow with templates:
1. Navigate to campaign characters page
2. Click "Create from Template" or similar option
3. Select character type and template (e.g., "Mook - Gang Member", "Boss - Corporate Executive")
4. Template auto-populates appropriate stats and equipment
5. Gamemaster can customize as needed before saving
6. Character is created with balanced, campaign-appropriate stats

## Actual Behavior
No template system exists - all NPCs must be created manually from blank forms.

## Related Files
### Backend (shot-server)
- `app/models/character.rb` - Core character model, may need template association
- `app/controllers/api/v2/characters_controller.rb` - Add template endpoints
- `app/serializers/character_serializer.rb` - Include template data in responses
- `app/models/character_template.rb` - New model for storing templates
- `db/migrate/` - New migration for character_templates table
- `db/seeds.rb` - Seed default templates

### Frontend (shot-client-next)
- `src/components/characters/CharacterForm.tsx` - Add template selection
- `src/components/characters/CharacterList.tsx` - Add "Create from Template" button
- `src/components/characters/TemplateSelector.tsx` - New component for template selection
- `src/lib/ApiV2.ts` - Add template API calls
- `src/types/character.ts` - Add template type definitions
- `src/hooks/useCharacterTemplates.ts` - New hook for template data fetching

## Screenshots/Evidence
N/A - This is a new feature request

## Investigation Notes
### Character Types and Suggested Templates
- **Mook Templates**: Gang Member, Security Guard, Cultist, Thug
- **Featured Foe Templates**: Assassin, Hacker, Martial Artist, Corporate Agent  
- **Boss Templates**: Crime Boss, Corporate Executive, Cult Leader, Military Commander
- **Uber-Boss Templates**: Ancient Sorcerer, Cyber-Enhanced Villain, Time Manipulator
- **Ally Templates**: Helpful Contact, Mentor, Specialist Contractor, Loyal Companion

### Technical Implementation Considerations
- Templates should include default values for:
  - Primary and secondary attributes
  - Skills appropriate to archetype
  - Starting equipment and weapons
  - Suggested schticks/abilities
  - Appropriate Wound and Fortune point values
- Templates should be juncture-aware (Ancient vs Contemporary vs Future variants)
- Templates should be customizable per campaign
- Consider inheritance - Boss templates could extend Featured Foe templates

### Database Schema Considerations
```sql
character_templates table:
- id (uuid)
- name (string) - "Gang Member", "Corporate Executive"
- character_type (enum) - :mook, :featured_foe, :boss, :uber_boss, :ally
- juncture_id (uuid, optional) - for juncture-specific variants
- template_data (jsonb) - serialized character attributes
- description (text) - template description for GM
- created_at/updated_at (timestamps)
```

## Potential Solution
### Phase 1: Backend Template System
1. Create `CharacterTemplate` model with appropriate validations
2. Add migration for character_templates table
3. Seed database with default templates for each character type
4. Add API endpoints: `GET /api/v2/character_templates`, `POST /api/v2/characters/from_template`
5. Update Character model to support template-based creation

### Phase 2: Frontend Integration
1. Create template selection UI component
2. Integrate template selector into character creation flow
3. Add "Create from Template" option to character list
4. Update character form to pre-populate from template data
5. Add template preview/description display

### Phase 3: Advanced Features
1. Allow gamemasters to create custom templates
2. Template sharing between campaigns
3. Juncture-specific template variants
4. Template categories and filtering

## Related Issues
N/A - This is the first issue for this feature area