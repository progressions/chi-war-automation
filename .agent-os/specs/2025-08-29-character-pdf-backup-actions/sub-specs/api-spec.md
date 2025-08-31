# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-29-character-pdf-backup-actions/spec.md

## Endpoints

### POST /api/v2/characters/import_pdf

**Purpose:** Import character data from uploaded PDF file with enhanced backup Action Value parsing
**Parameters:** 
- `file`: Multipart file upload (PDF)
- `campaign_id`: UUID of the target campaign

**Response:** 
```json
{
  "id": "uuid",
  "name": "Character Name",
  "action_values": {
    "SecondaryAttack": "Martial Arts",
    "SecondaryAttackValue": 12,
    "Martial Arts": 12
  },
  "skills": {
    // Other skills without backup attack entries
  }
}
```

**Errors:** 
- `400 Bad Request`: Invalid PDF format or missing required parameters
- `422 Unprocessable Entity`: PDF parsing failed or invalid character data
- `500 Internal Server Error`: Server-side processing error

## Controllers

**CharactersController#import_pdf**
- Handles PDF file upload and processing
- Calls enhanced PDF service for character data extraction
- Returns JSON response with parsed character data including properly set backup Action Values
- Logs warnings for any parsing issues without failing the import process