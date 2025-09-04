# Spec Requirements Document

> Spec: Fights Index Filter Default
> Created: 2025-09-04

## Overview

Change the default value of the existing Status filter on the fights index from "All" to "Unstarted", ensuring users see only unstarted fights by default. This improves the user experience by focusing on upcoming fights that need attention while preserving full filtering capabilities.

## User Stories

### Active Fights Focus

As a gamemaster, I want to see only unstarted fights by default when I visit the fights index, so that I can quickly identify and prepare upcoming combat encounters without being distracted by started or ended fights.

When viewing the fights index page, the Status filter is automatically set to "Unstarted" instead of "All". The existing filter dropdown continues to work with options for "Started", "Unstarted", "Ended", and "All". The filter state is reflected in both the UI dropdown and URL parameters, maintaining consistency with the current GenericFilter behavior.

### Flexible Fight Viewing

As a gamemaster, I want to easily switch between different fight statuses using the existing filter dropdown, so that I can view started, ended, or all fights when needed for different workflow tasks.

The Status filter dropdown remains fully functional with all existing options. When I change the filter selection, the URL updates to reflect my choice. If I bookmark or share a URL with a specific status filter, that filter is applied when the page loads.

## Spec Scope

1. **Default Value Configuration** - Update GenericFilter component to accept defaultValue in filterConfigs
2. **Fights Filter Config** - Set "Unstarted" as default value for Status filter in fights index
3. **URL Parameter Handling** - Ensure default value applies only when no URL parameter is present
4. **Filter State Management** - Maintain existing dropdown and URL sync behavior
5. **API Integration** - Ensure API v2 properly filters based on the status parameter

## Out of Scope

- Modifying API v1 endpoints (maintain backwards compatibility)
- Changing the available filter options (Started, Unstarted, Ended, All remain unchanged)
- Modifying filter behavior in other contexts (campaign overview, character pages)
- Adding new fight status values
- Changing the visual design of the filter dropdown

## Expected Deliverable

1. Fights index page loads with Status filter set to "Unstarted" by default
2. GenericFilter component supports defaultValue configuration option
3. URL parameters continue to override default values when present