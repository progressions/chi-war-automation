# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-11-24-pdf-generation/spec.md

> Created: 2025-11-24
> Status: Ready for Implementation

## Tasks

- [ ] 1. Setup ChromicPDF and Dependencies
  - [ ] 1.1 Add chromic_pdf dependency to mix.exs (~> 1.15)
  - [ ] 1.2 Configure ChromicPDF in application supervision tree
  - [ ] 1.3 Set up temporary file handling configuration
  - [ ] 1.4 Verify ChromicPDF installation with test render
  - [ ] 1.5 Configure PDF rendering options (page size, margins)

- [ ] 2. Create Character Sheet HTML Template
  - [ ] 2.1 Create template file at lib/shot_web/templates/pdf/character_sheet.html.heex
  - [ ] 2.2 Implement basic character info section (name, archetype, player)
  - [ ] 2.3 Implement core stats section (Body, Chi, Fortune, Mind, Reflexes)
  - [ ] 2.4 Implement derived stats section (Defense, Speed, Toughness, Wounds)
  - [ ] 2.5 Implement skills section with dynamic skill list
  - [ ] 2.6 Implement schticks section (name, description, pagename)
  - [ ] 2.7 Implement weapons section (name, damage, concealment, juncture)
  - [ ] 2.8 Add print-optimized CSS styling (assets/css/pdf_character_sheet.css)

- [ ] 3. Implement Character PDF Mapper Service
  - [ ] 3.1 Write tests for CharacterPdfMapper module
  - [ ] 3.2 Create Shot.Services.CharacterPdfMapper module
  - [ ] 3.3 Implement to_pdf_fields/1 function for character data export
  - [ ] 3.4 Implement field mappings for basic info fields
  - [ ] 3.5 Implement field mappings for stats and derived stats
  - [ ] 3.6 Implement field mappings for skills
  - [ ] 3.7 Implement field mappings for schticks (up to 10)
  - [ ] 3.8 Implement field mappings for weapons (up to 5)
  - [ ] 3.9 Verify all tests pass for PDF mapper

- [ ] 4. Implement PDF Export Endpoint
  - [ ] 4.1 Write controller tests for PDF export action
  - [ ] 4.2 Add pdf/0 action to CharacterController
  - [ ] 4.3 Implement authentication and authorization checks
  - [ ] 4.4 Implement PDF generation using ChromicPDF
  - [ ] 4.5 Set proper response headers (Content-Type, Content-Disposition)
  - [ ] 4.6 Add route: GET /api/v2/characters/:id/pdf
  - [ ] 4.7 Test PDF export with various character types
  - [ ] 4.8 Verify all tests pass for export endpoint

- [ ] 5. Implement PDF Import Functionality
  - [ ] 5.1 Write tests for PDF import logic
  - [ ] 5.2 Add import_pdf/2 action to CharacterController
  - [ ] 5.3 Implement file upload handling (multipart/form-data)
  - [ ] 5.4 Implement PDF form field extraction
  - [ ] 5.5 Implement from_pdf_fields/1 in CharacterPdfMapper
  - [ ] 5.6 Implement character creation from parsed PDF data
  - [ ] 5.7 Add validation and error handling for import
  - [ ] 5.8 Add route: POST /api/v2/characters/import_pdf
  - [ ] 5.9 Test import with various PDF scenarios
  - [ ] 5.10 Verify all tests pass for import endpoint
