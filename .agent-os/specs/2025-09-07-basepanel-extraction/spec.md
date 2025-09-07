# Spec Requirements Document

> Spec: BasePanel Component Extraction
> Created: 2025-09-07

## Overview

Extract the common Paper box structure with rounded edges and colored border from CheeseItPanel and SpeedCheckPanel into a reusable BasePanel component for encounter panels.

## User Stories

### Developer Experience

As a developer, I want to use a BasePanel component that provides the common Paper structure, so that I can focus on panel-specific logic without duplicating layout code.

When building a new encounter panel, I can extend BasePanel and automatically get the consistent Paper box with border styling, reducing the amount of boilerplate code I need to write.

### Consistent UI

As a gamemaster, I want all encounter panels to have consistent appearance and behavior, so that the interface feels cohesive during gameplay sessions.

The consistent visual structure across all panels makes it easier to understand and use different encounter actions during the game.

## Spec Scope

1. **BasePanel Component** - Core Paper component with consistent border styling and layout
2. **CheeseItPanel Migration** - Refactor to use BasePanel structure
3. **SpeedCheckPanel Migration** - Refactor to use BasePanel structure

## Out of Scope

- Migration of other encounter panels (AttackPanel, BoostPanel, HealPanel, ChasePanel, UpCheckPanel)
- Customizable border colors per panel
- Collapsible/expandable functionality
- Drag-to-reorder capability
- Panel size variants
- Dark/light mode specific styling
- Non-encounter panel configurations

## Expected Deliverable

1. BasePanel component with Paper box structure and consistent styling
2. CheeseItPanel successfully migrated to use BasePanel
3. SpeedCheckPanel successfully migrated to use BasePanel