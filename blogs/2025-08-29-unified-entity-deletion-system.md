# Building a Robust Entity Deletion System: Lessons from Complex Database Relationships

*August 29, 2025*

When building the Chi War RPG management application, I encountered one of those deceptively simple requirements that turns into a significant engineering challenge: "Users should be able to delete campaigns, characters, and other entities." What started as basic CRUD operations evolved into a sophisticated unified deletion system capable of handling complex database relationships while maintaining data integrity.

## The Problem: More Than Just DELETE FROM table

In a typical web application, deletion seems straightforward. Call `destroy` on an Active Record model, return a success response, and move on. But RPG management systems have intricate relationships between entities. A campaign contains characters, fights, weapons, vehicles, factions, and sites. Characters can carry weapons from other campaigns. Schticks form prerequisite hierarchies. Users can own multiple campaigns while being members of others.

The naive approach fails spectacularly when you try to delete a campaign that has associated records:

```
PG::ForeignKeyViolationError: ERROR: update or delete on table "campaigns" 
violates foreign key constraint "fk_characters_campaign_id" on table "characters"
DETAIL: Key (id)=(123e4567-e89b-12d3-a456-426614174000) is still referenced from table "characters".
```

## The Evolution: From Ad-Hoc to Unified

Initially, each controller handled deletion constraints differently. Some returned generic error messages, others failed silently, and many simply threw database exceptions to the user. The inconsistency made the frontend unpredictable and the user experience frustrating.

I needed a systematic approach that could:
- Check all foreign key constraints before attempting deletion
- Provide clear, user-friendly error messages explaining why deletion failed
- Offer force deletion with proper cascade handling
- Maintain data integrity through transactional operations
- Work consistently across all entity types

## The Solution: Template Method Pattern with Service Objects

The solution emerged as a unified deletion service system built on the template method pattern. A base `EntityDeletionService` class provides the framework, while individual services handle entity-specific logic.

### Base EntityDeletionService

```ruby
class EntityDeletionService
  def perform_deletion(entity, force: false)
    if can_delete?(entity, force: force)
      ActiveRecord::Base.transaction do
        handle_associations(entity) if force
        entity.destroy!
        { success: true, message: 'Entity successfully deleted' }
      end
    else
      constraints = check_constraints(entity)
      { 
        success: false, 
        error: unified_error_response(
          entity_type: entity_type_name,
          entity_id: entity.id,
          constraints: constraints
        )
      }
    end
  end

  private

  def can_delete?(entity, force: false)
    return true if force
    
    constraints = check_constraints(entity)
    constraints.all? { |_, constraint| constraint[:count] == 0 }
  end

  def check_constraints(entity)
    association_counts(entity)
  end

  # Template methods to be implemented by subclasses
  def association_counts(entity)
    raise NotImplementedError
  end

  def handle_associations(entity)
    raise NotImplementedError
  end

  def entity_type_name
    raise NotImplementedError
  end
end
```

This template defines a two-phase process: first check constraints, then handle associations if force deletion is requested. The transaction ensures atomicity—either everything succeeds or everything rolls back.

### Individual Entity Services

Each entity type has its own service that implements the template methods. Here's where the complexity really shows:

#### CampaignDeletionService: The Most Complex Case

Campaigns are the most challenging entities to delete because they're central to the application's data model. A single campaign can have hundreds of associated records across nine different entity types.

```ruby
class CampaignDeletionService < EntityDeletionService
  def association_counts(campaign)
    {
      'characters' => {
        count: campaign.characters.count,
        label: 'characters'
      },
      'vehicles' => {
        count: campaign.vehicles.count,
        label: 'vehicles'
      },
      'fights' => {
        count: campaign.fights.count,
        label: 'active fights'
      },
      'weapons' => {
        count: campaign.weapons.count,
        label: 'weapons'
      }
      # ... and 5 more entity types
    }
  end

  def handle_associations(campaign)
    # Order matters - clear join tables first
    clear_join_tables(campaign)
    
    # Then delete entities in dependency order
    delete_campaign_entities(campaign)
  end

  private

  def clear_join_tables(campaign)
    character_ids = campaign.characters.pluck(:id)
    weapon_ids = campaign.weapons.pluck(:id)
    party_ids = campaign.parties.pluck(:id)

    # Handle cross-campaign relationships
    if character_ids.any? || weapon_ids.any?
      Carry.where(character_id: character_ids)
          .or(Carry.where(weapon_id: weapon_ids))
          .delete_all
    end

    CampaignMembership.where(campaign_id: campaign.id).delete_all
    Membership.where(party_id: party_ids).delete_all
    CharacterSchtick.where(character_id: character_ids).delete_all
    Attunement.where(character_id: character_ids).delete_all
    Shot.where(character_id: character_ids).delete_all
  end
end
```

The most challenging aspect here is handling cross-campaign relationships. A weapon created in Campaign A might be carried by a character in Campaign B. Deleting Campaign A requires cleaning up these relationships across campaign boundaries.

#### UserDeletionService: Preservation Strategy

User deletion presents a different challenge. When a user account is deleted, what happens to their characters and campaigns? The business logic here favors preservation over deletion:

```ruby
def handle_associations(user)
  # Nullify user_id for characters (don't delete them)
  user.characters.update_all(user_id: nil)
  
  # Nullify user_id for vehicles (don't delete them) 
  user.vehicles.update_all(user_id: nil)
  
  # Transfer campaign ownership or destroy campaigns
  user.campaigns.destroy_all
  
  # Remove from campaign memberships
  user.campaign_memberships.destroy_all
  
  # Cancel pending invitations
  user.invitations.destroy_all
end
```

This approach preserves characters and vehicles as orphaned entities rather than destroying them, recognizing that they might have significant game history worth preserving.

#### SchtickDeletionService: Hierarchical Dependencies

Schticks (special abilities in the game) can have prerequisites forming hierarchical relationships. Deleting a prerequisite schtick could break these chains:

```ruby
def handle_associations(schtick)
  # Remove schtick from all characters
  schtick.character_schticks.destroy_all
  
  # Clear prerequisite relationships - remove this as prerequisite from other schticks
  Schtick.where(prerequisite: schtick).update_all(prerequisite_id: nil)
end
```

## Frontend Integration: Smart Confirmation Dialogs

The backend's detailed constraint information enables sophisticated frontend handling. Instead of generic "cannot delete" messages, users see specific information about what's preventing deletion:

```typescript
export async function handleEntityDeletion<T extends { id: string; name?: string }>(
  entity: T,
  deleteFunction: (entity: T, params?: { force?: boolean }) => Promise<void>,
  options: { entityName: string; onSuccess: () => void; onError: (message: string) => void }
): Promise<void> {
  try {
    await deleteFunction(entity)
    onSuccess()
  } catch (error) {
    if (isDeletionConstraintError(error)) {
      const constraintMessage = formatConstraintMessage(errorData.constraints)
      const forceMessage = `This ${errorData.entity_type} has associated records:\n\n${constraintMessage}\n\nDo you want to delete it anyway?`
      
      if (confirm(forceMessage)) {
        await deleteFunction(entity, { force: true })
        onSuccess()
      }
    }
  }
}
```

The `formatConstraintMessage` function creates user-friendly descriptions:

```typescript
export function formatConstraintMessage(constraints: Record<string, DeletionConstraint>): string {
  const items = Object.entries(constraints)
    .filter(([_, constraint]) => constraint.count > 0)
    .map(([_, constraint]) => `${constraint.count} ${constraint.label}`)
    
  if (items.length === 1) return items[0]
  if (items.length === 2) return items.join(" and ")
  
  const lastItem = items.pop()
  return `${items.join(", ")}, and ${lastItem}`
}
```

This produces messages like "5 characters, 2 active fights, and 3 weapons" instead of cryptic database error messages.

## Major Challenges and Solutions

### Challenge 1: Cross-Campaign Weapon Relationships

The application allows weapons to be shared across campaigns, creating complex dependency webs. A weapon from Campaign A might be carried by characters in Campaigns B and C. Deleting any of these campaigns requires careful handling of these relationships.

**Solution**: Query for all related records regardless of campaign boundaries and clean them up systematically:

```ruby
# Find all weapons and characters in this campaign
character_ids = campaign.characters.pluck(:id)
weapon_ids = campaign.weapons.pluck(:id)

# Delete ALL carries involving these characters OR these weapons
if character_ids.any? || weapon_ids.any?
  Carry.where(character_id: character_ids)
      .or(Carry.where(weapon_id: weapon_ids))
      .delete_all
end
```

### Challenge 2: Circular Dependencies in Join Tables

Many-to-many relationships through join tables create circular dependencies. Characters belong to parties, parties belong to campaigns, but characters also belong to campaigns directly.

**Solution**: Delete join table records first, then the entities themselves in dependency order:

```ruby
def clear_join_tables(campaign)
  # Clear all join table relationships first
  CampaignMembership.where(campaign_id: campaign.id).delete_all
  Membership.where(party_id: party_ids).delete_all
  CharacterSchtick.where(character_id: character_ids).delete_all
  
  # Now safe to delete the entities themselves
  delete_campaign_entities(campaign)
end
```

### Challenge 3: Database vs. Application-Level Cascading

Rails' `dependent: :destroy` works well for simple cases, but complex scenarios require more control. Some relationships need nullification rather than deletion, others need cross-table cleanup that Rails can't handle automatically.

**Solution**: Use `entity.destroy!` in the service but handle associations manually before calling destroy. This gets the benefits of Rails callbacks and validations while maintaining precise control over the deletion cascade.

## Why This Approach Works

The unified deletion system solved several critical problems:

### Consistent User Experience
Every deletion operation now follows the same pattern: check constraints, show detailed information about blocking relationships, offer force deletion with clear consequences. Users develop a mental model that works across the entire application.

### Maintainable Code
The template method pattern eliminates code duplication while allowing each entity type to handle its specific concerns. Adding a new entity type means implementing three methods: `association_counts`, `handle_associations`, and `entity_type_name`.

### Data Integrity
Transactional operations ensure that complex deletions either complete entirely or roll back completely. No more partially-deleted campaigns or orphaned join table records.

### Frontend Simplification
Standardized error responses mean the frontend deletion handler works identically for all entity types. The complex constraint checking logic lives in one place rather than being scattered across multiple components.

## Future Enhancements

The current system handles the application's needs well, but there are opportunities for enhancement:

### Soft Deletion
Instead of permanently destroying records, the system could mark them as inactive with timestamps. This would enable "undo" functionality and preserve audit trails.

### Dependency Visualization
Before force deletion, the system could show a visual representation of all the relationships that will be affected. This would help users understand the full impact of their action.

### Batch Operations
Currently, each deletion is handled individually. Supporting bulk deletion with progress indicators would improve efficiency for large cleanup operations.

### Async Processing
Very large deletions (like campaigns with thousands of characters) could be moved to background jobs with progress notifications.

## Lessons Learned

Building this system reinforced several important principles:

**Start Simple, Evolve Systematically**: The initial ad-hoc approach worked for simple cases, but systematic refactoring was necessary as complexity grew. The template method pattern provided a clean migration path.

**User Experience Drives Technical Decisions**: The requirement for clear, actionable error messages shaped the entire architecture. Technical elegance means nothing if users can't understand what's happening.

**Database Constraints Are Features, Not Bugs**: Foreign key constraints that initially seemed like obstacles became the foundation for comprehensive constraint checking. Embracing these constraints led to better data integrity.

**Test Complex Scenarios Early**: The most valuable tests weren't unit tests of individual methods, but integration tests that created realistic data relationships and verified clean deletion. Production-like test data revealed edge cases that simpler tests missed.

The unified entity deletion system represents a significant evolution in the Chi War application's architecture. What started as a simple CRUD requirement became an opportunity to improve data integrity, user experience, and code maintainability. While still in alpha development, this foundation will support the complex entity relationships that make RPG campaign management both challenging and rewarding.

In a world of move-fast-and-break-things development, taking the time to build robust foundations for complex operations pays dividends. The deletion system now handles edge cases that would have been production bugs, provides clear user feedback that prevents confusion, and offers a maintainable architecture that will scale as the application grows.

Sometimes the most important features are the ones that work so well that users never think about them.