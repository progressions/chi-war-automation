# Campaign Seeder Not Running - Master Campaign Content Not Copied

**Date:** 2025-08-24  
**Priority:** Medium  
**Category:** Backend  
**Status:** Open  

## Description

When creating a new campaign, the expected master campaign content seeding is not occurring. Users should receive a copy of the master campaign's content (characters, factions, sites, etc.) to help them get started, but this functionality appears to be broken or disabled.

## Steps to Reproduce

1. Login as gamemaster user
2. Create a new campaign through the frontend interface
3. Navigate to the new campaign
4. Check for pre-populated content (characters, factions, sites, parties)

## Expected Behavior

- New campaign should be populated with template content from a master campaign
- This should include sample characters, factions, sites, and other entities to help users get started
- The seeded content should provide a foundation for users to build upon

## Actual Behavior

- New campaign is created empty with no seeded content
- Users must create all content from scratch

## Related Files

- `app/models/campaign.rb` - Check for `after_create` callbacks or seeding logic
- `db/seeds.rb` - Verify master campaign data exists
- `app/services/` - Look for campaign seeding service classes
- `app/controllers/api/v*/campaigns_controller.rb` - Check campaign creation endpoints

## Investigation Notes

Need to investigate:
1. Whether a master campaign seeding system was previously implemented
2. If seeding logic exists but is disabled/broken
3. What template content should be copied to new campaigns
4. Whether this should be configurable or always active

## Screenshots

None provided

## Additional Context

This functionality would significantly improve the new user onboarding experience by providing sample content to explore and modify rather than starting with an empty campaign.