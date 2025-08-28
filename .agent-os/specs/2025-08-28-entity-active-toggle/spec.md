# Spec Requirements Document

> Spec: Entity Active Toggle
> Created: 2025-08-28

## Overview

Implement an active/inactive toggle on entity Show pages that allows Admin and Gamemaster users to soft-delete or restore entities directly from the UI. This feature will provide better control over entity management without requiring database access or API calls.

## User Stories

### Admin Entity Management

As an Admin, I want to toggle any entity's active status from its Show page, so that I can manage data quality and handle problematic content across all campaigns.

When viewing any entity's Show page, I see a checkbox or toggle switch labeled "Active" that reflects the current active state. When I toggle this control, the entity's active status is immediately updated and the UI provides feedback confirming the change. This works for all entities regardless of campaign ownership.

### Gamemaster Campaign Control

As a Gamemaster, I want to toggle the active status of entities within my campaigns, so that I can manage my campaign's content without permanently deleting data.

When viewing an entity that belongs to one of my campaigns, I see the active toggle control. When I deactivate an entity, it becomes hidden from players but remains accessible to me for potential restoration. This allows me to curate the campaign experience without losing historical data.

## Spec Scope

1. **Permission-based visibility** - Show active toggle only to Admin users and Gamemasters of the current campaign
2. **Entity coverage** - Implement toggle on all entity Show pages (Characters, Campaigns, Sites, Parties, Fights, Vehicles, Weapons, Schticks)
3. **Real-time updates** - Update active status via handleChangeAndSave with optimistic updates and automatic rollback on error
4. **Visual feedback** - Switch component with "Active" label, toast notifications, no confirmation dialog
5. **Consistent implementation** - Create reusable component for use across all entity types

## Out of Scope

- Bulk active/inactive operations on list pages
- Cascading deactivation of related entities
- Activity logs or audit trails for status changes
- Scheduled or automated reactivation
- Different permission levels for viewing vs toggling

## Expected Deliverable

1. Active toggle appears on all entity Show pages for authorized users (Admin or Gamemaster)
2. Toggle successfully updates entity active status via existing API endpoints and shows appropriate feedback
3. Unauthorized users cannot see or interact with the active toggle control