/**
 * Campaign Setup Helper for Chi War End-to-End Tests
 * 
 * Provides reusable functions for campaign management workflows including:
 * - Campaign creation with seeding
 * - World building (factions, sites, junctures)
 * - Campaign configuration and settings
 */

const TEST_CONFIG = require('../test-config');
const { takeScreenshot, waitForPageLoad } = require('./user-registration-helper');

/**
 * Creates a new campaign with proper seeding
 * @param {Page} page - Playwright page object
 * @param {Object} campaignData - Campaign data
 * @param {string} campaignData.name - Campaign name
 * @param {string} campaignData.description - Campaign description
 * @param {Object} options - Optional configuration
 * @returns {Object} Campaign creation result
 */
async function createCampaign(page, campaignData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`📋 Creating campaign: ${campaignData.name}`);
  
  try {
    // Navigate to campaigns page
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `07-campaigns-page`, screenshotDir);
    }
    
    // Look for "Create Campaign" or "New Campaign" button
    const createCampaignSelectors = [
      'button:has-text("Create Campaign")',
      'button:has-text("New Campaign")',
      'a:has-text("Create Campaign")',
      'a:has-text("New Campaign")', 
      'button:has-text("+")',
      'button:has-text("Add")',
      '[data-testid="create-campaign"]',
      '[data-testid="new-campaign"]'
    ];
    
    let createButton = null;
    for (const selector of createCampaignSelectors) {
      createButton = page.locator(selector).first();
      if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      createButton = null;
    }
    
    if (!createButton) {
      console.log('⚠️ No create campaign button found, trying direct navigation');
      await page.goto(`${TEST_CONFIG.getCampaignsUrl()}/new`);
    } else {
      await createButton.click();
    }
    
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `08-campaign-creation-form`, screenshotDir);
    }
    
    // Fill campaign creation form
    console.log('📝 Filling campaign form...');
    
    // Fill campaign name
    const nameSelectors = [
      'input[name="name"]',
      'input[name="title"]',
      'input[name="campaign_name"]',
      '#name',
      '#title',
      '#campaign_name',
      'input[placeholder*="name" i]'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(campaignData.name);
        break;
      }
    }
    
    // Fill campaign description
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
        await field.fill(campaignData.description);
        break;
      }
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `09-campaign-form-filled`, screenshotDir);
    }
    
    // Submit campaign creation
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Create Campaign")',
      '[data-testid="submit-campaign"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for campaign creation to complete
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `10-campaign-created`, screenshotDir);
    }
    
    console.log(`✅ Campaign "${campaignData.name}" created successfully`);
    
    return {
      success: true,
      name: campaignData.name,
      description: campaignData.description,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Campaign creation failed for ${campaignData.name}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-campaign-creation`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Creates world building entities (factions, sites, junctures)
 * @param {Page} page - Playwright page object
 * @param {Object} worldData - World building data
 * @param {Array} worldData.factions - Faction data
 * @param {Array} worldData.sites - Site data  
 * @param {Array} worldData.junctures - Juncture data
 * @param {Object} options - Optional configuration
 * @returns {Object} World building result
 */
async function setupWorldBuilding(page, worldData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log('🌍 Setting up world building...');
  
  const results = {
    factions: [],
    sites: [],
    junctures: []
  };
  
  try {
    // Create Factions
    if (worldData.factions && worldData.factions.length > 0) {
      console.log('⚔️ Creating factions...');
      
      for (const faction of worldData.factions) {
        const factionResult = await createWorldEntity(page, 'factions', faction, { takeScreenshots, screenshotDir });
        results.factions.push(factionResult);
      }
    }
    
    // Create Sites
    if (worldData.sites && worldData.sites.length > 0) {
      console.log('🏛️ Creating sites...');
      
      for (const site of worldData.sites) {
        const siteResult = await createWorldEntity(page, 'sites', site, { takeScreenshots, screenshotDir });
        results.sites.push(siteResult);
      }
    }
    
    // Create Junctures
    if (worldData.junctures && worldData.junctures.length > 0) {
      console.log('⏰ Creating junctures...');
      
      for (const juncture of worldData.junctures) {
        const junctureResult = await createWorldEntity(page, 'junctures', juncture, { takeScreenshots, screenshotDir });
        results.junctures.push(junctureResult);
      }
    }
    
    console.log('✅ World building setup completed');
    
    return {
      success: true,
      ...results
    };
    
  } catch (error) {
    console.error('❌ World building setup failed:', error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-world-building`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Creates a world building entity (faction, site, or juncture)
 * @param {Page} page - Playwright page object
 * @param {string} entityType - Type of entity (factions, sites, junctures)
 * @param {Object} entityData - Entity data
 * @param {Object} options - Optional configuration
 * @returns {Object} Entity creation result
 */
async function createWorldEntity(page, entityType, entityData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`🏗️ Creating ${entityType.slice(0, -1)}: ${entityData.name}`);
  
  try {
    // Navigate to entity page
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/${entityType}`);
    await waitForPageLoad(page);
    
    // Look for create button
    const createSelectors = [
      `button:has-text("Create ${entityType.slice(0, -1)}")`,
      `button:has-text("New ${entityType.slice(0, -1)}")`,
      `a:has-text("Create ${entityType.slice(0, -1)}")`,
      `a:has-text("New ${entityType.slice(0, -1)}")`,
      'button:has-text("+")',
      'button:has-text("Add")',
      `[data-testid="create-${entityType.slice(0, -1)}"]`
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
      console.log(`⚠️ No create button found, trying direct navigation to /${entityType}/new`);
      await page.goto(`${TEST_CONFIG.getFrontendUrl()}/${entityType}/new`);
    } else {
      await createButton.click();
    }
    
    await waitForPageLoad(page);
    
    // Fill entity form
    console.log(`📝 Filling ${entityType.slice(0, -1)} form...`);
    
    // Fill name
    const nameSelectors = [
      'input[name="name"]',
      'input[name="title"]',
      '#name',
      '#title'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(entityData.name);
        break;
      }
    }
    
    // Fill description if provided
    if (entityData.description) {
      const descSelectors = [
        'textarea[name="description"]',
        'input[name="description"]',
        '#description'
      ];
      
      for (const selector of descSelectors) {
        const field = page.locator(selector).first();
        if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
          await field.clear();
          await field.fill(entityData.description);
          break;
        }
      }
    }
    
    // Submit form
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Save")',
      `button:has-text("Create ${entityType.slice(0, -1)}")`
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for creation to complete
    await page.waitForTimeout(2000);
    await waitForPageLoad(page);
    
    console.log(`✅ ${entityType.slice(0, -1)} "${entityData.name}" created`);
    
    return {
      success: true,
      type: entityType.slice(0, -1),
      name: entityData.name,
      description: entityData.description
    };
    
  } catch (error) {
    console.error(`❌ ${entityType.slice(0, -1)} creation failed for ${entityData.name}:`, error.message);
    throw error;
  }
}

/**
 * Verifies campaign seeding (default schticks, weapons, templates)
 * @param {Page} page - Playwright page object
 * @param {Object} options - Optional configuration
 * @returns {Object} Seeding verification result
 */
async function verifyCampaignSeeding(page, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log('🌱 Verifying campaign seeding...');
  
  const seedingResults = {
    schticks: false,
    weapons: false,
    templates: false
  };
  
  try {
    // Check schticks
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/schticks`);
    await waitForPageLoad(page);
    
    const schtickElements = await page.locator('[data-testid="schtick-item"], .schtick-item, tr').count();
    seedingResults.schticks = schtickElements > 0;
    console.log(`📚 Found ${schtickElements} schticks`);
    
    // Check weapons  
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/weapons`);
    await waitForPageLoad(page);
    
    const weaponElements = await page.locator('[data-testid="weapon-item"], .weapon-item, tr').count();
    seedingResults.weapons = weaponElements > 0;
    console.log(`⚔️ Found ${weaponElements} weapons`);
    
    // Check character templates
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/characters/new`);
    await waitForPageLoad(page);
    
    const templateElements = await page.locator('[data-testid="template-item"], .template-item, .template').count();
    seedingResults.templates = templateElements > 0;
    console.log(`👤 Found ${templateElements} character templates`);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `11-seeding-verification`, screenshotDir);
    }
    
    const allSeeded = Object.values(seedingResults).every(result => result === true);
    
    console.log(`✅ Campaign seeding verification: ${allSeeded ? 'PASSED' : 'PARTIAL'}`);
    
    return {
      success: allSeeded,
      ...seedingResults
    };
    
  } catch (error) {
    console.error('❌ Campaign seeding verification failed:', error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-seeding-verification`, screenshotDir);
    }
    
    throw error;
  }
}

module.exports = {
  createCampaign,
  setupWorldBuilding,
  createWorldEntity,
  verifyCampaignSeeding
};