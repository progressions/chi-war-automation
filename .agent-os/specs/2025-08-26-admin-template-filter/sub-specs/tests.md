# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-08-26-admin-template-filter/spec.md

> Created: 2025-08-26
> Version: 1.0.0

## Test Coverage

### Backend API Tests (RSpec)

**CharactersController Specs:**

```ruby
# spec/controllers/api/v2/characters_controller_spec.rb

describe "GET #index with template_filter" do
  let(:campaign) { create(:campaign) }
  let(:admin_user) { create(:user, gamemaster: true) }
  let(:regular_user) { create(:user, gamemaster: false) }
  let!(:template_character) { create(:character, campaign: campaign, template: true) }
  let!(:regular_character) { create(:character, campaign: campaign, template: false) }
  let!(:nil_template_character) { create(:character, campaign: campaign, template: nil) }

  context "when user is admin" do
    before { sign_in admin_user }
    
    it "filters to templates only" do
      get :index, params: { template_filter: 'templates' }
      expect(response).to have_http_status(:success)
      character_ids = JSON.parse(response.body)['characters'].map { |c| c['id'] }
      expect(character_ids).to contain_exactly(template_character.id)
    end
    
    it "filters to non-templates only" do
      get :index, params: { template_filter: 'non_templates' }
      expect(response).to have_http_status(:success)
      character_ids = JSON.parse(response.body)['characters'].map { |c| c['id'] }
      expect(character_ids).to contain_exactly(regular_character.id, nil_template_character.id)
    end
    
    it "ignores invalid template_filter values" do
      get :index, params: { template_filter: 'invalid' }
      expect(response).to have_http_status(:success)
      character_ids = JSON.parse(response.body)['characters'].map { |c| c['id'] }
      expect(character_ids).to contain_exactly(template_character.id, regular_character.id, nil_template_character.id)
    end
    
    it "combines template_filter with other filters" do
      template_npc = create(:character, campaign: campaign, template: true, character_type: 'npc')
      get :index, params: { template_filter: 'templates', character_type: 'npc' }
      expect(response).to have_http_status(:success)
      character_ids = JSON.parse(response.body)['characters'].map { |c| c['id'] }
      expect(character_ids).to contain_exactly(template_npc.id)
    end
  end
  
  context "when user is not admin" do
    before { sign_in regular_user }
    
    it "ignores template_filter parameter" do
      get :index, params: { template_filter: 'templates' }
      expect(response).to have_http_status(:success)
      character_ids = JSON.parse(response.body)['characters'].map { |c| c['id'] }
      expect(character_ids).to contain_exactly(template_character.id, regular_character.id, nil_template_character.id)
    end
  end
end
```

### Frontend Component Tests (Playwright E2E)

**Template Filter Component Tests:**

```javascript
// test-scripts/test-admin-template-filter.js

const { test, expect } = require('@playwright/test');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');

test.describe('Admin Template Filter', () => {
  test('admin user sees template filter dropdown', async ({ page }) => {
    await loginAsGamemaster(page);
    
    // Navigate to characters page
    await page.goto('http://localhost:3001/characters');
    
    // Verify template filter is visible
    await expect(page.locator('[data-testid="template-filter"]')).toBeVisible();
    
    // Verify filter options
    await page.locator('[data-testid="template-filter"]').click();
    await expect(page.locator('text=All')).toBeVisible();
    await expect(page.locator('text=Templates Only')).toBeVisible();
    await expect(page.locator('text=Non-Templates Only')).toBeVisible();
  });
  
  test('regular user does not see template filter', async ({ page }) => {
    await loginAsPlayer(page);
    
    // Navigate to characters page
    await page.goto('http://localhost:3001/characters');
    
    // Verify template filter is not visible
    await expect(page.locator('[data-testid="template-filter"]')).not.toBeVisible();
  });
  
  test('admin can filter by templates only', async ({ page }) => {
    await loginAsGamemaster(page);
    
    // Set up test data - create template and non-template characters
    // (This would require test setup or existing seed data)
    
    await page.goto('http://localhost:3001/characters');
    
    // Select "Templates Only" filter
    await page.locator('[data-testid="template-filter"]').selectOption('templates');
    
    // Verify only template characters are shown
    await expect(page.locator('[data-testid="character-list"]')).toContainText('Template');
    await expect(page.locator('[data-testid="character-list"]')).not.toContainText('Regular Character');
  });
  
  test('template filter persists with other filters', async ({ page }) => {
    await loginAsGamemaster(page);
    
    await page.goto('http://localhost:3001/characters');
    
    // Apply multiple filters
    await page.locator('[data-testid="character-type-filter"]').selectOption('npc');
    await page.locator('[data-testid="template-filter"]').selectOption('templates');
    
    // Verify both filters are applied
    const url = await page.url();
    expect(url).toContain('character_type=npc');
    expect(url).toContain('template_filter=templates');
    
    // Verify filter state persists on page reload
    await page.reload();
    await expect(page.locator('[data-testid="character-type-filter"]')).toHaveValue('npc');
    await expect(page.locator('[data-testid="template-filter"]')).toHaveValue('templates');
  });
});
```

## Mocking Requirements

**Backend Test Mocking:**
- Mock user authentication and admin status
- Create test characters with various template values (`true`, `false`, `nil`)
- Mock campaign associations and character filtering scopes
- Use existing RSpec factories for user and character creation

**Frontend Test Mocking:**
- Use existing login helper functions for user authentication
- Leverage existing character seed data in test environment
- Mock API responses for character filtering if needed
- Use Playwright's built-in request interception for API testing

**Test Data Requirements:**
- Template characters: `template = true`
- Regular characters: `template = false`
- Legacy characters: `template = nil` (should be treated as non-templates)
- Mixed character types (PC, NPC) with various template values
- Admin and non-admin user accounts for permission testing

**Integration Test Scenarios:**
- Filter combinations (type + template)
- Search with template filtering
- Pagination with template filtering
- URL parameter persistence
- Admin vs regular user behavior differences