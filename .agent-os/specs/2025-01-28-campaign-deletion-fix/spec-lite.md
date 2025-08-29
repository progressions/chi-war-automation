# Spec Summary (Lite)

**Comprehensive Entity Deletion System**

Implement a universal deletion system for all entities (Campaigns, Characters, Vehicles, Fights, Weapons, Schticks, Sites, Parties, Factions, Junctures, Users) that properly handles associations and constraints. Replace inconsistent deletion behavior and 400 Bad Request errors with clear user feedback, consistent error responses, and appropriate deletion policies.

**Key Features:**
- Universal deletion service framework for consistent behavior across all entity types
- Standardized constraint checking and error responses
- Force deletion option with full impact disclosure
- Enhanced user interface with clear constraint messaging
- Comprehensive entity association audit and mapping

**Scope:** All DELETE `/api/v2/{entity}/:id` endpoints, frontend deletion interfaces, and associated constraint handling for the complete entity ecosystem.