# NPC Template Creation - Lite Summary

Implement a streamlined NPC creation system that allows gamemasters to quickly generate non-player characters from predefined templates in their current campaign based on character type (Ally, Mook, Featured Foe, Boss, Uber-Boss), reducing character creation time during sessions. The system adds a "Create from Template" option to the SpeedDial menu, leading to a dedicated template selection page where templates are used to create fully customizable characters.

## Key Points
- Templates exist in current campaign (copied from Master Campaign during campaign creation)
- New SpeedDial option "Create from Template" on characters list
- Dedicated template selection page organized by NPC type
- No backend changes required - uses existing API with is_template and character_type parameters