# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-26-admin-template-filter/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Endpoints

### GET /api/v2/characters

**Purpose:** List characters with optional template filtering for admin users

**Parameters:**
- `template_filter` (string, optional): Controls template visibility
  - `"all"`: Show all characters regardless of template status
  - `"templates"`: Show only template characters (is_template: true)
  - `"non-templates"`: Show only non-template characters (is_template: false or nil)
  - Default: `"non-templates"` for all users
  - Note: Non-admin users always get `"non-templates"` regardless of parameter value

**Response:** Standard paginated character list response

**Errors:**
- 400 Bad Request: Invalid template_filter value provided
- 401 Unauthorized: No valid authentication token
- 403 Forbidden: Non-admin user attempts to view templates (if directly accessing template IDs)

## Controllers

### CharactersController#index

**Business Logic:**
1. Check if current_user is admin (admin: true)
2. If admin, apply template_filter parameter:
   - Parse template_filter from params
   - Validate against allowed values
   - Apply appropriate where clause
3. If non-admin, force template_filter to "non-templates"
4. Continue with existing filters (hidden, campaign, etc.)

**Security Considerations:**
- Non-admin users must never see templates even if URL is manipulated
- Log attempts by non-admin users to access templates for security monitoring
- Ensure template filter is applied before any other query scopes

**Error Handling:**
- Invalid template_filter values default to "non-templates"
- Missing parameter defaults to "non-templates"
- Non-admin users silently receive non-templates regardless of parameter