# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-26-entity-list-filter-pattern/spec.md

## Overview

The existing V2 controllers use a `show_all` parameter pattern that will be migrated to `show_hidden` for consistency. The implementation follows the established controller patterns with caching, pagination, and query optimization.

## Current Implementation Pattern Analysis

Based on the existing controllers, the current pattern uses:
- **Fights Controller**: `.where(active: params["show_all"] == "true" ? [true, false, nil] : true)`
- **Characters Controller**: `.where(active: params["show_all"] == "true" ? [true, false, nil] : true)`
- **Campaigns Controller**: `.where(active: params["show_all"] == "true" ? [true, false, nil] : true)`

This will be standardized to use the `show_hidden` parameter name across all controllers.

## Controller Implementation Updates

### Base Pattern for All Controllers

```ruby
# Standardized filtering in index actions
def index
  per_page = (params["per_page"] || 15).to_i
  page = (params["page"] || 1).to_i
  
  # Build base query with selects and includes
  query = build_base_query
  
  # Apply visibility filter (migrate from show_all to show_hidden)
  if params["show_hidden"] == "true"
    query = query.where(active: [true, false, nil])
  else
    query = query.where(active: true)
  end
  
  # Apply other filters...
  query = apply_additional_filters(query)
  
  # Cache handling with show_hidden in cache key
  cache_key = build_cache_key(params["show_hidden"])
  
  # Rest of index implementation...
end
```

### Characters Controller Update

```ruby
# app/controllers/api/v2/characters_controller.rb
# Line 34 - Update from show_all to show_hidden
.where(active: params["show_hidden"] == "true" ? [true, false, nil] : true)

# Update cache key (lines 56-73) - replace show_all with show_hidden
cache_key = [
  "characters/index",
  current_campaign.id,
  Character.cache_version_for(current_campaign.id),
  sort_order,
  page,
  per_page,
  params["site_id"],
  params["fight_id"],
  params["party_id"],
  params["search"],
  params["user_id"],
  params["faction_id"],
  params["character_type"],      # Note: was params["type"]
  params["archetype"],
  params["is_template"],
  params["show_hidden"],          # Replace show_all with show_hidden
  params["autocomplete"]
].join("/")
```

### Fights Controller Update

```ruby
# app/controllers/api/v2/fights_controller.rb
# Lines 35-39 - Replace show_all logic with show_hidden
if params["show_hidden"] == "true"
  query = query.where(active: [true, false, nil])
else
  query = query.where(active: true)
end

# Update cache key (lines 60-78) - add show_hidden
cache_key = [
  "fights/index",
  current_campaign.id,
  Fight.cache_version_for(current_campaign.id),
  sort_order,
  page,
  per_page,
  search_param,
  params["show_hidden"],         # Replace params["active"] with show_hidden
  params["character_id"],
  params["vehicle_id"],
  params["user_id"],
  params["unstarted"],
  params["unended"],
  params["ended"],
  params["season"],
  params["session"],
  params["autocomplete"],
].join("/")
```

### Campaigns Controller Update

```ruby
# app/controllers/api/v2/campaigns_controller.rb
# Lines 69-76 - Update parameter name
if params["show_hidden"] == "true"
  Rails.logger.info "   Showing all campaigns (active and inactive)"
  query = query.where(active: [true, false, nil])
else
  Rails.logger.info "   Filtering to active campaigns only"
  query = query.where(active: true)
end

# Update cache key (lines 83-94)
cache_key = [
  "campaigns/index",
  current_user.id,
  sort_order,
  page,
  per_page,
  params["search"],
  params["autocomplete"],
  params["character_id"],
  params["vehicle_id"],
  params["show_hidden"],         # Replace params["show_all"] with show_hidden
].join("/")
```

### New Controllers Pattern

For controllers that don't currently have visibility filtering (vehicles, weapons, sites, factions, parties):

```ruby
# Add to index action after base query setup
# Apply visibility filter
if params["show_hidden"] == "true"
  query = query.where(active: [true, false, nil])
else
  query = query.where(active: true)
end

# Include in cache key
cache_key = [
  "#{resource_name}/index",
  current_campaign.id,
  # ... other cache key components
  params["show_hidden"]
].join("/")
```

## Migration Strategy

### Phase 1: Support Both Parameters
During transition, controllers will support both `show_all` and `show_hidden`:

```ruby
# Temporary backward compatibility
show_hidden = params["show_hidden"] || params["show_all"]
if show_hidden == "true"
  query = query.where(active: [true, false, nil])
else
  query = query.where(active: true)
end
```

### Phase 2: Deprecate show_all
After frontend migration is complete, remove support for `show_all` parameter.

## Response Format

The response format remains unchanged. The filter only affects which records are included:

```json
{
  "characters": [...],
  "factions": [...],
  "archetypes": [...],
  "meta": {
    "current_page": 1,
    "next_page": null,
    "prev_page": null,
    "total_pages": 1,
    "total_count": 15
  }
}
```

## Cache Key Management for Filters

### Important: All Filter Parameters Must Be in Cache Keys

Every filter parameter that affects the query results MUST be included in the cache key to prevent serving incorrect cached data. When adding new filters in the future:

```ruby
# Example: Adding a new "status" filter to an entity
cache_key = [
  "#{resource_name}/index",
  current_campaign.id,
  ResourceClass.cache_version_for(current_campaign.id),
  sort_order,
  page,
  per_page,
  params["search"],
  params["show_hidden"],
  params["status"],              # NEW: Any new filter must be added
  params["new_filter_param"],    # NEW: Future filters go here
  params["autocomplete"]
].join("/")
```

### Cache Key Best Practices

1. **Order Matters**: Keep consistent ordering of cache key components across controllers
2. **Include All Filters**: Every parameter that affects the WHERE clause must be in the key
3. **Nil Values**: Include parameters even if nil - `params["show_hidden"]` not `params["show_hidden"] || false`
4. **Future Filters**: When implementing new checkbox filters, always add them to the cache key

## Cache Invalidation

When the `active` status of any entity changes, the cache version for that resource type must be updated:

```ruby
# In models that implement active field
after_save :touch_cache_version, if: :saved_change_to_active?
after_destroy :touch_cache_version

private

def touch_cache_version
  self.class.touch_cache_version_for(campaign_id)
end
```

## Testing Considerations

- Ensure backward compatibility during migration phase
- Test cache invalidation when active status changes
- Verify query performance with proper indexes on active column
- Test with nil values in active field for legacy data

## Controllers Requiring Updates

### Controllers with Existing show_all Parameter
1. **characters_controller.rb** - Line 34, cache key update needed
2. **fights_controller.rb** - Lines 35-39, cache key update needed
3. **campaigns_controller.rb** - Lines 69-76, cache key update needed

### Controllers Needing New Implementation
4. **vehicles_controller.rb** - Add visibility filter
5. **weapons_controller.rb** - Add visibility filter
6. **sites_controller.rb** - Add visibility filter
7. **factions_controller.rb** - Add visibility filter
8. **parties_controller.rb** - Add visibility filter
9. **schticks_controller.rb** - Add visibility filter
10. **junctures_controller.rb** - Add visibility filter if applicable