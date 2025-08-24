# Region-Based World Generation System with SQL Export/Import

**Date**: 2025-08-24  
**Priority**: High  
**Category**: Backend, World Building  
**Status**: Open

## Description

Implement a region-based world generation system that allows gamemasters to create comprehensive world templates that can be exported as SQL data and imported into production environments. This system builds upon the existing `CampaignSeederService` infrastructure to provide advanced world-building capabilities for Feng Shui 2 campaigns.

## Steps to Reproduce
N/A - This is a new feature implementation.

## Expected Behavior
- Gamemasters can create region-based world templates with locations, factions, NPCs, and story elements
- Complete world templates can be exported as SQL dumps for sharing and backup
- SQL templates can be imported into production campaigns via admin interface
- Integration with existing `CampaignSeederService` for automated world population
- Regional templates support multiple junctures (time periods) with period-specific content

## Actual Behavior
Currently no region-based world generation system exists. The application only supports basic campaign seeding with character templates.

## Related Files
**Backend (shot-server/):**
- `app/services/region_world_generator_service.rb` - New service for region-based world generation
- `app/services/sql_export_service.rb` - New service for SQL export functionality
- `app/services/sql_import_service.rb` - New service for SQL import functionality
- `app/services/campaign_seeder_service.rb` - Enhanced to support world template seeding
- `app/models/region_template.rb` - New model for regional world templates
- `app/models/world_template.rb` - New model for complete world templates
- `app/controllers/api/v2/admin/world_templates_controller.rb` - Admin interface for template management
- `db/migrate/create_region_templates.rb` - Migration for region templates
- `db/migrate/create_world_templates.rb` - Migration for world templates
- `spec/services/region_world_generator_service_spec.rb` - Tests for world generation
- `spec/services/sql_export_service_spec.rb` - Tests for SQL export
- `spec/services/sql_import_service_spec.rb` - Tests for SQL import

**Frontend (shot-client-next/):**
- `src/components/admin/WorldTemplateManager.tsx` - Admin interface for world template management
- `src/components/worldbuilding/RegionBuilder.tsx` - Interface for creating regional templates
- `src/services/WorldTemplateService.ts` - Frontend service for world template operations

## Investigation Notes

**Core Requirements:**
1. **Region-Based Structure**: World templates organized by geographic/thematic regions
2. **SQL Export/Import**: Complete data portability for sharing and backup
3. **Production Integration**: Safe import mechanism for live environments
4. **CampaignSeederService Integration**: Automated world population using existing infrastructure
5. **Multi-Juncture Support**: Templates support different time periods (Ancient, 1850s, Contemporary, Future)

**Data Model Design:**
```ruby
# World Template - Complete world package
class WorldTemplate < ApplicationRecord
  has_many :region_templates, dependent: :destroy
  has_many :campaigns # Can be applied to multiple campaigns
  
  validates :name, presence: true
  validates :description, presence: true
end

# Region Template - Geographic/thematic sections
class RegionTemplate < ApplicationRecord
  belongs_to :world_template
  has_many :sites
  has_many :factions
  has_many :characters # NPCs specific to this region
  has_many :parties
  
  validates :name, presence: true
  validates :juncture, inclusion: { in: %w[ancient 1850s contemporary future] }
end
```

**Service Architecture:**
- `RegionWorldGeneratorService`: Coordinates world template creation and population
- `SqlExportService`: Generates SQL dumps of world templates with all related data
- `SqlImportService`: Safely imports world templates into target campaigns
- Enhanced `CampaignSeederService`: Uses world templates for comprehensive campaign seeding

**Security Considerations:**
- SQL import must validate data integrity and prevent injection attacks
- Admin-only access to import functionality
- Sandbox validation before production import
- Audit logging for all world template operations

## Potential Solution

**Phase 1: Data Models and Migrations**
```ruby
# db/migrate/create_world_templates.rb
class CreateWorldTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :world_templates, id: :uuid do |t|
      t.string :name, null: false
      t.text :description
      t.string :author_email
      t.string :feng_shui_edition, default: '2'
      t.boolean :is_official, default: false
      t.json :metadata, default: {}
      t.timestamps
    end
    
    add_index :world_templates, :name
    add_index :world_templates, :is_official
  end
end

# db/migrate/create_region_templates.rb  
class CreateRegionTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :region_templates, id: :uuid do |t|
      t.references :world_template, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false
      t.text :description
      t.string :juncture, null: false # ancient, 1850s, contemporary, future
      t.string :region_type # urban, rural, mystical, corporate, etc.
      t.json :geographical_data, default: {}
      t.integer :recommended_level_min, default: 1
      t.integer :recommended_level_max, default: 10
      t.timestamps
    end
    
    add_index :region_templates, [:world_template_id, :juncture]
    add_index :region_templates, :region_type
  end
end
```

**Phase 2: Core Services**
```ruby
# app/services/region_world_generator_service.rb
class RegionWorldGeneratorService
  class << self
    def generate_world_template(params)
      world_template = WorldTemplate.create!(
        name: params[:name],
        description: params[:description],
        author_email: params[:author_email]
      )
      
      params[:regions].each do |region_data|
        create_region_template(world_template, region_data)
      end
      
      world_template
    end
    
    private
    
    def create_region_template(world_template, region_data)
      region = world_template.region_templates.create!(
        name: region_data[:name],
        description: region_data[:description],
        juncture: region_data[:juncture],
        region_type: region_data[:region_type]
      )
      
      populate_region_content(region, region_data)
    end
    
    def populate_region_content(region, region_data)
      # Create sites, factions, NPCs, and parties for this region
      # Use existing duplication services where possible
    end
  end
end

# app/services/sql_export_service.rb
class SqlExportService
  class << self
    def export_world_template(world_template_id, format: 'sql')
      world_template = WorldTemplate.find(world_template_id)
      
      case format
      when 'sql'
        generate_sql_dump(world_template)
      when 'json'
        generate_json_export(world_template)
      else
        raise ArgumentError, "Unsupported export format: #{format}"
      end
    end
    
    private
    
    def generate_sql_dump(world_template)
      # Generate SQL INSERT statements for world template and all related data
      # Include proper foreign key handling and UUID generation
    end
  end
end
```

**Phase 3: Enhanced CampaignSeederService Integration**
```ruby
# Enhanced app/services/campaign_seeder_service.rb
class CampaignSeederService
  class << self
    def seed_campaign_with_world_template(campaign, world_template_id)
      return false if campaign.seeded_at.present?
      
      world_template = WorldTemplate.find(world_template_id)
      
      Rails.logger.info "Seeding campaign #{campaign.id} with world template #{world_template.name}"
      
      world_template.region_templates.find_each do |region_template|
        seed_region_content(campaign, region_template)
      end
      
      campaign.update!(seeded_at: Time.current, world_template: world_template)
      true
    rescue => e
      Rails.logger.error "Failed to seed campaign #{campaign.id}: #{e.message}"
      false
    end
    
    private
    
    def seed_region_content(campaign, region_template)
      # Duplicate region sites, factions, characters, and parties to campaign
      # Maintain regional organization and relationships
    end
  end
end
```

## Related Issues
- `/issues/2025-08-23-campaign-seeding-phase-7-campaign-seeder-service.md` - Base CampaignSeederService implementation
- `/issues/2025-08-23-campaign-template-seeding-background-jobs.md` - Background job infrastructure
- `/specs/campaign-template-seeding-atomic-implementation.md` - Atomic implementation approach

## Implementation Phases
1. **Data Models**: Create world and region template models with migrations
2. **Core Services**: Implement world generation, SQL export/import services  
3. **CampaignSeederService Enhancement**: Integrate world template seeding
4. **Admin Interface**: Create frontend for world template management
5. **Testing**: Comprehensive test suite for all services
6. **Documentation**: Admin guides for world template creation and management