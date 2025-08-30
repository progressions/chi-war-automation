# Spec Requirements Document

> Spec: Enhanced Entity Image Forms
> Created: 2025-08-29
> Status: Planning

## Overview

Enhance the existing PositionableImage component to work properly in entity creation forms, providing AI generation, upload options, and positioning capabilities during the creation process. This improvement will enable the full image handling experience that currently only works after entity creation.

## User Stories

### Unified Image Creation Experience

As a gamemaster creating a new character, site, or faction, I want to generate or upload and position images in one seamless interface, so that I can create visually compelling entities without switching between multiple screens.

When creating any entity with image support, the existing PositionableImage component will work fully, providing AI generation options specific to the entity type, file upload capabilities, and immediate positioning controls. Users can generate multiple options, upload their own images, and position them perfectly before completing the entity creation.

### Enhanced Visual Feedback During Creation

As a user, I want to see how my image will look positioned within the entity's display context while creating it, so that I can make adjustments before saving.

The creation form shows a preview of how the positioned image will appear in both list and detail views. Users can reposition images with real-time feedback and see the results immediately, eliminating the need to create an entity and then edit it just to adjust image positioning.

### Streamlined Entity Creation Workflow

As a player or gamemaster, I want AI-generated images to be available during entity creation (not just character generation), so that I can quickly create visual content for campaigns, sites, factions, and other entities.

All entity creation forms with image support now include AI generation options contextual to the entity type. Site creation offers architectural and landscape generation, faction creation provides group and symbol generation, and campaigns can generate cover art or thematic imagery.

## Spec Scope

1. **PositionableImage Creation Mode** - Enhance the PositionableImage component to work without requiring an existing entity ID
2. **Temporary Position State** - Implement position data storage during creation before entity persistence  
3. **Context-Aware AI Generation** - Add entity-type-specific AI generation prompts for non-character entities
4. **Form Integration** - Ensure PositionableImage works seamlessly within existing entity creation forms
5. **Creation Workflow** - Enable full image functionality during entity creation process

## Out of Scope

- Major redesign of existing entity creation form layouts
- Changes to image storage or processing infrastructure
- New image formats or size limits beyond current specifications
- Batch image operations or multi-image entity support

## Expected Deliverable

1. PositionableImage component works fully in entity creation forms with both AI generation and upload options available
2. Users can position images during creation and see real-time preview of final positioning  
3. All entity creation forms with existing PositionableImage integration function properly during creation process

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-29-enhanced-entity-image-forms/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-29-enhanced-entity-image-forms/sub-specs/technical-spec.md