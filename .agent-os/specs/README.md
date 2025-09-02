# Chi War Specifications Directory

This directory contains organized technical specifications for the Chi War RPG management platform.

## Directory Structure

```
.agent-os/specs/
├── README.md                           # This file - specification index
├── YYYY-MM-DD-feature-name/            # Dated spec directories
│   ├── spec.md                         # Main specification document
│   ├── spec-lite.md                    # Quick reference version
│   ├── tasks.md                        # Implementation task breakdown
│   └── sub-specs/                      # Technical specifications
│       ├── api-spec.md                 # API endpoints and contracts
│       ├── technical-spec.md           # Technical implementation details
│       ├── database-schema.md          # Database changes (if needed)
│       └── tests.md                    # Testing specifications
```

## Active Specifications

### UI/UX Features
- **2025-09-02-character-edit-dialog** - Quick character stat editing in encounters
- **2025-08-27-image-viewer-popup** - Image popup viewer for character portraits
- **2025-08-29-enhanced-entity-image-forms** - Enhanced image upload forms
- **2025-08-25-dismissable-onboarding-modules** - User onboarding system improvements

### Administrative Features
- **2025-08-26-admin-template-filter** - Admin-only template filtering for characters
- **2025-08-26-entity-list-filter-pattern** - Reusable entity filtering patterns
- **2025-08-30-master-template-export-command** - Export system for character templates

### Character Management
- **2025-08-25-npc-template-creation** - NPC template creation system
- **2025-08-26-pc-character-template-redesign** - Player character template redesign
- **2025-09-01-character-effects** - Character effects and status tracking
- **2025-08-29-character-pdf-backup-actions** - PDF backup functionality

### Combat and Encounters
- **2025-08-31-encounter-manager-completion** - Complete encounter management system
- **2025-09-01-vehicle-chase-system** - Vehicle chase mechanics

### Campaign Management
- **2025-08-30-campaign-pool-system** - Campaign pooling and sharing system
- **2025-01-28-campaign-deletion-fix** - Campaign deletion bug fixes

### Authentication and Security
- **2025-08-25-auth-conflict-resolution** - Authentication conflict handling

### System Improvements
- **2025-01-28-marketing-page-audit** - Marketing page improvements

## Legacy Specifications (Unorganized)

The following specifications exist in `/specs/` and need to be migrated to the organized structure:

### Authentication & User Management
- `user-profile-page-spec.md`
- `user-registration-process-spec.md`
- `password-reset-frontend-implementation-spec.md`
- `email-change-protection-spec.md`
- `admin-aware-users-profile-page-spec.md`

### Campaign Features
- `campaign-invitation-system-integration.md`
- `invitation-redemption-system-spec.md`
- `current-campaign-clearing-spec.md`
- `campaign-template-seeding-atomic-implementation.md`

### Character Management
- `character-owner-reassignment.md`
- `pc-character-creation-redesign-spec.md`

### UI/UX Improvements
- `loading-states-improvement-spec.md`
- `view-switcher-data-refresh-fix-spec.md`
- `entity-show-pages-editing-audit-spec.md`
- `entity-show-pages-audit-report.md`
- `enhance-footer-and-content-pages-spec.md`
- `marketing-landing-page-spec.md`

### Combat System
- `party-to-fight-implementation-spec.md`
- `party-to-fight-frontend-spec.md`
- `party-to-fight-backend-spec.md`
- `party-to-fight-acceptance-test-plan.md`

### Testing & Development
- `test-reliability-improvements.md`
- `localStorage-cache-security-testing.md`
- `implement-12-priority-tests-spec.md`
- `jest-unit-testing-implementation.md`
- `migrate-legacy-service-tests-to-jest.md`
- `testing-gap-investigation-spec.md`
- `rspec-test-suite-fix-spec.md`

### Technical Debt
- `typescript-types-consolidation-spec.md`
- `progressive-onboarding-system.md`
- `new-user-onboarding-guidance.md`

### Data Management
- `region-world-generation-sql-export-spec.md`

### Bug Fixes
- `2025-01-27-positionable-image-upload-bug-fix.md`

## Specification Standards

Each organized specification follows this structure:

### Main Files
- **spec.md**: Complete specification with user stories, scope, and acceptance criteria
- **spec-lite.md**: Quick reference summary for developers
- **tasks.md**: Detailed task breakdown with checkboxes for progress tracking

### Sub-specifications
- **technical-spec.md**: Technical implementation details, dependencies, approaches
- **api-spec.md**: API endpoints, request/response formats, validation rules
- **database-schema.md**: Database changes, migrations, indexing requirements
- **tests.md**: Testing strategies, E2E scenarios, validation approaches

## Migration Guidelines

When organizing legacy specifications:

1. **Create dated directory**: `YYYY-MM-DD-feature-name/`
2. **Extract user stories**: Focus on user value and business requirements
3. **Separate technical details**: Move implementation details to sub-specs
4. **Create task breakdown**: Convert spec into actionable implementation tasks
5. **Add acceptance criteria**: Clear checkboxes for completion validation
6. **Update cross-references**: Ensure links between related specs work

## Status Tracking

Specifications can have these statuses in their tasks.md files:
- **Ready for Implementation**: All planning complete, ready for development
- **In Progress**: Development work has started
- **Complete**: All tasks finished and accepted
- **On Hold**: Temporarily paused for external dependencies
- **Archived**: No longer relevant or superseded

## Cross-References

Related specifications should reference each other using relative paths:
```markdown
See also: @.agent-os/specs/2025-08-26-admin-template-filter/spec.md
```

This maintains linkages when specifications are moved or reorganized.