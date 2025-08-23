# Campaign Seeding Phase 4: Add Template Characters to Master Campaign

**Date**: 2025-08-23  
**Priority**: Medium  
**Category**: Backend  
**Status**: Open

## Description

Add 4 basic template characters to the master template campaign in `db/seeds.rb`. These characters will serve as the foundation for character creation templates that get duplicated to new campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Master template campaign contains template characters
- Characters have `is_template: true`
- Characters represent core Feng Shui 2 archetypes
- Seeding runs safely multiple times

## Actual Behavior
Master template campaign currently has no template characters.

## Related Files
**Backend (shot-server/):**
- `db/seeds.rb` - Add template character creation to master campaign
- Verify existing template character structure works

## Investigation Notes

**Implementation Requirements:**
- Create 4 basic archetype characters (Bandit, Everyday Hero, Killer, Martial Artist)  
- Set `is_template: true` and `campaign: master_template`
- Use existing character template structure from current seeds
- Include basic action values and descriptions

**Testing Requirements:**
- Verify characters are created with correct template flag
- Confirm characters belong to master template campaign
- Test seeding idempotency (find_or_create_by)

## Potential Solution

Add to `db/seeds.rb` after master template campaign creation:
```ruby
# Create template characters for the master template campaign
template_characters = [
  {
    name: 'Bandit',
    archetype: 'Bandit',
    description: 'A common criminal archetype for creating new characters.',
    type: 'PC'
  },
  {
    name: 'Everyday Hero',
    archetype: 'Everyday Hero', 
    description: 'An ordinary person thrust into extraordinary circumstances.',
    type: 'PC'
  },
  {
    name: 'Killer',
    archetype: 'Killer',
    description: 'A professional assassin or dangerous combatant.',
    type: 'PC'
  },
  {
    name: 'Martial Artist',
    archetype: 'Martial Artist',
    description: 'A warrior trained in ancient fighting techniques.',
    type: 'PC'
  }
]

template_characters.each do |template_data|
  Character.find_or_create_by(
    name: template_data[:name],
    is_template: true,
    campaign: master_template
  ) do |character|
    character.action_values = Character::DEFAULT_ACTION_VALUES.merge({
      "Archetype" => template_data[:archetype],
      "Type" => template_data[:type]
    })
    character.description = {
      "Backstory" => template_data[:description],
      "Nicknames" => "",
      "Age" => "",
      "Height" => ""
    }
  end
end

puts "Template characters created: #{master_template.characters.where(is_template: true).count}"
```

## Related Issues
- **Parent Spec**: `/specs/campaign-template-seeding-atomic-implementation.md`
- **Overall Feature**: `/issues/2025-08-23-campaign-template-seeding-background-jobs.md`
- **Previous Phase**: Campaign Seeding Phase 3 (create master template)
- **Next Phase**: Campaign Seeding Phase 5 (schtick duplicator service)