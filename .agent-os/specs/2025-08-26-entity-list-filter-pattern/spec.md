# Spec Requirements Document

> Spec: Entity List Filter Pattern
> Created: 2025-08-26
> Status: Planning

## Overview

Implement a reusable filter pattern for entity list views that allows toggling visibility of hidden/inactive items through checkboxes. This pattern will standardize filtering across all entity types (characters, fights, campaigns, etc.) and provide an extensible architecture for adding additional filter properties.

## User Stories

### Gamemaster Filtering Hidden Entities

As a gamemaster, I want to toggle the visibility of hidden/inactive entities in my lists, so that I can focus on active items during gameplay but still access archived content when needed.

The gamemaster is running a campaign with 50+ characters accumulated over months of play. Many NPCs are no longer active (defeated enemies, retired allies). During a session, they need to quickly find active characters without clutter, but occasionally need to reference old characters for story continuity. They click "Show Hidden" in the filter panel to reveal all entities, find what they need, then uncheck it to return to the streamlined view. The URL updates to persist their filter choice if they share a link or refresh.

### Player Managing Character Roster

As a player with multiple characters, I want to filter my character list to show only active characters by default, so that retired or deceased characters don't clutter my interface during gameplay.

A player has created several characters over the campaign - some died heroically, others were retired. During combat, they need quick access to their current character without scrolling through historical ones. The filter system automatically hides inactive characters but allows toggling them back for nostalgia or character history reference.

## Spec Scope

1. **Backend Active Flag Standardization** - Migrate all entity models to use consistent "active" boolean field (default: true)
2. **Filter Component Architecture** - Create reusable React component system for checkbox-based filtering with URL state persistence
3. **Character List Implementation** - Implement filter pattern on Character index as proof of concept
4. **Entity List Rollout** - Apply standardized filter pattern to all entity list views
5. **API Query Parameter Support** - Update all index endpoints to handle show_hidden and future filter parameters

## Out of Scope

- Complex filter combinations with OR logic
- Saved filter presets
- Filter persistence in user preferences (only URL state)
- Bulk operations on filtered results
- Advanced search within filters

## Expected Deliverable

1. All entity lists display only active items by default, with a collapsible filter panel containing "Show Hidden" checkbox that reveals inactive items when checked
2. URL updates with query parameters (e.g., ?show_hidden=true) when filters change, allowing bookmarking and sharing of filtered views
3. Consistent backend "active" field across all models with proper migration of existing hidden/secret flags

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-26-entity-list-filter-pattern/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-26-entity-list-filter-pattern/sub-specs/technical-spec.md