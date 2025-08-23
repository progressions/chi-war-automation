/**
 * Fight Setup Helper for Chi War End-to-End Tests
 * 
 * Provides reusable functions for fight management workflows including:
 * - Party formation
 * - Fight creation and setup
 * - Adding characters to fights
 * - Initiative management
 * - Combat validation
 */

const TEST_CONFIG = require('../test-config');
const { takeScreenshot, waitForPageLoad } = require('./user-registration-helper');

/**
 * Creates a party with specified characters
 * @param {Page} page - Playwright page object (GM session)
 * @param {Object} partyData - Party data
 * @param {string} partyData.name - Party name
 * @param {string} partyData.description - Party description
 * @param {Array} partyData.characterNames - Array of character names to add
 * @param {Object} options - Optional configuration
 * @returns {Object} Party creation result
 */
async function createParty(page, partyData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`🎭 Creating party: ${partyData.name}`);
  
  try {
    // Navigate to parties page
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/parties`);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `25-parties-page`, screenshotDir);
    }
    
    // Look for create party button
    const createSelectors = [
      'button:has-text("Create Party")',
      'button:has-text("New Party")',
      'a:has-text("Create Party")',
      'a:has-text("New Party")',
      'button:has-text("+")',
      '[data-testid="create-party"]'
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
      console.log('⚠️ No create party button found, trying direct navigation');
      await page.goto(`${TEST_CONFIG.getFrontendUrl()}/parties/new`);
    } else {
      await createButton.click();
    }
    
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `26-party-creation-form`, screenshotDir);
    }
    
    // Fill party form
    console.log('📝 Filling party form...');
    
    // Fill party name
    const nameSelectors = [
      'input[name="name"]',
      'input[name="party_name"]',
      '#name',
      '#party_name'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(partyData.name);
        break;
      }
    }
    
    // Fill party description
    const descriptionSelectors = [
      'textarea[name="description"]',
      'input[name="description"]',
      '#description'
    ];
    
    for (const selector of descriptionSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(partyData.description);
        break;
      }
    }
    
    // Submit party creation
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Create Party")'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for party creation
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `27-party-created`, screenshotDir);
    }
    
    // Now add characters to the party
    if (partyData.characterNames && partyData.characterNames.length > 0) {
      console.log(`👥 Adding ${partyData.characterNames.length} characters to party...`);
      
      const addCharactersResult = await addCharactersToParty(page, partyData.characterNames, options);
      
      if (!addCharactersResult.success) {
        throw new Error('Failed to add characters to party');
      }
    }
    
    console.log(`✅ Party "${partyData.name}" created with ${partyData.characterNames?.length || 0} characters`);
    
    return {
      success: true,
      name: partyData.name,
      description: partyData.description,
      characterCount: partyData.characterNames?.length || 0,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Party creation failed for ${partyData.name}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-party-creation`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Adds characters to an existing party
 * @param {Page} page - Playwright page object (GM session)
 * @param {Array} characterNames - Array of character names to add
 * @param {Object} options - Optional configuration
 * @returns {Object} Character addition result
 */
async function addCharactersToParty(page, characterNames, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`👥 Adding characters to party: ${characterNames.join(', ')}`);
  
  try {
    // Look for add character button or section
    const addCharacterSelectors = [
      'button:has-text("Add Character")',
      'button:has-text("Add Member")',
      'a:has-text("Add Character")',
      'a:has-text("Add Member")',
      '[data-testid="add-character"]',
      '[data-testid="add-member"]'
    ];
    
    for (const characterName of characterNames) {
      console.log(`➕ Adding character: ${characterName}`);
      
      // Look for add character button
      let addButton = null;
      for (const selector of addCharacterSelectors) {
        addButton = page.locator(selector).first();
        if (await addButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          break;
        }
        addButton = null;
      }
      
      if (addButton) {
        await addButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Look for character selection dropdown or list
      const characterSelectionSelectors = [
        `select[name="character_id"] option:has-text("${characterName}")`,
        `select[name="character"] option:has-text("${characterName}")`,
        `button:has-text("${characterName}")`,
        `div:has-text("${characterName}")[role="button"]`,
        `[data-character="${characterName}"]`
      ];
      
      let characterSelected = false;
      for (const selector of characterSelectionSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          await element.click();
          characterSelected = true;
          break;
        }
      }
      
      if (!characterSelected) {
        // Try dropdown approach
        const dropdown = page.locator('select[name*="character"]').first();
        if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
          try {
            await dropdown.selectOption({ label: characterName });
            characterSelected = true;
          } catch {
            // Try by value
            await dropdown.selectOption({ value: characterName });
            characterSelected = true;
          }
        }
      }
      
      if (!characterSelected) {
        console.log(`⚠️ Could not find character: ${characterName} in selection`);
        continue;
      }
      
      // Submit character addition if there's a submit button
      const submitAddSelectors = [
        'button[type="submit"]',
        'button:has-text("Add")',
        'button:has-text("Save")',
        'button:has-text("Confirm")'
      ];
      
      for (const selector of submitAddSelectors) {
        const button = page.locator(selector).first();
        if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
          await button.click();
          break;
        }
      }
      
      await page.waitForTimeout(1000);
      console.log(`✅ Added character: ${characterName}`);
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `28-characters-added-to-party`, screenshotDir);
    }
    
    return {
      success: true,
      charactersAdded: characterNames.length
    };
    
  } catch (error) {
    console.error('❌ Failed to add characters to party:', error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-add-characters-to-party`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Creates a fight with specified parties and NPCs
 * @param {Page} page - Playwright page object (GM session)
 * @param {Object} fightData - Fight data
 * @param {string} fightData.name - Fight name
 * @param {string} fightData.description - Fight description
 * @param {string} fightData.partyName - Party to add to fight
 * @param {Array} fightData.npcNames - Array of NPC names to add
 * @param {string} fightData.site - Site/location for fight (optional)
 * @param {string} fightData.juncture - Juncture/time period (optional)
 * @param {Object} options - Optional configuration
 * @returns {Object} Fight creation result
 */
async function createFight(page, fightData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`⚔️ Creating fight: ${fightData.name}`);
  
  try {
    // Navigate to fights page
    await page.goto(TEST_CONFIG.getFightsUrl());
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `29-fights-page`, screenshotDir);
    }
    
    // Look for create fight button
    const createSelectors = [
      'button:has-text("Create Fight")',
      'button:has-text("New Fight")',
      'a:has-text("Create Fight")',
      'a:has-text("New Fight")',
      'button:has-text("+")',
      '[data-testid="create-fight"]'
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
      console.log('⚠️ No create fight button found, trying direct navigation');
      await page.goto(`${TEST_CONFIG.getFightsUrl()}/new`);
    } else {
      await createButton.click();
    }
    
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `30-fight-creation-form`, screenshotDir);
    }
    
    // Fill fight form
    console.log('📝 Filling fight form...');
    
    // Fill fight name
    const nameSelectors = [
      'input[name="name"]',
      'input[name="fight_name"]',
      '#name',
      '#fight_name'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(fightData.name);
        break;
      }
    }
    
    // Fill fight description
    const descriptionSelectors = [
      'textarea[name="description"]',
      'input[name="description"]',
      '#description'
    ];
    
    for (const selector of descriptionSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(fightData.description);
        break;
      }
    }
    
    // Set site if provided
    if (fightData.site) {
      const siteSelectors = [
        'select[name="site"]',
        'select[name="site_id"]',
        '#site',
        '#site_id'
      ];
      
      for (const selector of siteSelectors) {
        const dropdown = page.locator(selector).first();
        if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
          try {
            await dropdown.selectOption({ label: fightData.site });
          } catch {
            await dropdown.selectOption({ value: fightData.site });
          }
          break;
        }
      }
    }
    
    // Set juncture if provided
    if (fightData.juncture) {
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
            await dropdown.selectOption({ label: fightData.juncture });
          } catch {
            await dropdown.selectOption({ value: fightData.juncture });
          }
          break;
        }
      }
    }
    
    // Submit fight creation
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create")',
      'button:has-text("Save")',
      'button:has-text("Create Fight")'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for fight creation
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `31-fight-created`, screenshotDir);
    }
    
    // Add party to fight if specified
    if (fightData.partyName) {
      console.log(`🎭 Adding party to fight: ${fightData.partyName}`);
      const addPartyResult = await addPartyToFight(page, fightData.partyName, options);
      
      if (!addPartyResult.success) {
        console.log('⚠️ Failed to add party to fight, continuing...');
      }
    }
    
    // Add NPCs to fight if specified
    if (fightData.npcNames && fightData.npcNames.length > 0) {
      console.log(`👹 Adding NPCs to fight: ${fightData.npcNames.join(', ')}`);
      const addNPCsResult = await addCharactersToFight(page, fightData.npcNames, options);
      
      if (!addNPCsResult.success) {
        console.log('⚠️ Failed to add NPCs to fight, continuing...');
      }
    }
    
    console.log(`✅ Fight "${fightData.name}" created successfully`);
    
    return {
      success: true,
      name: fightData.name,
      description: fightData.description,
      partyAdded: !!fightData.partyName,
      npcCount: fightData.npcNames?.length || 0,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Fight creation failed for ${fightData.name}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-fight-creation`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Adds a party to an existing fight
 * @param {Page} page - Playwright page object (GM session)
 * @param {string} partyName - Party name to add
 * @param {Object} options - Optional configuration
 * @returns {Object} Party addition result
 */
async function addPartyToFight(page, partyName, options = {}) {
  console.log(`🎭 Adding party to fight: ${partyName}`);
  
  try {
    // Look for add party button or dropdown
    const addPartySelectors = [
      'button:has-text("Add Party")',
      'select[name="party"]',
      'select[name="party_id"]',
      '[data-testid="add-party"]'
    ];
    
    for (const selector of addPartySelectors) {
      const element = page.locator(selector).first();
      
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        const tagName = await element.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          // Dropdown selection
          try {
            await element.selectOption({ label: partyName });
          } catch {
            await element.selectOption({ value: partyName });
          }
        } else {
          // Button click
          await element.click();
          await page.waitForTimeout(1000);
          
          // Look for party selection after clicking
          const partyOption = page.locator(`button:has-text("${partyName}"), option:has-text("${partyName}")`).first();
          if (await partyOption.isVisible({ timeout: 2000 }).catch(() => false)) {
            await partyOption.click();
          }
        }
        
        console.log(`✅ Party "${partyName}" added to fight`);
        return { success: true };
      }
    }
    
    console.log(`⚠️ Could not find party addition controls for: ${partyName}`);
    return { success: false, reason: 'Party addition controls not found' };
    
  } catch (error) {
    console.error(`❌ Failed to add party to fight: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Adds characters to an existing fight
 * @param {Page} page - Playwright page object (GM session)
 * @param {Array} characterNames - Array of character names to add
 * @param {Object} options - Optional configuration
 * @returns {Object} Character addition result
 */
async function addCharactersToFight(page, characterNames, options = {}) {
  console.log(`👥 Adding characters to fight: ${characterNames.join(', ')}`);
  
  try {
    let successCount = 0;
    
    for (const characterName of characterNames) {
      console.log(`➕ Adding character to fight: ${characterName}`);
      
      // Look for add character controls
      const addCharacterSelectors = [
        'button:has-text("Add Character")',
        'button:has-text("Add Fighter")',
        'select[name="character"]',
        'select[name="character_id"]',
        '[data-testid="add-character"]'
      ];
      
      let added = false;
      
      for (const selector of addCharacterSelectors) {
        const element = page.locator(selector).first();
        
        if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            try {
              await element.selectOption({ label: characterName });
              added = true;
            } catch {
              await element.selectOption({ value: characterName });
              added = true;
            }
          } else {
            await element.click();
            await page.waitForTimeout(1000);
            
            const characterOption = page.locator(`button:has-text("${characterName}"), option:has-text("${characterName}")`).first();
            if (await characterOption.isVisible({ timeout: 2000 }).catch(() => false)) {
              await characterOption.click();
              added = true;
            }
          }
          
          if (added) {
            successCount++;
            console.log(`✅ Added character: ${characterName}`);
            break;
          }
        }
      }
      
      if (!added) {
        console.log(`⚠️ Could not add character: ${characterName}`);
      }
    }
    
    console.log(`✅ Added ${successCount}/${characterNames.length} characters to fight`);
    
    return {
      success: successCount > 0,
      charactersAdded: successCount,
      totalRequested: characterNames.length
    };
    
  } catch (error) {
    console.error(`❌ Failed to add characters to fight: ${error.message}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Starts a fight and validates initiative system
 * @param {Page} page - Playwright page object (GM session)
 * @param {Object} options - Optional configuration
 * @returns {Object} Fight start result
 */
async function startFight(page, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log('🚀 Starting fight...');
  
  try {
    // Look for start fight button
    const startSelectors = [
      'button:has-text("Start Fight")',
      'button:has-text("Begin Fight")',
      'button:has-text("Start")',
      'button:has-text("Begin")',
      '[data-testid="start-fight"]'
    ];
    
    let startButton = null;
    for (const selector of startSelectors) {
      startButton = page.locator(selector).first();
      if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      startButton = null;
    }
    
    if (!startButton) {
      throw new Error('Could not find start fight button');
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `32-before-fight-start`, screenshotDir);
    }
    
    await startButton.click();
    
    // Wait for fight to start and initiative to be calculated
    await page.waitForTimeout(5000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `33-fight-started`, screenshotDir);
    }
    
    // Validate initiative system
    const initiativeResult = await validateInitiativeSystem(page, options);
    
    console.log('✅ Fight started successfully');
    
    return {
      success: true,
      initiativeValid: initiativeResult.success,
      fighterCount: initiativeResult.fighterCount,
      shotCounterActive: initiativeResult.shotCounterActive,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Failed to start fight: ${error.message}`);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-fight-start`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Validates the initiative system is working correctly
 * @param {Page} page - Playwright page object (GM session)
 * @param {Object} options - Optional configuration
 * @returns {Object} Initiative validation result
 */
async function validateInitiativeSystem(page, options = {}) {
  console.log('🎯 Validating initiative system...');
  
  try {
    // Look for initiative order display
    const initiativeSelectors = [
      '[data-testid="initiative-order"]',
      '.initiative-order',
      '.shot-counter',
      '.fighter-list',
      'table tbody tr',
      '.fighter-row'
    ];
    
    let fighterElements = [];
    
    for (const selector of initiativeSelectors) {
      fighterElements = await page.locator(selector).all();
      if (fighterElements.length > 0) {
        break;
      }
    }
    
    const fighterCount = fighterElements.length;
    console.log(`🎭 Found ${fighterCount} fighters in initiative order`);
    
    // Look for shot counter
    const shotCounterSelectors = [
      '[data-testid="shot-counter"]',
      '.shot-counter',
      'text=Shot',
      'text=Initiative'
    ];
    
    let shotCounterActive = false;
    for (const selector of shotCounterSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        shotCounterActive = true;
        break;
      }
    }
    
    console.log(`⏰ Shot counter active: ${shotCounterActive}`);
    
    // Look for current turn indicator
    const currentTurnSelectors = [
      '.current-turn',
      '.active-fighter',
      '[data-current="true"]',
      '.highlighted'
    ];
    
    let currentTurnVisible = false;
    for (const selector of currentTurnSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
        currentTurnVisible = true;
        break;
      }
    }
    
    console.log(`👆 Current turn indicator: ${currentTurnVisible}`);
    
    const success = fighterCount > 0 && shotCounterActive;
    
    console.log(`${success ? '✅' : '❌'} Initiative system validation: ${success ? 'PASSED' : 'FAILED'}`);
    
    return {
      success,
      fighterCount,
      shotCounterActive,
      currentTurnVisible
    };
    
  } catch (error) {
    console.error(`❌ Initiative system validation failed: ${error.message}`);
    return {
      success: false,
      fighterCount: 0,
      shotCounterActive: false,
      currentTurnVisible: false,
      error: error.message
    };
  }
}

module.exports = {
  createParty,
  addCharactersToParty,
  createFight,
  addPartyToFight,
  addCharactersToFight,
  startFight,
  validateInitiativeSystem
};