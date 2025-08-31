# Spec Requirements Document

> Spec: Master Template Export Command
> Created: 2025-08-30
> Status: Planning

## Overview

Create a Rails command to export the master campaign template and all its associated data into a SQL file that can be safely imported into production without affecting existing data. This feature supports the campaign onboarding system by enabling deployment of pre-built campaign templates to production environments.

## User Stories

### Export Master Template Data

As a developer, I want to export the complete master campaign template with all its associations, so that I can deploy pre-built campaign content to production environments.

The workflow involves running a Rails command locally that identifies the master template campaign (where `is_master_template: true`), traverses all its associations including characters, vehicles, factions, junctures, schticks, weapons, and join tables, then generates a SQL file with INSERT statements that use UUIDs to avoid conflicts with existing production data.

### Import Template to Production

As a system administrator, I want to import the generated SQL file into production, so that new users can access pre-built campaign templates during onboarding.

The import process should be idempotent, using INSERT statements with ON CONFLICT clauses to prevent duplicate entries if the import is run multiple times. All foreign key relationships should be preserved through consistent UUID usage.

## Spec Scope

1. **Rails Command Implementation** - Create a rake task that exports the master template campaign and all associations
2. **Association Traversal** - Include characters, vehicles, factions, junctures, schticks, weapons, and all join tables
3. **Image URL Preservation** - Export image URLs and any ImageKit metadata for associated entities
4. **SQL Generation** - Generate conflict-safe INSERT statements with explicit UUIDs
5. **Join Table Export** - Include carries, memberships, character_schticks and other many-to-many relationships

## Out of Scope

- Exporting user data or authentication information
- Exporting fight or shot data (runtime/session data)
- Automatic production deployment (manual import only)
- Versioning or migration of existing templates
- Export of non-template campaigns

## Expected Deliverable

1. A Rails rake task `rails template:export` that generates a SQL file in the `db/exports/` directory
2. The SQL file can be imported via `psql` without errors and creates all template data
3. Running the import multiple times is safe and doesn't create duplicates

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-30-master-template-export-command/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-30-master-template-export-command/sub-specs/technical-spec.md