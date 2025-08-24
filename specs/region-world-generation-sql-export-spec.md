# Region-Based World Generation with SQL Export/Import - Implementation Specification

**Date**: 2025-08-24  
**Feature**: Region-Based World Generation System with SQL Export/Import  
**Related Issue**: `/issues/2025-08-24-region-based-world-generation-sql-export.md`

## Overview

This specification outlines the atomic implementation plan for building a comprehensive region-based world generation system that extends the existing `CampaignSeederService` infrastructure. The system enables gamemasters to create detailed world templates, export them as SQL for sharing, and import them into production campaigns.

## Atomic Implementation Phases

### **Phase 1: Database Foundation**

#### **Chunk 1.1: Create WorldTemplate Model**
```ruby
# db/migrate/create_world_templates.rb
class CreateWorldTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :world_templates, id: :uuid do |t|
      t.string :name, null: false, limit: 255
      t.text :description
      t.string :author_email, limit: 255
      t.string :feng_shui_edition, default: '2', limit: 10
      t.boolean :is_official, default: false
      t.boolean :is_active, default: true
      t.json :metadata, default: {}
      t.timestamps
    end
    
    add_index :world_templates, :name
    add_index :world_templates, :is_official
    add_index :world_templates, :is_active
    add_index :world_templates, :author_email
  end
end
```
**Deliverable**: Database can store world template metadata
**Tests**: Migration runs, model validates required fields

#### **Chunk 1.2: Create RegionTemplate Model**
```ruby
# db/migrate/create_region_templates.rb
class CreateRegionTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :region_templates, id: :uuid do |t|
      t.references :world_template, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false, limit: 255
      t.text :description
      t.string :juncture, null: false, limit: 20
      t.string :region_type, limit: 50
      t.json :geographical_data, default: {}
      t.json :story_hooks, default: {}
      t.integer :recommended_level_min, default: 1
      t.integer :recommended_level_max, default: 10
      t.boolean :is_active, default: true
      t.timestamps
    end
    
    add_index :region_templates, [:world_template_id, :juncture]
    add_index :region_templates, :region_type
    add_index :region_templates, :is_active
  end
end
```
**Deliverable**: Database can store regional world data
**Tests**: Foreign key relationships, juncture validation

#### **Chunk 1.3: Create WorldTemplateCampaign Junction**
```ruby
# db/migrate/create_world_template_campaigns.rb
class CreateWorldTemplateCampaigns < ActiveRecord::Migration[7.0]
  def change
    create_table :world_template_campaigns, id: :uuid do |t|
      t.references :world_template, null: false, foreign_key: true, type: :uuid
      t.references :campaign, null: false, foreign_key: true, type: :uuid
      t.datetime :applied_at, null: false
      t.string :applied_by_email
      t.json :import_metadata, default: {}
      t.timestamps
    end
    
    add_index :world_template_campaigns, [:world_template_id, :campaign_id], 
              unique: true, name: 'idx_world_template_campaign_unique'
    add_index :world_template_campaigns, :applied_at
  end
end
```
**Deliverable**: Track which world templates are applied to campaigns
**Tests**: Unique constraint, timestamps

### **Phase 2: Core Data Models**

#### **Chunk 2.1: WorldTemplate Model Implementation**
```ruby
# app/models/world_template.rb
class WorldTemplate < ApplicationRecord
  has_many :region_templates, dependent: :destroy
  has_many :world_template_campaigns, dependent: :destroy
  has_many :campaigns, through: :world_template_campaigns
  
  validates :name, presence: true, length: { maximum: 255 }
  validates :description, presence: true
  validates :author_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :feng_shui_edition, inclusion: { in: %w[1 2] }
  
  scope :active, -> { where(is_active: true) }
  scope :official, -> { where(is_official: true) }
  scope :by_author, ->(email) { where(author_email: email) }
  
  def total_regions
    region_templates.count
  end
  
  def junctures_covered
    region_templates.distinct.pluck(:juncture)
  end
end
```
**Deliverable**: Complete WorldTemplate model with validations and associations
**Tests**: Model validations, scopes, instance methods

#### **Chunk 2.2: RegionTemplate Model Implementation**
```ruby
# app/models/region_template.rb
class RegionTemplate < ApplicationRecord
  belongs_to :world_template
  
  # Extended associations to existing models
  has_many :sites, foreign_key: :region_template_id, dependent: :destroy
  has_many :factions, foreign_key: :region_template_id, dependent: :destroy
  has_many :characters, foreign_key: :region_template_id, dependent: :destroy
  has_many :parties, foreign_key: :region_template_id, dependent: :destroy
  
  validates :name, presence: true, length: { maximum: 255 }
  validates :description, presence: true
  validates :juncture, inclusion: { 
    in: %w[ancient 1850s contemporary future],
    message: 'must be a valid Feng Shui 2 juncture'
  }
  validates :region_type, inclusion: { 
    in: %w[urban rural mystical corporate underground netherworld],
    allow_blank: true 
  }
  validates :recommended_level_min, :recommended_level_max, 
            numericality: { greater_than: 0, less_than_or_equal_to: 20 }
  
  validate :level_range_logical
  
  scope :active, -> { where(is_active: true) }
  scope :for_juncture, ->(juncture) { where(juncture: juncture) }
  scope :by_type, ->(type) { where(region_type: type) }
  
  def content_summary
    {
      sites: sites.count,
      factions: factions.count,
      characters: characters.count,
      parties: parties.count
    }
  end
  
  private
  
  def level_range_logical
    return unless recommended_level_min && recommended_level_max
    
    if recommended_level_min > recommended_level_max
      errors.add(:recommended_level_max, 'must be greater than or equal to minimum level')
    end
  end
end
```
**Deliverable**: Complete RegionTemplate model with content relationships
**Tests**: Validations, associations, business logic methods

### **Phase 3: Extend Existing Models for Region Support**

#### **Chunk 3.1: Add Region Template Support to Existing Models**
```ruby
# Migration: Add region_template_id to existing content models
class AddRegionTemplateToContentModels < ActiveRecord::Migration[7.0]
  def change
    add_reference :sites, :region_template, type: :uuid, foreign_key: true, null: true
    add_reference :factions, :region_template, type: :uuid, foreign_key: true, null: true  
    add_reference :characters, :region_template, type: :uuid, foreign_key: true, null: true
    add_reference :parties, :region_template, type: :uuid, foreign_key: true, null: true
    
    add_index :sites, :region_template_id
    add_index :factions, :region_template_id
    add_index :characters, :region_template_id
    add_index :parties, :region_template_id
  end
end

# Update existing models to support region templates
# app/models/site.rb
class Site < ApplicationRecord
  belongs_to :region_template, optional: true
  # ... existing code
  
  scope :template_content, -> { where.not(region_template_id: nil) }
  scope :campaign_content, -> { where(region_template_id: nil) }
end
```
**Deliverable**: Existing content models can belong to region templates
**Tests**: Foreign key relationships, scopes work correctly

### **Phase 4: SQL Export/Import Services**

#### **Chunk 4.1: SQL Export Service Foundation**
```ruby
# app/services/sql_export_service.rb
class SqlExportService
  class << self
    def export_world_template(world_template_id, options = {})
      world_template = WorldTemplate.find(world_template_id)
      
      exporter = new(world_template, options)
      exporter.generate_export
    end
  end
  
  def initialize(world_template, options = {})
    @world_template = world_template
    @format = options[:format] || 'sql'
    @include_metadata = options[:include_metadata] != false
    @compress = options[:compress] || false
  end
  
  def generate_export
    case @format
    when 'sql'
      generate_sql_dump
    when 'json'
      generate_json_export
    else
      raise ArgumentError, "Unsupported export format: #{@format}"
    end
  end
  
  private
  
  def generate_sql_dump
    sql_statements = []
    
    # Export world template
    sql_statements << generate_insert_statement('world_templates', @world_template)
    
    # Export region templates
    @world_template.region_templates.find_each do |region|
      sql_statements << generate_insert_statement('region_templates', region)
      sql_statements.concat(export_region_content(region))
    end
    
    format_sql_output(sql_statements)
  end
  
  def generate_insert_statement(table_name, record)
    # Generate safe SQL INSERT statement with proper UUID handling
    columns = record.attributes.keys
    values = record.attributes.values.map { |v| sanitize_sql_value(v) }
    
    "INSERT INTO #{table_name} (#{columns.join(', ')}) VALUES (#{values.join(', ')});"
  end
  
  def sanitize_sql_value(value)
    # Properly escape and format values for SQL insertion
    case value
    when String
      "'#{value.gsub("'", "''")}'"
    when NilClass
      'NULL'
    when Time, Date, DateTime
      "'#{value.iso8601}'"
    when Hash, Array
      "'#{value.to_json.gsub("'", "''")}'"
    else
      value.to_s
    end
  end
end
```
**Deliverable**: Can export world templates as SQL dumps
**Tests**: SQL generation, value sanitization, format options

#### **Chunk 4.2: SQL Import Service Foundation**
```ruby
# app/services/sql_import_service.rb
class SqlImportService
  class ImportError < StandardError; end
  class ValidationError < ImportError; end
  
  class << self
    def import_world_template(sql_content, target_campaign_id, options = {})
      importer = new(sql_content, target_campaign_id, options)
      importer.perform_import
    end
  end
  
  def initialize(sql_content, target_campaign_id, options = {})
    @sql_content = sql_content
    @target_campaign = Campaign.find(target_campaign_id)
    @dry_run = options[:dry_run] || false
    @validate_only = options[:validate_only] || false
  end
  
  def perform_import
    Rails.logger.info "Starting world template import for campaign #{@target_campaign.id}"
    
    validate_sql_content!
    validate_import_permissions!
    
    if @validate_only
      return { status: 'valid', message: 'SQL content is valid for import' }
    end
    
    if @dry_run
      simulate_import
    else
      execute_import
    end
  rescue ImportError => e
    Rails.logger.error "World template import failed: #{e.message}"
    { status: 'error', message: e.message }
  end
  
  private
  
  def validate_sql_content!
    # Validate SQL content is safe and well-formed
    if @sql_content.blank?
      raise ValidationError, 'SQL content cannot be empty'
    end
    
    # Check for dangerous SQL operations
    dangerous_patterns = [
      /DROP\s+/i, /DELETE\s+FROM\s+(?!world_templates|region_templates)/i,
      /TRUNCATE\s+/i, /ALTER\s+/i, /CREATE\s+(?!TEMP)/i
    ]
    
    dangerous_patterns.each do |pattern|
      if @sql_content.match?(pattern)
        raise ValidationError, 'SQL content contains prohibited operations'
      end
    end
  end
  
  def validate_import_permissions!
    unless @target_campaign.user.gamemaster?
      raise ValidationError, 'Only gamemasters can import world templates'
    end
  end
  
  def execute_import
    ActiveRecord::Base.transaction do
      # Parse and execute SQL statements
      # Create world template campaign association
      # Log import completion
      
      Rails.logger.info "World template imported successfully to campaign #{@target_campaign.id}"
      { status: 'success', message: 'World template imported successfully' }
    end
  end
end
```
**Deliverable**: Safe SQL import with validation and permissions
**Tests**: SQL validation, security checks, import execution

### **Phase 5: Enhanced CampaignSeederService Integration**

#### **Chunk 5.1: World Template Seeding Support**
```ruby
# Enhanced app/services/campaign_seeder_service.rb
class CampaignSeederService
  class << self
    # Existing method enhanced
    def seed_campaign(campaign)
      return false if campaign.seeded_at.present?
      
      master_template = Campaign.find_by(is_master_template: true)
      return false unless master_template
      
      success = seed_basic_templates(campaign, master_template)
      
      # Check for world template seeding
      if campaign.preferred_world_template_id.present?
        world_success = seed_campaign_with_world_template(campaign, campaign.preferred_world_template_id)
        success = success && world_success
      end
      
      campaign.update!(seeded_at: Time.current) if success
      success
    end
    
    # New method for world template seeding
    def seed_campaign_with_world_template(campaign, world_template_id)
      return false if campaign_has_world_template?(campaign, world_template_id)
      
      world_template = WorldTemplate.active.find(world_template_id)
      
      Rails.logger.info "Seeding campaign #{campaign.id} with world template: #{world_template.name}"
      
      ActiveRecord::Base.transaction do
        # Create association
        world_template_campaign = WorldTemplateCampaign.create!(
          world_template: world_template,
          campaign: campaign,
          applied_at: Time.current,
          applied_by_email: campaign.user.email
        )
        
        # Seed each region
        world_template.region_templates.active.find_each do |region_template|
          seed_region_content(campaign, region_template)
        end
        
        Rails.logger.info "World template '#{world_template.name}' applied to campaign #{campaign.id}"
      end
      
      true
    rescue => e
      Rails.logger.error "Failed to seed campaign with world template: #{e.message}"
      false
    end
    
    private
    
    def seed_region_content(campaign, region_template)
      # Duplicate region sites
      region_template.sites.find_each do |site|
        duplicate_site_to_campaign(site, campaign)
      end
      
      # Duplicate region factions
      region_template.factions.find_each do |faction|
        duplicate_faction_to_campaign(faction, campaign)
      end
      
      # Duplicate region characters (NPCs)
      region_template.characters.find_each do |character|
        duplicated = CharacterDuplicatorService.duplicate_character(character, campaign.user)
        duplicated.campaign = campaign
        duplicated.region_template = nil # Remove template association
        duplicated.save!
      end
      
      # Duplicate region parties
      region_template.parties.find_each do |party|
        duplicate_party_to_campaign(party, campaign)
      end
    end
    
    def campaign_has_world_template?(campaign, world_template_id)
      campaign.world_template_campaigns.exists?(world_template_id: world_template_id)
    end
  end
end
```
**Deliverable**: CampaignSeederService can populate campaigns with world templates
**Tests**: World template application, content duplication, error handling

### **Phase 6: Region World Generator Service**

#### **Chunk 6.1: World Template Creation Service**
```ruby
# app/services/region_world_generator_service.rb
class RegionWorldGeneratorService
  class GenerationError < StandardError; end
  
  class << self
    def generate_world_template(params)
      generator = new(params)
      generator.create_world_template
    end
    
    def generate_region_template(world_template, region_params)
      generator = new(world_template: world_template)
      generator.create_region_template(region_params)
    end
  end
  
  def initialize(params)
    @params = params.with_indifferent_access
    @world_template = @params[:world_template]
  end
  
  def create_world_template
    validate_world_template_params!
    
    ActiveRecord::Base.transaction do
      world_template = WorldTemplate.create!(
        name: @params[:name],
        description: @params[:description],
        author_email: @params[:author_email],
        feng_shui_edition: @params[:feng_shui_edition] || '2',
        is_official: @params[:is_official] || false,
        metadata: build_world_metadata
      )
      
      # Create regions if provided
      if @params[:regions].present?
        @params[:regions].each do |region_data|
          create_region_template_for_world(world_template, region_data)
        end
      end
      
      Rails.logger.info "Created world template: #{world_template.name} with #{world_template.region_templates.count} regions"
      world_template
    end
  rescue => e
    Rails.logger.error "Failed to create world template: #{e.message}"
    raise GenerationError, "World template creation failed: #{e.message}"
  end
  
  def create_region_template(region_params)
    validate_region_template_params!(region_params)
    
    region_template = @world_template.region_templates.create!(
      name: region_params[:name],
      description: region_params[:description],
      juncture: region_params[:juncture],
      region_type: region_params[:region_type],
      recommended_level_min: region_params[:recommended_level_min] || 1,
      recommended_level_max: region_params[:recommended_level_max] || 10,
      geographical_data: region_params[:geographical_data] || {},
      story_hooks: region_params[:story_hooks] || {}
    )
    
    # Generate region content if requested
    if region_params[:auto_generate_content]
      generate_region_content(region_template, region_params[:content_options] || {})
    end
    
    region_template
  end
  
  private
  
  def validate_world_template_params!
    required_fields = %w[name description author_email]
    missing_fields = required_fields.select { |field| @params[field].blank? }
    
    if missing_fields.any?
      raise GenerationError, "Missing required fields: #{missing_fields.join(', ')}"
    end
    
    unless URI::MailTo::EMAIL_REGEXP.match?(@params[:author_email])
      raise GenerationError, "Invalid email format: #{@params[:author_email]}"
    end
  end
  
  def build_world_metadata
    {
      created_via: 'region_world_generator_service',
      generation_timestamp: Time.current.iso8601,
      generator_version: '1.0',
      content_guidelines: @params[:content_guidelines] || 'standard_feng_shui_2'
    }
  end
  
  def generate_region_content(region_template, content_options)
    # Auto-generate sites, factions, NPCs based on region type and juncture
    generate_sites_for_region(region_template, content_options)
    generate_factions_for_region(region_template, content_options)
    generate_characters_for_region(region_template, content_options)
  end
end
```
**Deliverable**: Service can create world templates with multiple regions
**Tests**: World template creation, region generation, validation, error handling

### **Phase 7: API Controllers**

#### **Chunk 7.1: Admin World Templates Controller**
```ruby
# app/controllers/api/v2/admin/world_templates_controller.rb
class Api::V2::Admin::WorldTemplatesController < Api::V2::ApplicationController
  before_action :ensure_gamemaster
  before_action :set_world_template, only: [:show, :update, :destroy, :export, :apply_to_campaign]
  
  def index
    @world_templates = WorldTemplate.active
                                   .includes(:region_templates, :world_template_campaigns)
                                   .order(:name)
    
    @world_templates = @world_templates.where(is_official: params[:official]) if params[:official].present?
    @world_templates = @world_templates.by_author(params[:author]) if params[:author].present?
    
    render json: @world_templates, each_serializer: WorldTemplateSerializer
  end
  
  def show
    render json: @world_template, serializer: WorldTemplateDetailSerializer
  end
  
  def create
    result = RegionWorldGeneratorService.generate_world_template(world_template_params)
    render json: result, serializer: WorldTemplateDetailSerializer, status: :created
  rescue RegionWorldGeneratorService::GenerationError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end
  
  def update
    if @world_template.update(world_template_params)
      render json: @world_template, serializer: WorldTemplateDetailSerializer
    else
      render json: { errors: @world_template.errors }, status: :unprocessable_entity
    end
  end
  
  def destroy
    @world_template.update!(is_active: false)
    head :no_content
  end
  
  def export
    format = params[:format] || 'sql'
    export_result = SqlExportService.export_world_template(@world_template.id, format: format)
    
    send_data export_result[:content],
              filename: "#{@world_template.name.parameterize}_#{Date.current}.#{format}",
              type: export_result[:content_type]
  end
  
  def apply_to_campaign
    campaign = current_user.campaigns.find(params[:campaign_id])
    success = CampaignSeederService.seed_campaign_with_world_template(campaign, @world_template.id)
    
    if success
      render json: { message: 'World template applied successfully' }
    else
      render json: { error: 'Failed to apply world template' }, status: :unprocessable_entity
    end
  end
  
  def import_sql
    campaign = current_user.campaigns.find(params[:campaign_id])
    sql_content = params[:sql_content]
    
    result = SqlImportService.import_world_template(sql_content, campaign.id)
    
    if result[:status] == 'success'
      render json: result
    else
      render json: result, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_world_template
    @world_template = WorldTemplate.active.find(params[:id])
  end
  
  def world_template_params
    params.require(:world_template).permit(
      :name, :description, :author_email, :feng_shui_edition, :is_official,
      metadata: {}, 
      regions: [
        :name, :description, :juncture, :region_type, :recommended_level_min, :recommended_level_max,
        geographical_data: {}, story_hooks: {}, content_options: {}
      ]
    )
  end
  
  def ensure_gamemaster
    render json: { error: 'Gamemaster access required' }, status: :forbidden unless current_user.gamemaster?
  end
end
```
**Deliverable**: Admin API for world template management
**Tests**: CRUD operations, permissions, export/import functionality

### **Phase 8: Testing Strategy**

#### **Chunk 8.1: Model Tests**
```ruby
# spec/models/world_template_spec.rb
RSpec.describe WorldTemplate, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:description) }
    it { should validate_presence_of(:author_email) }
    it { should validate_length_of(:name).is_at_most(255) }
    it { should allow_value('user@example.com').for(:author_email) }
    it { should_not allow_value('invalid-email').for(:author_email) }
    it { should validate_inclusion_of(:feng_shui_edition).in_array(%w[1 2]) }
  end
  
  describe 'associations' do
    it { should have_many(:region_templates).dependent(:destroy) }
    it { should have_many(:world_template_campaigns).dependent(:destroy) }
    it { should have_many(:campaigns).through(:world_template_campaigns) }
  end
  
  describe 'scopes' do
    let!(:active_template) { create(:world_template, is_active: true) }
    let!(:inactive_template) { create(:world_template, is_active: false) }
    
    it 'returns only active templates' do
      expect(WorldTemplate.active).to contain_exactly(active_template)
    end
  end
  
  describe 'instance methods' do
    let(:world_template) { create(:world_template) }
    let!(:regions) { create_list(:region_template, 3, world_template: world_template) }
    
    describe '#total_regions' do
      it 'returns the count of region templates' do
        expect(world_template.total_regions).to eq(3)
      end
    end
    
    describe '#junctures_covered' do
      it 'returns unique junctures from regions' do
        regions[0].update!(juncture: 'contemporary')
        regions[1].update!(juncture: 'future')
        regions[2].update!(juncture: 'contemporary')
        
        expect(world_template.junctures_covered).to contain_exactly('contemporary', 'future')
      end
    end
  end
end
```
**Deliverable**: Comprehensive model test coverage
**Tests**: Validations, associations, scopes, methods

#### **Chunk 8.2: Service Tests**
```ruby
# spec/services/sql_export_service_spec.rb
RSpec.describe SqlExportService, type: :service do
  let(:world_template) { create(:world_template_with_regions) }
  
  describe '.export_world_template' do
    context 'with SQL format' do
      it 'generates valid SQL export' do
        result = described_class.export_world_template(world_template.id, format: 'sql')
        
        expect(result[:content]).to include('INSERT INTO world_templates')
        expect(result[:content]).to include('INSERT INTO region_templates')
        expect(result[:content_type]).to eq('text/sql')
      end
      
      it 'properly escapes SQL values' do
        world_template.update!(description: "A world with 'quotes' and \"double quotes\"")
        result = described_class.export_world_template(world_template.id, format: 'sql')
        
        expect(result[:content]).to include("'A world with ''quotes'' and \"double quotes\"'")
      end
    end
    
    context 'with invalid format' do
      it 'raises ArgumentError' do
        expect {
          described_class.export_world_template(world_template.id, format: 'xml')
        }.to raise_error(ArgumentError, 'Unsupported export format: xml')
      end
    end
  end
end

# spec/services/campaign_seeder_service_spec.rb (enhanced)
RSpec.describe CampaignSeederService, type: :service do
  let(:campaign) { create(:campaign) }
  let(:world_template) { create(:world_template_with_content) }
  
  describe '.seed_campaign_with_world_template' do
    it 'applies world template to campaign' do
      expect {
        described_class.seed_campaign_with_world_template(campaign, world_template.id)
      }.to change { campaign.world_template_campaigns.count }.by(1)
    end
    
    it 'duplicates region content to campaign' do
      region = world_template.region_templates.first
      create(:site, region_template: region)
      create(:faction, region_template: region)
      
      described_class.seed_campaign_with_world_template(campaign, world_template.id)
      
      expect(campaign.sites.count).to eq(1)
      expect(campaign.factions.count).to eq(1)
    end
    
    it 'prevents duplicate applications' do
      described_class.seed_campaign_with_world_template(campaign, world_template.id)
      
      expect {
        described_class.seed_campaign_with_world_template(campaign, world_template.id)
      }.not_to change { campaign.world_template_campaigns.count }
    end
  end
end
```
**Deliverable**: Comprehensive service test coverage
**Tests**: Export/import functionality, seeding logic, error handling

## Implementation Timeline

### Sprint 1 (Week 1): Foundation
- **Days 1-2**: Chunks 1.1-1.3 (Database models and migrations)
- **Days 3-4**: Chunks 2.1-2.2 (Model implementations)
- **Day 5**: Chunk 3.1 (Extend existing models)

### Sprint 2 (Week 2): Core Services
- **Days 1-2**: Chunk 4.1 (SQL Export Service)
- **Days 2-3**: Chunk 4.2 (SQL Import Service) 
- **Days 4-5**: Chunk 5.1 (Enhanced CampaignSeederService)

### Sprint 3 (Week 3): Generation and API
- **Days 1-3**: Chunk 6.1 (Region World Generator Service)
- **Days 4-5**: Chunk 7.1 (Admin API Controller)

### Sprint 4 (Week 4): Testing and Polish
- **Days 1-2**: Chunk 8.1 (Model tests)
- **Days 3-4**: Chunk 8.2 (Service tests)
- **Day 5**: Integration testing and documentation

## Success Criteria

### Functional Requirements
- [ ] Can create world templates with multiple regions
- [ ] Can export world templates as SQL for sharing
- [ ] Can safely import SQL world templates into campaigns
- [ ] Enhanced CampaignSeederService applies world templates automatically
- [ ] Admin interface supports full world template lifecycle
- [ ] All data relationships preserved during export/import

### Technical Requirements
- [ ] 100% test coverage for all new services and models
- [ ] SQL export/import is secure and prevents injection attacks
- [ ] Performance acceptable for large world templates (100+ regions)
- [ ] Database migrations are reversible and safe
- [ ] API follows existing v2 conventions and security patterns

### Business Requirements
- [ ] Gamemasters can create and share comprehensive world templates
- [ ] New campaigns can be instantly populated with rich world content
- [ ] Official Feng Shui 2 world templates available for import
- [ ] Template sharing enables community-generated content
- [ ] Import/export supports backup and migration workflows

This specification provides a comprehensive, testable implementation plan that extends the existing Chi War infrastructure while maintaining security, performance, and maintainability standards.