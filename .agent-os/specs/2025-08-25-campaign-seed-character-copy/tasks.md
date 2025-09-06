# Spec Tasks

These are the tasks to be completed for the spec detailed in @.agent-os/specs/2025-08-25-campaign-seed-character-copy/spec.md

> Created: 2025-08-25
> Status: Ready for Implementation

## Tasks

- [ ] 1. Identify and Access Master Campaign
  - [ ] 1.1 Write tests for Master Campaign identification logic
  - [ ] 1.2 Implement method to find Master Campaign in CampaignSeederService
  - [ ] 1.3 Add error handling for missing Master Campaign
  - [ ] 1.4 Verify all tests pass

- [ ] 2. Integrate Character Copying into Campaign Seeder
  - [ ] 2.1 Write tests for character copying integration
  - [ ] 2.2 Add character iteration logic after existing seed operations
  - [ ] 2.3 Integrate CharacterDuplicator service calls
  - [ ] 2.4 Add logging for character copy operations
  - [ ] 2.5 Verify all tests pass

- [ ] 3. Implement Error Handling and Transaction Safety
  - [ ] 3.1 Write tests for error scenarios (failed duplication, missing characters)
  - [ ] 3.2 Wrap character copying in rescue blocks
  - [ ] 3.3 Ensure database transaction integrity
  - [ ] 3.4 Add detailed error logging
  - [ ] 3.5 Verify all tests pass

- [ ] 4. End-to-End Testing
  - [ ] 4.1 Write integration test for complete campaign creation with character copying
  - [ ] 4.2 Test with various Master Campaign states (empty, many characters, special characters)
  - [ ] 4.3 Verify character attributes are correctly preserved
  - [ ] 4.4 Test campaign creation still works if Master Campaign is unavailable
  - [ ] 4.5 Run full test suite to ensure no regressions