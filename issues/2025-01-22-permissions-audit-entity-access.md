# Issue: Comprehensive Permissions Audit for Entity Access Control

**Date**: 2025-01-22  
**Priority**: High  
**Category**: Authentication  
**Status**: Open

## Description

The application needs a comprehensive audit of entity-level permissions to ensure proper access control between gamemasters and regular players. Currently, the permission system is inconsistent across entities and API endpoints, with some implementing proper user-based scoping while others grant blanket campaign-wide access.

**Current Permission Requirements:**
- **Gamemasters**: Should see ALL entities in their campaign regardless of ownership
- **Players**: Should see only entities they own OR are associated with through ownership relationships
- **Players**: Should be able to edit/create only their own entities (Characters, Vehicles)
- **Players**: Should be able to view related entities (Fights containing their Characters, Parties containing their Characters, etc.)

## Steps to Reproduce

Current inconsistent behavior across different endpoints:
1. Navigate to Characters page as a player - may see all campaign characters instead of only owned ones
2. View Parties page as a player - may see parties containing characters they don't own
3. Access Fights page as a player - may see fights they're not participating in
4. Attempt to edit entities owned by other players - may be allowed when it shouldn't be

## Expected Behavior

### For Players (non-gamemaster users):
**Viewable Entities:**
- **Characters**: Only characters they own (`character.user_id == current_user.id`)
- **Vehicles**: Only vehicles they own (`vehicle.user_id == current_user.id`)
- **Fights**: Only fights containing characters/vehicles they own
- **Parties**: Only parties containing characters/vehicles they own
- **Sites**: Only non-secret sites, plus sites referenced by entities they can see
- **Factions**: Only factions referenced by entities they can see
- **Junctures**: All active junctures (system data)
- **Campaigns**: Only campaigns they're members of
- **Users**: Only other users in campaigns they share

**Editable Entities:**
- **Characters**: Only characters they own
- **Vehicles**: Only vehicles they own  
- **All other entities**: Read-only (cannot create/edit/delete)

### For Gamemasters:
- **All entities**: Full CRUD access to all entities in campaigns they own
- **Campaign management**: Full control over their campaigns

## Actual Behavior

**Permission Inconsistencies Found:**

### V2 API (Current Issues):
- `Api::V2::CharactersController#set_scoped_characters` - Shows ALL campaign characters regardless of user
- Many V2 controllers lack user-based scoping entirely

### V1 API (Mixed Implementation):
- `Api::V1::VehiclesController#set_scoped_vehicles` - ✅ Correctly scoped by user vs gamemaster
- `Api::V1::CharactersAndVehiclesController` - ✅ Correctly scoped by user vs gamemaster  
- `Api::V1::PartiesController` - ❌ Shows all parties, only filters by secret flag
- `Api::V1::SitesController` - ❌ Shows all sites, only filters by secret flag
- `Api::V1::FactionsController` - ❌ Shows all factions, only filters by active flag

## Related Files

### Backend Controllers (Need Permission Audit)
**V2 API:**
- `/shot-server/app/controllers/api/v2/characters_controller.rb` - Missing user scoping
- `/shot-server/app/controllers/api/v2/vehicles_controller.rb` - Need to verify scoping
- `/shot-server/app/controllers/api/v2/fights_controller.rb` - Need to verify scoping
- `/shot-server/app/controllers/api/v2/parties_controller.rb` - Likely missing scoping
- `/shot-server/app/controllers/api/v2/sites_controller.rb` - Likely missing scoping
- `/shot-server/app/controllers/api/v2/factions_controller.rb` - Likely missing scoping

**V1 API (Mixed):**
- `/shot-server/app/controllers/api/v1/vehicles_controller.rb:77-80` - ✅ Good implementation
- `/shot-server/app/controllers/api/v1/characters_and_vehicles_controller.rb:141-152` - ✅ Good implementation
- `/shot-server/app/controllers/api/v1/parties_controller.rb:12-15` - ❌ Needs user scoping
- `/shot-server/app/controllers/api/v1/sites_controller.rb:13-16` - ❌ Needs user scoping  
- `/shot-server/app/controllers/api/v1/factions_controller.rb:11-14` - ❌ Needs user scoping

### Models (Entity Ownership)
**Entities with User Ownership:**
- `/shot-server/app/models/character.rb:70` - `belongs_to :user, optional: true`
- `/shot-server/app/models/vehicle.rb:28` - `belongs_to :user, optional: true` 
- `/shot-server/app/models/campaign.rb:5` - `belongs_to :user` (gamemaster)
- `/shot-server/app/models/effect.rb:3` - `belongs_to :user, optional: true`

**Entities without User Ownership (Campaign-scoped):**
- Party, Site, Faction, Juncture, Fight, Weapon, Schtick (belong to campaign only)

### Frontend Components (Need Permission Updates)
- Character/Vehicle list components - May need filtering logic
- Party/Site/Faction components - Need to implement user-based visibility
- Fight components - Need to show only relevant fights

## Screenshots/Evidence

Current permission implementation examples:
- `Api::V1::VehiclesController:77-80` shows proper gamemaster vs user scoping pattern
- `Api::V2::CharactersController` shows problematic blanket campaign access
- Test files show inconsistent permission expectations across endpoints

## Investigation Notes

### Current Permission Patterns

**Good Pattern (V1 Vehicles/Characters):**
```ruby
def set_scoped_vehicles
  if current_user.gamemaster?
    @scoped_vehicles = current_campaign.vehicles
  else
    @scoped_vehicles = current_user.vehicles
  end
end
```

**Problematic Pattern (V2 Characters, V1 Parties/Sites/Factions):**
```ruby
def set_scoped_characters
  @scoped_characters = current_campaign.characters # No user filtering!
end
```

### Entity Relationship Analysis

**Player should see Fights containing their Characters:**
- Need junction through `fights.shots.character.user_id == current_user.id`
- Or `fights.shots.vehicle.user_id == current_user.id`

**Player should see Parties containing their Characters:**
- Need junction through `parties.memberships.character.user_id == current_user.id`
- Or `parties.memberships.vehicle.user_id == current_user.id`

## Potential Solution

### Phase 1: Audit Current State
1. **Document current permissions** for each controller/endpoint
2. **Identify security gaps** where players see/edit unauthorized data
3. **Test with non-gamemaster user** to verify current behavior

### Phase 2: Implement Consistent Scoping
1. **Update V2 API controllers** to match V1's good patterns
2. **Fix V1 controllers** that lack proper user scoping
3. **Add relationship-based scoping** for Fights and Parties

### Phase 3: Model-Level Helpers
1. **Add scopes to models** for user-accessible entities
2. **Create helper methods** for complex relationship filtering
3. **Standardize permission checks** across controllers

### Phase 4: Frontend Updates
1. **Update API clients** to respect new permission boundaries
2. **Add permission-aware UI** components
3. **Hide/show controls** based on user permissions

### Example Implementation

**Model Scopes:**
```ruby
# In Fight model
scope :accessible_to_user, ->(user) { 
  joins(:shots).where(shots: { 
    character: user.characters 
  }).or(joins(:shots).where(shots: { 
    vehicle: user.vehicles 
  })).distinct 
}

# In Party model  
scope :accessible_to_user, ->(user) {
  joins(:memberships).where(memberships: { 
    character: user.characters 
  }).or(joins(:memberships).where(memberships: { 
    vehicle: user.vehicles 
  })).distinct
}
```

**Controller Pattern:**
```ruby
def set_scoped_entities
  if current_user.gamemaster?
    @scoped_entities = current_campaign.entities
  else
    @scoped_entities = current_campaign.entities.accessible_to_user(current_user)
  end
end
```

## Related Issues

This audit should be completed before implementing other user-facing features to ensure security compliance.