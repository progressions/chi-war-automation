# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-28-entity-active-toggle/spec.md

## Frontend API Usage

**Note:** No backend changes required. The frontend will use existing PATCH endpoints that already support updating the active field.

## Existing Endpoints to Use

### PATCH /api/v2/characters/{id}

**Purpose:** Update character active status
**Parameters:** 
- Path: `id` (UUID) - Character ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated character object with new active status
**Errors:** 
- 401: Unauthorized (not logged in)
- 403: Forbidden (not admin or gamemaster)
- 404: Character not found
- 422: Invalid parameters

### PATCH /api/v2/campaigns/{id}

**Purpose:** Update campaign active status
**Parameters:**
- Path: `id` (UUID) - Campaign ID  
- Body: `{ active: boolean }` - New active status
**Response:** Updated campaign object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Campaign not found
- 422: Invalid parameters

### PATCH /api/v2/sites/{id}

**Purpose:** Update site active status
**Parameters:**
- Path: `id` (UUID) - Site ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated site object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Site not found
- 422: Invalid parameters

### PATCH /api/v2/parties/{id}

**Purpose:** Update party active status
**Parameters:**
- Path: `id` (UUID) - Party ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated party object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Party not found
- 422: Invalid parameters

### PATCH /api/v2/fights/{id}

**Purpose:** Update fight active status
**Parameters:**
- Path: `id` (UUID) - Fight ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated fight object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Fight not found
- 422: Invalid parameters

### PATCH /api/v2/vehicles/{id}

**Purpose:** Update vehicle active status
**Parameters:**
- Path: `id` (UUID) - Vehicle ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated vehicle object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Vehicle not found
- 422: Invalid parameters

### PATCH /api/v2/weapons/{id}

**Purpose:** Update weapon active status
**Parameters:**
- Path: `id` (UUID) - Weapon ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated weapon object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Weapon not found
- 422: Invalid parameters

### PATCH /api/v2/schticks/{id}

**Purpose:** Update schtick active status
**Parameters:**
- Path: `id` (UUID) - Schtick ID
- Body: `{ active: boolean }` - New active status
**Response:** Updated schtick object with new active status
**Errors:**
- 401: Unauthorized
- 403: Forbidden
- 404: Schtick not found
- 422: Invalid parameters

## Authorization Logic

All endpoints enforce the same authorization rules:

1. User must be authenticated (valid JWT token)
2. User must be either:
   - Admin (user.admin === true)
   - Gamemaster of the entity's campaign (campaign.gamemaster_id === user.id)
3. For entities without direct campaign association, check parent relationships
4. Return 403 Forbidden if authorization fails

## Response Format

All successful responses return the updated entity with the new active status included in the JSON response. The active field should be a boolean value at the root level of the entity object.