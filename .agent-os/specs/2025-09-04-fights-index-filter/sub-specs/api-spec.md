# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-09-04-fights-index-filter/spec.md

## Endpoints

### GET /api/v2/fights

**Purpose:** Retrieve a list of fights with status filtering support

**Current Behavior:** 
The endpoint already supports status filtering through the `status` parameter. No API changes are required for this spec.

**Parameters:**
- `status` (optional, string): Filter fights by status
  - `"Started"`: Returns fights where started_at IS NOT NULL and ended_at IS NULL
  - `"Unstarted"`: Returns fights where started_at IS NULL
  - `"Ended"`: Returns fights where ended_at IS NOT NULL
  - `"All"` or omitted: Returns all fights without status filtering

**Note:** The API already properly handles these status values. This spec only changes the frontend default behavior.

## Frontend Integration

The frontend will send the appropriate status parameter based on the filter selection:
- Default request (no URL params): `/api/v2/fights?status=Unstarted`
- User selection preserved: `/api/v2/fights?status=Started`
- Explicit "All" selection: `/api/v2/fights?status=All`

## No Backend Changes Required

The existing API v2 fights endpoint already supports the necessary filtering. This spec focuses on:
1. Adding defaultValue support to GenericFilter component
2. Setting "Unstarted" as the default for the Status filter
3. Maintaining URL parameter override behavior

The API will continue to work as it currently does, receiving the status parameter from the frontend's filter selection.