# Spec Requirements Document

> Spec: PDF Generation for Elixir Backend
> Created: 2025-11-24
> Status: Planning

## Overview

Implement PDF generation functionality in the Elixir/Phoenix backend to match the existing Rails behavior, allowing users to export character sheets as fillable PDFs and import character data from PDF forms. This feature enables offline character management and integration with existing Feng Shui 2 character sheet PDFs.

## User Stories

### Character Sheet Export

As a gamemaster or player, I want to export my character to a fillable PDF, so that I can print physical character sheets or share them with other players who prefer offline formats.

The user navigates to a character page and clicks an "Export PDF" button. The system generates a PDF with all character data (stats, schticks, weapons, skills) filled into the appropriate form fields. The PDF is downloaded to the user's device and can be opened in any PDF reader, with editable form fields preserved for manual updates.

### Character Import from PDF

As a gamemaster, I want to import character data from a filled PDF character sheet, so that I can quickly add characters that were created offline or shared by other gamemasters.

The user navigates to the characters list and selects "Import from PDF". They upload a filled character sheet PDF, and the system extracts all field data to create a new character record with matching stats, schticks, and weapons. The character appears in the campaign with all data properly structured.

## Spec Scope

1. **PDF Export Endpoint** - Create API endpoint to generate and download character sheet PDF with filled form fields
2. **PDF Import Endpoint** - Create API endpoint to accept PDF upload and extract character data
3. **ChromicPDF Integration** - Install and configure ChromicPDF library for HTML-to-PDF rendering
4. **Character Sheet Template** - Create HTML/CSS template matching the existing PDF form layout
5. **Field Mapping Service** - Implement Elixir module to map between character data and PDF form fields

## Out of Scope

- PDF generation for other entity types (vehicles, factions, sites)
- Custom PDF template creation by users
- PDF editing within the application
- Batch PDF export for multiple characters
- PDF encryption or password protection

## Expected Deliverable

1. Users can click "Export PDF" on a character page and receive a properly formatted character sheet PDF with all data fields filled
2. Users can upload a filled character sheet PDF and see the imported character appear in their campaign with accurate data
3. The PDF template matches the visual layout and field structure of the existing Rails PDF implementation

## Spec Documentation

- Tasks: @.agent-os/specs/2025-11-24-pdf-generation/tasks.md
- Technical Specification: @.agent-os/specs/2025-11-24-pdf-generation/sub-specs/technical-spec.md
