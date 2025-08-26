# Spec Requirements Document

> Spec: NPC Template Creation System
> Created: 2025-08-25
> Status: Planning

## Overview

Implement a streamlined NPC creation system that allows gamemasters to quickly generate non-player characters from predefined templates based on character type (Ally, Mook, Featured Foe, Boss, Uber-Boss). Templates exist within each campaign (copied from Master Campaign during campaign creation) and can be filtered by type. This feature will significantly reduce character creation time during game sessions by providing instant access to type-specific character templates with appropriate stats and abilities through a new SpeedDial option in the character list.

## User Stories

### Quick NPC Generation

As a gamemaster running a Feng Shui 2 campaign, I want to quickly create NPCs from templates based on their type, so that I can generate appropriate opponents and allies during gameplay without disrupting the game flow.

When I navigate to the character creation page, I should see options to create characters from NPC templates. I select the character type I need (e.g., "Featured Foe"), and the system presents me with available Featured Foe templates showing a simplified preview of each template including the character name, type, and key Action Values (Martial Arts, Guns, Sorcery, Defense, Toughness, Speed, etc.). This preview allows me to quickly assess which template best fits my needs before selection. I can then select a template and instantly create a new character based on it, optionally customizing the name and other details before saving. This allows me to populate encounters rapidly during sessions without needing to manually configure stats for each NPC.

### Template Management by Type

As a gamemaster, I want to view and manage NPC templates organized by character type within my current campaign, so that I can maintain a library of reusable templates for different encounter scenarios.

The template system should allow me to filter templates by character type from my current campaign's templates, showing only PC templates when creating player characters, and only NPC templates of specific types (Mook, Featured Foe, etc.) when creating those character types. Templates are duplicated to create new characters that can be fully customized. This ensures I'm always selecting from appropriate templates for the character I'm creating and can use the comprehensive library of templates available in my campaign.

## Spec Scope

1. **Template Type Filtering** - Use existing character API with is_template and character_type query parameters
2. **SpeedDial Integration** - Add new "Create from Template" option to existing SpeedDial menu on characters list page
3. **NPC Template Selection Page** - Create new page for selecting NPC type and browsing available templates from current campaign
4. **Template Preview Cards** - Display simplified template previews showing Type and Action Values for quick assessment
5. **Quick Creation Flow** - Implement character creation from selected template with full customization capabilities
6. **Template Library View** - Add organized view of all templates grouped by character type for easy management

## Out of Scope

- Automatic AI generation of new NPC templates
- Bulk creation of multiple NPCs at once
- Template sharing between campaigns
- Custom character type definitions beyond the existing types
- Statistical balancing or validation of template stats

## Expected Deliverable

1. New "Create from Template" option in the SpeedDial menu on characters list page
2. Dedicated template selection page showing NPC templates from current campaign organized by type
3. Template preview cards displaying character name, type, and Action Values for informed selection
4. Gamemasters can select a template to create a fully customizable new character
5. Existing API endpoints support filtering templates by is_template and character_type parameters
6. Existing character creation flows (PC, Import, AI Generate) remain unchanged

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-25-npc-template-creation/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-25-npc-template-creation/sub-specs/technical-spec.md