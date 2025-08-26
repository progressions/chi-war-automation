# Spec Requirements Document

> Spec: PC Character Template Redesign
> Created: 2025-08-26

## Overview

Redesign the PC (Player Character) creation screen at /characters/create to match the successful design patterns implemented in the GMC (Game Master Character) template selection interface, replacing the current dark carousel system with a clean, modern template selection interface that provides better usability and visual consistency across the character creation workflow.

## User Stories

### PC Creation Experience

As a player creating a new character, I want to view available character templates in a clean, organized layout, so that I can quickly compare different archetypes and make an informed decision about my character choice.

The user navigates to /characters/create and sees a clean, well-organized display of character template cards with styling similar to the GMC interface. Each card displays essential information including the character's archetype, key action values (attack, defense, toughness, speed, fortune), skills, special abilities (schticks), and starting weapons. The user can filter templates by archetype, search by name, or filter to show only templates with specific features like weapons or schticks. When they find a template they like, they click directly on the card to immediately create their character without any confirmation dialog, and are redirected to the character edit page with a success toast notification.

### Informed Template Selection

As a player evaluating character options, I want to see all critical character information including skills, schticks, and weapons on each template card, so that I can understand what makes each archetype unique and choose one that matches my playstyle.

Each template card shows comprehensive information in a compact, scannable format. Action values are displayed in a row of small boxes showing the character's combat stats. Skills are shown as compact chips indicating trained abilities. Schticks (special powers) are prominently displayed as colored chips since these define the character's unique abilities. Weapons are listed with their damage/concealment/reload stats. A brief excerpt of the character's background description provides flavor text. This matches the successful information hierarchy already proven in the GMC template selection interface.

### Efficient Template Navigation

As a player browsing 36+ character templates, I want search and filter capabilities, so that I can quickly find templates that interest me without having to navigate through a sequential carousel.

The interface provides a search bar to find templates by name, a dropdown to filter by archetype (Archer, Bandit, Big Bruiser, etc.), and checkboxes to filter for templates with weapons or schticks. The current result count is displayed (e.g., "Showing 12 of 36 templates"). All filtering happens instantly on the client side for responsive interaction. Users can clear all filters with a single button click to return to viewing all templates.

## Spec Scope

1. **PCTemplatePreviewCard Component** - New component displaying template information in a clean card format matching GMC styling
2. **Layout Redesign** - Replace carousel with a clean, responsive layout that allows viewing multiple templates (specific layout to be determined through design iteration)
3. **Search and Filter UI** - Add search bar, archetype dropdown, and feature checkboxes for efficient template discovery
4. **Direct Creation Flow** - Remove confirmation dialog and implement direct click-to-create with loading overlay
5. **Visual Consistency** - Apply white card design with proper spacing, borders, and typography matching GMC interface

## Out of Scope

- Backend API changes to template data structure
- Creating new character templates or modifying existing template data
- Changes to the character edit page after creation
- Modifications to NPC or GMC creation flows
- Authentication or permission changes

## Expected Deliverable

1. PC creation page at /characters/create displays templates in a clean, modern layout matching the GMC interface design patterns
2. Users can search, filter, and directly select templates to create characters without confirmation dialogs
3. All 36+ PC templates are accessible with comprehensive information displayed on preview cards including action values, skills, schticks, and weapons

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-26-pc-character-template-redesign/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-26-pc-character-template-redesign/sub-specs/technical-spec.md