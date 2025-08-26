# Spec Requirements Document

> Spec: Admin Template Filter
> Created: 2025-08-26

## Overview

Implement an admin-only template filter dropdown for the character list view that allows administrators to filter characters by template status (Templates, Non-Templates, All). This feature enhances admin workflows by providing granular control over template visibility while maintaining security by hiding templates from non-admin users by default.

## User Stories

### Admin Template Management

As an admin user, I want to filter the character list by template status, so that I can efficiently manage and organize character templates separately from regular characters.

When I navigate to the characters list page as an admin, I see a new "Template Filter" dropdown in the EntityFilters accordion. The dropdown has three options: "All", "Templates Only", and "Non-Templates Only". By default, it shows "Non-Templates Only" to match the standard user experience. When I select "Templates Only", the list updates to show only characters where is_template is true, and the URL updates to include the template_filter parameter. This filter persists when I navigate away and return to the page.

### Non-Admin User Experience

As a regular user (non-admin), I want to only see non-template characters, so that I'm not confused by template entities that aren't relevant to my gameplay.

When I navigate to the characters list page as a non-admin user, I don't see any template filter option in the EntityFilters accordion. The system automatically filters out all template characters (is_template: true) from my view. I cannot access template characters even if I manually modify the URL parameters.

## Spec Scope

1. **Admin-Only Template Filter Dropdown** - Add a dropdown filter visible only to admin users with three options for template filtering
2. **Backend API Enhancement** - Extend the characters API to support the new template_filter parameter format
3. **URL Parameter Synchronization** - Ensure the template filter state persists in the URL and is properly parsed on page load
4. **Security Enforcement** - Prevent non-admin users from viewing templates regardless of URL manipulation
5. **UI Integration** - Seamlessly integrate the new filter into the existing EntityFilters accordion component

## Out of Scope

- Modifying the template creation or editing functionality
- Changing template permissions for gamemaster users
- Adding template filters to other entity types (vehicles, sites, etc.)
- Bulk template operations or management features
- Template categorization or tagging systems

## Expected Deliverable

1. Admin users can filter characters by template status using a dropdown in the EntityFilters accordion
2. The template filter state persists in the URL and survives page refreshes
3. Non-admin users never see template characters and cannot access the template filter