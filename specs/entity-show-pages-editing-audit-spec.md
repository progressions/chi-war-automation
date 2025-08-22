# Entity Show Pages Editing Completeness Audit Specification

**Date**: 2025-08-22  
**Status**: In Progress  
**Priority**: Medium  

## Objective

Conduct a comprehensive audit of all 11 entity Show pages to identify gaps in inline editing functionality and ensure consistent, complete editing experiences for users.

## Scope

### Entities to Audit (11 Total)

1. **Campaigns** - `shot-client-next/src/components/campaigns/Show.tsx`
2. **Characters** - `shot-client-next/src/components/characters/Show.tsx`  
3. **Fights** - `shot-client-next/src/components/fights/Show.tsx`
4. **Vehicles** - `shot-client-next/src/components/vehicles/Show.tsx`
5. **Schticks** - `shot-client-next/src/components/schticks/Show.tsx`
6. **Weapons** - `shot-client-next/src/components/weapons/Show.tsx`
7. **Sites** - `shot-client-next/src/components/sites/Show.tsx`
8. **Parties** - `shot-client-next/src/components/parties/Show.tsx`
9. **Factions** - `shot-client-next/src/components/factions/Show.tsx`
10. **Junctures** - `shot-client-next/src/components/junctures/Show.tsx`
11. **Users** - `shot-client-next/src/components/users/Show.tsx`

## Audit Methodology

### Phase 1: Backend Model Analysis

For each entity, identify all editable fields from the Rails models and controllers:

1. Examine model files in `shot-server/app/models/`
2. Check permitted parameters in controllers at `shot-server/app/controllers/api/v2/`
3. Review serializers in `shot-server/app/serializers/`
4. Document all fields that can be updated via API

### Phase 2: Frontend Component Analysis

For each Show.tsx component:

1. Identify all displayed fields
2. Determine which fields have inline editing capability
3. Document the editing component used (e.g., NameEditor, EditableRichText)
4. Note fields that require navigation to separate forms
5. Identify missing editing functionality

### Phase 3: Consistency Assessment

Compare editing patterns across all entities:

1. Identify common field types (name, description, numeric stats, relationships)
2. Document different editing approaches for similar fields
3. Note inconsistencies in UI patterns
4. Highlight best practices and problematic patterns

## Detailed Audit Plan

### Step 1: Create Audit Matrix

Create a comprehensive matrix documenting:
- Entity name
- Field name
- Field type (string, text, number, relationship, etc.)
- Currently editable inline? (Yes/No)
- Editing component used
- Should be editable? (Yes/No)
- Priority (Critical/High/Medium/Low)
- Notes/Issues

### Step 2: Entity-by-Entity Analysis

For each entity, perform:

1. **Backend Analysis**
   - List all model attributes
   - Identify permitted parameters
   - Note validation rules
   - Document relationships

2. **Frontend Analysis**
   - List all displayed fields
   - Test inline editing capability
   - Document editing UX
   - Note missing functionality

3. **Gap Identification**
   - Fields that should be editable but aren't
   - Inconsistent editing patterns
   - Poor UX for editing
   - Missing validation feedback

### Step 3: Cross-Entity Patterns

Document patterns across entities:

1. **Standard Components**
   - NameEditor usage
   - EditableRichText usage
   - HeroImage implementation
   - Custom editors

2. **Consistency Issues**
   - Different approaches for same field type
   - Missing standard components
   - Inconsistent validation
   - Varied error handling

3. **Best Practices**
   - Well-implemented editing patterns
   - Good UX examples
   - Reusable components

## Implementation Tasks

### Audit Tasks (Phase 1)

1. [ ] Analyze Campaign model and Show page
2. [ ] Analyze Character model and Show page
3. [ ] Analyze Fight model and Show page
4. [ ] Analyze Vehicle model and Show page
5. [ ] Analyze Schtick model and Show page
6. [ ] Analyze Weapon model and Show page
7. [ ] Analyze Site model and Show page
8. [ ] Analyze Party model and Show page
9. [ ] Analyze Faction model and Show page
10. [ ] Analyze Juncture model and Show page
11. [ ] Analyze User model and Show page

### Documentation Tasks (Phase 2)

12. [ ] Create comprehensive audit matrix
13. [ ] Document consistency issues
14. [ ] Identify critical gaps
15. [ ] Prioritize improvements
16. [ ] Create implementation recommendations

### Implementation Planning (Phase 3)

17. [ ] Group similar improvements
18. [ ] Estimate implementation effort
19. [ ] Create phased implementation plan
20. [ ] Define success metrics

## Expected Fields by Entity

### Campaign
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- settings (json) - May need custom editor
- gamemaster_id (reference) - Likely read-only

### Character
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- character_type (enum) - Should have dropdown/select
- archetype (string) - Should have inline text editor
- juncture_id (reference) - Should have dropdown/select
- action_values (json) - Should have numeric editors
- skills (json) - Should have skill editors
- wealth_level (integer) - Should have numeric editor
- armor_rating (integer) - Should have numeric editor

### Fight
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- shot_counter (integer) - Should have numeric editor
- sequence_number (integer) - Likely read-only
- active (boolean) - Should have toggle/button

### Vehicle
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- vehicle_type (string) - Should have dropdown/select
- action_values (json) - Should have numeric editors
- passenger_capacity (integer) - Should have numeric editor
- armor_rating (integer) - Should have numeric editor

### Weapon
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- damage (integer) - Should have numeric editor
- concealment (integer) - Should have numeric editor
- juncture_id (reference) - Should have dropdown/select
- category (string) - Should have dropdown/select

### Schtick
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- category (string) - Should have dropdown/select
- path (string) - Should have dropdown/select
- prerequisites (text) - Should have text editor

### Site
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- location (string) - Should have text editor

### Party
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage

### Faction
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage

### Juncture
- name (string) - Should have NameEditor
- description (text) - Should have EditableRichText
- image_url (string) - Should have HeroImage
- time_period (string) - Should have text editor

### User
- first_name (string) - Should have inline text editor
- last_name (string) - Should have inline text editor
- email (string) - Should have email editor with confirmation
- avatar_url (string) - Should have image uploader

## Success Criteria

### Audit Completion
- [ ] All 11 entities thoroughly analyzed
- [ ] Complete field matrix created
- [ ] All gaps documented
- [ ] Priorities assigned

### Documentation Quality
- [ ] Clear, actionable recommendations
- [ ] Implementation effort estimates
- [ ] Phased approach defined
- [ ] Success metrics established

### Implementation Readiness
- [ ] Critical gaps have clear fix paths
- [ ] Reusable components identified
- [ ] Consistency standards defined
- [ ] Testing approach documented

## Deliverables

1. **Audit Matrix** - Comprehensive spreadsheet of all fields and editing status
2. **Gap Analysis Report** - Prioritized list of missing functionality
3. **Consistency Report** - Cross-entity pattern analysis
4. **Implementation Plan** - Phased approach to address gaps
5. **Component Standards** - Guidelines for editing components

## Notes

- Focus on user-facing fields that users would expect to edit
- System fields (IDs, timestamps) can remain read-only
- Consider performance implications of inline editing
- Maintain existing working patterns where they're effective
- Prioritize high-impact improvements that affect common workflows