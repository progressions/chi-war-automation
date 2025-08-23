/**
 * Character Creation Helper for Chi War End-to-End Tests
 * 
 * Provides reusable functions for character management workflows including:
 * - Template character browsing and selection
 * - Character creation from templates
 * - Character customization
 * - NPC and enemy creation
 */

const TEST_CONFIG = require('../test-config');
const { takeScreenshot, waitForPageLoad } = require('./user-registration-helper');

/**
 * Browses available character templates
 * @param {Page} page - Playwright page object
 * @param {Object} options - Optional configuration
 * @returns {Array} List of available templates
 */
async function browseCharacterTemplates(page, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log('👥 Browsing character templates...');
  
  try {
    // Navigate to character creation page to see templates
    await page.goto(`${TEST_CONFIG.getCharactersUrl()}/new`);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `12-character-templates-browse`, screenshotDir);
    }
    
    // Look for template elements
    const templateSelectors = [
      '[data-testid="character-template"]',
      '.character-template',
      '.template-card',
      '.template-item',
      'button[data-template]',
      'div[role="button"]:has-text("Archer")',
      'div[role="button"]:has-text("Sorcerer")',
      'div[role="button"]:has-text("Spy")'
    ];
    
    const templates = [];
    
    for (const selector of templateSelectors) {
      const elements = await page.locator(selector).all();
      
      for (const element of elements) {
        const name = await element.textContent().catch(() => '');
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible && name.trim()) {
          templates.push({
            name: name.trim(),
            selector,
            element
          });
        }
      }
      
      if (templates.length > 0) break;
    }
    
    console.log(`📋 Found ${templates.length} character templates`);
    
    return templates;
    
  } catch (error) {
    console.error('❌ Template browsing failed:', error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-template-browse`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Creates a character from template or custom data
 * @param {Page} page - Playwright page object
 * @param {Object} characterData - Character data
 * @param {string} characterData.name - Character name
 * @param {string} characterData.type - Character type (pc, npc, mook, boss, etc.)
 * @param {string} characterData.template - Template name (optional)
 * @param {string} characterData.description - Character description
 * @param {string} characterData.faction - Faction assignment (optional)
 * @param {string} characterData.juncture - Juncture assignment (optional)
 * @param {Object} options - Optional configuration
 * @returns {Object} Character creation result
 */
async function createCharacter(page, characterData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`👤 Creating character: ${characterData.name} (${characterData.type})`);
  
  try {
    // Navigate to characters page first
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await waitForPageLoad(page);
    
    // Look for "Create Character" button
    const createSelectors = [
      'button:has-text("Create Character")',
      'button:has-text("New Character")',
      'a:has-text("Create Character")',
      'a:has-text("New Character")',
      'button:has-text("+")',
      '[data-testid="create-character"]'
    ];
    
    let createButton = null;
    for (const selector of createSelectors) {
      createButton = page.locator(selector).first();
      if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      createButton = null;
    }
    
    if (!createButton) {
      console.log('⚠️ No create character button found, trying direct navigation');
      await page.goto(`${TEST_CONFIG.getCharactersUrl()}/new`);
    } else {
      await createButton.click();
    }
    
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `13-character-creation-${characterData.type}`, screenshotDir);
    }
    
    // Select template if specified
    if (characterData.template) {
      console.log(`🎭 Selecting template: ${characterData.template}`);
      
      const templateSelectors = [
        `button:has-text("${characterData.template}")`,
        `div:has-text("${characterData.template}")`,
        `[data-template="${characterData.template}"]`,
        `[data-testid="template-${characterData.template.toLowerCase()}"]`
      ];
      
      for (const selector of templateSelectors) {
        const templateElement = page.locator(selector).first();
        if (await templateElement.isVisible({ timeout: 1000 }).catch(() => false)) {
          await templateElement.click();
          await page.waitForTimeout(1000); // Wait for template to load
          break;
        }
      }
      
      if (takeScreenshots) {
        await takeScreenshot(page, `14-template-selected-${characterData.type}`, screenshotDir);
      }
    }
    
    // Fill character form
    console.log('📝 Filling character form...');
    
    // Fill character name
    const nameSelectors = [
      'input[name="name"]',
      'input[name="character_name"]',
      '#name',
      '#character_name',
      'input[placeholder*="name" i]'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(characterData.name);
        break;
      }
    }
    
    // Set character type
    const typeSelectors = [
      'select[name="character_type"]',
      'select[name="type"]',
      '#character_type',
      '#type'
    ];
    
    for (const selector of typeSelectors) {
      const dropdown = page.locator(selector).first();
      if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
        await dropdown.selectOption({ value: characterData.type });
        break;
      }
    }
    
    // Radio button or button selection for character type
    const typeButtonSelectors = [
      `input[type="radio"][value="${characterData.type}"]`,
      `button[value="${characterData.type}"]`,
      `button:has-text("${characterData.type.toUpperCase()}")`,
      `label:has-text("${characterData.type}") input`
    ];
    
    for (const selector of typeButtonSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.click();
        break;
      }
    }
    
    // Fill description
    const descriptionSelectors = [
      'textarea[name="description"]',
      'input[name="description"]', 
      '#description',
      'textarea[placeholder*="description" i]'
    ];
    
    for (const selector of descriptionSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(characterData.description);
        break;
      }
    }
    
    // Assign faction if provided
    if (characterData.faction) {
      const factionSelectors = [
        'select[name="faction"]',
        'select[name="faction_id"]',
        '#faction',
        '#faction_id'
      ];
      
      for (const selector of factionSelectors) {
        const dropdown = page.locator(selector).first();
        if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
          // Try to select by text first, then by value
          try {
            await dropdown.selectOption({ label: characterData.faction });
          } catch {
            await dropdown.selectOption({ value: characterData.faction });
          }
          break;
        }
      }
    }
    
    // Assign juncture if provided
    if (characterData.juncture) {
      const junctureSelectors = [
        'select[name="juncture"]',
        'select[name="juncture_id"]',
        '#juncture',
        '#juncture_id'
      ];
      
      for (const selector of junctureSelectors) {
        const dropdown = page.locator(selector).first();
        if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
          try {
            await dropdown.selectOption({ label: characterData.juncture });
          } catch {
            await dropdown.selectOption({ value: characterData.juncture });
          }
          break;
        }
      }
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `15-character-form-filled-${characterData.type}`, screenshotDir);
    }
    
    // Submit character creation
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Create Character")',
      '[data-testid="submit-character"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for character creation to complete
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `16-character-created-${characterData.type}`, screenshotDir);
    }
    
    console.log(`✅ Character "${characterData.name}" created successfully`);
    
    return {
      success: true,
      name: characterData.name,
      type: characterData.type,
      template: characterData.template,
      faction: characterData.faction,
      juncture: characterData.juncture,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Character creation failed for ${characterData.name}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-character-creation-${characterData.type}`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Creates multiple characters from a list
 * @param {Page} page - Playwright page object
 * @param {Array} charactersData - Array of character data objects
 * @param {Object} options - Optional configuration
 * @returns {Array} Results of character creation
 */
async function createMultipleCharacters(page, charactersData, options = {}) {
  console.log(`👥 Creating ${charactersData.length} characters...`);
  
  const results = [];
  
  for (let i = 0; i < charactersData.length; i++) {
    const characterData = charactersData[i];
    
    console.log(`\n[${i + 1}/${charactersData.length}] Creating: ${characterData.name}`);
    
    try {
      const result = await createCharacter(page, characterData, options);
      results.push(result);
      
      // Navigate back to characters list between creations
      if (i < charactersData.length - 1) {
        await page.goto(TEST_CONFIG.getCharactersUrl());
        await waitForPageLoad(page);
        await page.waitForTimeout(1000);
      }
      
    } catch (error) {
      console.error(`❌ Failed to create character ${characterData.name}: ${error.message}`);
      results.push({
        success: false,
        name: characterData.name,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Created ${successCount}/${charactersData.length} characters successfully`);
  
  return results;
}

/**
 * Verifies character appears in characters list
 * @param {Page} page - Playwright page object
 * @param {string} characterName - Character name to verify
 * @param {Object} options - Optional configuration
 * @returns {boolean} Whether character was found
 */
async function verifyCharacterExists(page, characterName, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`🔍 Verifying character exists: ${characterName}`);
  
  try {
    // Navigate to characters page
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await waitForPageLoad(page);
    
    // Look for character name in the page
    const characterSelectors = [
      `text="${characterName}"`,
      `[data-testid="character-${characterName.toLowerCase().replace(/\s+/g, '-')}"]`,
      `.character-name:has-text("${characterName}")`,
      `td:has-text("${characterName}")`,
      `tr:has-text("${characterName}")`
    ];
    
    let found = false;
    for (const selector of characterSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        found = true;
        break;
      }
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `17-character-verification-${characterName.replace(/\s+/g, '-')}`, screenshotDir);
    }
    
    console.log(`${found ? '✅' : '❌'} Character "${characterName}" ${found ? 'found' : 'not found'} in list`);
    
    return found;
    
  } catch (error) {
    console.error(`❌ Character verification failed for ${characterName}:`, error.message);
    return false;
  }
}

/**
 * Gets character ID from URL or page data
 * @param {Page} page - Playwright page object
 * @param {string} characterName - Character name
 * @returns {string|null} Character ID if found
 */
async function getCharacterId(page, characterName) {
  console.log(`🔍 Getting character ID for: ${characterName}`);
  
  try {
    // Check if we're on a character detail page
    const currentUrl = page.url();
    const urlMatch = currentUrl.match(/\/characters\/([^\/]+)/);
    
    if (urlMatch) {
      return urlMatch[1];
    }
    
    // Try to find character link in list
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await waitForPageLoad(page);
    
    const characterLink = page.locator(`a:has-text("${characterName}")`).first();
    const href = await characterLink.getAttribute('href').catch(() => null);
    
    if (href) {
      const linkMatch = href.match(/\/characters\/([^\/]+)/);
      return linkMatch ? linkMatch[1] : null;
    }
    
    return null;
    
  } catch (error) {
    console.error(`❌ Failed to get character ID for ${characterName}:`, error.message);
    return null;
  }
}

module.exports = {
  browseCharacterTemplates,
  createCharacter,
  createMultipleCharacters,
  verifyCharacterExists,
  getCharacterId
};