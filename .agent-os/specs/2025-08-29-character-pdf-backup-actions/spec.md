# Spec Requirements Document

> Spec: Character PDF Import Backup Actions Enhancement
> Created: 2025-08-29

## Overview

Enhance the character PDF import process to properly parse backup Action Values from the Skills section and correctly populate the character's SecondaryAttack and SecondaryAttackValue fields. This improvement will ensure accurate character data import from PDFs that include backup attack information in the Skills section.

## User Stories

### PDF Import Enhancement

As a gamemaster, I want the PDF character import to automatically detect and properly set backup Action Values, so that I don't have to manually edit imported characters to fix their secondary attack capabilities.

When importing a character PDF that contains skills like "Backup Attack: Martial Arts: 12", the system should automatically recognize this as a backup Action Value and set the character's SecondaryAttack field to "Martial Arts" and the SecondaryAttackValue to 12, rather than treating it as a regular skill entry.

## Spec Scope

1. **PDF Parsing Enhancement** - Improve the existing PDF import regex pattern to handle backup Action Value entries in the Skills section
2. **Secondary Attack Field Population** - Correctly populate both SecondaryAttack type and SecondaryAttackValue from parsed backup attack data  
3. **Character Service Integration** - Utilize existing character service helper functions for setting action values
4. **Validation Logic** - Ensure parsed backup Action Values are valid skill types and numeric values
5. **Error Handling** - Gracefully handle malformed backup attack entries without failing the entire import

## Out of Scope

- Manual character editing interface improvements
- Backup defense or other non-attack backup Action Values
- PDF export functionality enhancements
- Character creation workflows outside of PDF import

## Expected Deliverable

1. PDF import correctly parses "Backup Attack: [Skill]: [Value]" format from Skills section and populates character action_values appropriately
2. Imported characters with backup attacks display properly in the character interface without manual correction needed
3. PDF import process maintains backward compatibility with existing character data and import formats