# Campaign Seeding Phase 10: AI Image Generation for Template Entities

**Date**: 2025-08-24  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Generate AI images for all entities in the master template campaign to provide visual content when seeding new campaigns. This includes images for the master campaign itself, character templates, factions, junctures, and schtick categories that will be duplicated to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Master template campaign has a generated campaign image
- All character templates have AI-generated character portraits
- All template factions have AI-generated faction images
- All template junctures have AI-generated period/setting images
- Schtick categories have representative AI-generated images (rather than individual schticks due to volume - 644 schticks vs ~10 categories)
- Weapons have AI-generated images where appropriate
- Images are generated using existing AI image generation service
- Images are properly stored and associated with their entities
- Images carry over when entities are duplicated to new campaigns

## Actual Behavior
Currently template entities are created without images during the manual setup process.

## Related Files
**Backend (shot-server/):**
- `app/services/ai_service.rb` - Existing AI image generation service
- `app/jobs/` - Background jobs for image generation
- Master template campaign and associated entities
- Image storage and association logic

## Investigation Notes

**Implementation Requirements:**
- Extend existing AI image generation service to handle template entities
- Generate appropriate images for each entity type:
  - **Campaign**: General fantasy/RPG setting image
  - **Character Templates**: Character portraits based on archetype/description
  - **Factions**: Faction symbols, logos, or representative imagery
  - **Junctures**: Time period appropriate imagery (Ancient, 1850s, Contemporary, Future)
  - **Schtick Categories**: Representative imagery for each category (Guns, Martial Arts, Driving, Sorcery, Creature, etc.) rather than individual schticks
  - **Weapons**: Weapon imagery for notable/unique weapons
- Queue image generation jobs after manual template setup is complete
- Ensure images are preserved during entity duplication process

**Image Generation Strategy:**
- Use descriptive prompts based on entity attributes (name, description, type)
- Leverage existing AI prompt generation logic from character creation
- **Schtick Category Strategy**: Generate one representative image per category that can be reused across all schticks in that category
- Consider batch processing for efficiency
- Handle generation failures gracefully with fallback options
- **Volume Considerations**: With 644 individual schticks, category-level images (9 categories) are more practical than individual images

**Integration Points:**
- Hook into campaign seeding service to generate images for duplicated entities
- Ensure image URLs/associations are copied during entity duplication
- Consider regeneration options for campaigns that want fresh imagery

## Potential Solution

**Phase Implementation:**
1. **Extend AI Service**: Add methods for generating images for campaigns, factions, and junctures
2. **Create Image Generation Job**: Background job to generate images for all template entities
3. **Integration with Duplication**: Ensure images are copied when entities are duplicated
4. **Admin Interface**: Allow manual triggering of image generation for template entities

**Example Service Methods:**
```ruby
# In AiService
def generate_campaign_image(campaign)
def generate_faction_image(faction)  
def generate_juncture_image(juncture)
def generate_schtick_category_image(category_name)
def generate_weapon_image(weapon)
```

**Schtick Category Image Implementation:**
- Generate images for Schtick::CATEGORIES: ["Guns", "Martial Arts", "Driving", "Sorcery", "Creature", "Transformed Animal", "Gene Freak", "Cyborg", "Foe"]
- Store category images in a way that can be associated with individual schticks during duplication
- Consider storing as campaign-level assets or a separate SchtickCategoryImage model

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 9 (creation hook)
- **Prerequisite**: Manual master template setup completion
- **Integration**: Campaign seeder service and background job phases