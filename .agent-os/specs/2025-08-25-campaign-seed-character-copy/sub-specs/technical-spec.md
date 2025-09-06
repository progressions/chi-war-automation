# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-25-campaign-seed-character-copy/spec.md

> Created: 2025-08-25
> Version: 1.0.0

## Technical Requirements

- **Modify CampaignSeederService** - Update the `call` method in `app/services/campaign_seeder_service.rb` to include character copying after existing seed operations
- **Master Campaign Identification** - Implement method to identify the Master Campaign (likely by name or special flag)
- **Batch Character Copying** - Use `CharacterDuplicator.new(character, campaign).call` for each Character record from the Master Campaign
- **Error Handling** - Wrap character copying in appropriate error handling to prevent campaign creation failure if character copying encounters issues
- **Logging** - Add Rails.logger statements to track character copying progress and any errors
- **Transaction Safety** - Ensure character copying occurs within the same database transaction as campaign creation for data consistency
- **Performance Optimization** - Consider using batch operations if the Master Campaign contains many characters to avoid N+1 queries

## Approach

### CampaignSeederService Modifications

The service should:
1. Identify the Master Campaign (e.g., `Campaign.find_by(name: "Master Campaign")`)
2. After existing seed operations, iterate through `master_campaign.characters`
3. For each character, call `CharacterDuplicator.new(character, @campaign).call`
4. Handle any duplication errors gracefully without failing the entire campaign creation

### Expected Code Location

- Primary changes in: `shot-server/app/services/campaign_seeder_service.rb`
- No frontend changes required as this is backend-only functionality
- May need to update tests in: `shot-server/spec/services/campaign_seeder_service_spec.rb`

## External Dependencies

- **CharacterDuplicator** - Existing service class for duplicating characters between campaigns
- **Campaign Model** - Master Campaign must exist and be identifiable
- **Character Model** - Characters in Master Campaign must be properly structured for duplication