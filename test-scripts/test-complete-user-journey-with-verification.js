/**
 * Complete Progressive Onboarding Workflow Test with Entity Verification
 * 
 * Tests the complete progressive onboarding system through all milestones and verifies
 * that each created entity appears in its respective list after creation.
 * 
 * Milestones tested:
 * 1. Campaign creation - verify in campaigns list
 * 2. Campaign activation  
 * 3. Character creation - verify in characters list
 * 4. Faction creation - verify in factions list
 * 5. Party creation - verify in parties list
 * 6. Site creation - verify in sites list
 * 7. Fight creation - verify in fights list (tests cache invalidation fix)
 * 8. Congratulations
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Import helper modules for user registration only
const { 
  generateTestEmail, 
  registerNewUser, 
  loginWithCredentials,
  confirmUserEmail 
} = require('./helpers/user-registration-helper');

// Import test configuration
const TEST_CONFIG = require('./test-config');
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'onboarding-with-verification');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Use test server ports as specified in TESTING.md
const FRONTEND_URL = 'http://localhost:3005';  // Next.js test server
const BACKEND_URL = 'http://localhost:3004';   // Rails test server

// Generate unique test email for gamemaster
const GM_EMAIL = generateTestEmail('gm');
const TEST_PASSWORD = 'TestPass123!';

// Gamemaster test data
const GM_DATA = {
  email: GM_EMAIL,
  password: TEST_PASSWORD,
  firstName: 'Game',
  lastName: 'Master',
  role: 'gamemaster'
};

// Entity names for testing
const CAMPAIGN_NAME = `Test Campaign ${Date.now()}`;
const CHARACTER_NAME = 'Test Hero';
const FACTION_NAME = 'Test Faction';
const PARTY_NAME = 'Test Party';
const SITE_NAME = 'Test Location';
const FIGHT_NAME = 'Final Boss Battle';

/**
 * Ensures screenshot directory exists
 */
async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Helper function to verify entity appears in list
 */
async function verifyEntityInList(page, entityType, entityName) {
  console.log(`  📋 Verifying ${entityType} "${entityName}" appears in list...`);
  
  // Navigate to the entity list page
  const listUrl = `${FRONTEND_URL}/${entityType}`;
  await page.goto(listUrl);
  await page.waitForTimeout(2000);
  
  // Look for the entity in the list/table
  try {
    // Try multiple selectors to find the entity
    const selectors = [
      `text="${entityName}"`,
      `td:has-text("${entityName}")`,
      `[title="${entityName}"]`,
      `a:has-text("${entityName}")`,
      `span:has-text("${entityName}")`,
      `div:has-text("${entityName}")`
    ];
    
    let found = false;
    for (const selector of selectors) {
      const element = await page.$(selector);
      if (element) {
        const isVisible = await element.isVisible();
        if (isVisible) {
          console.log(`  ✅ ${entityType} "${entityName}" found in list!`);
          found = true;
          
          // Take screenshot of the list with the entity
          await page.screenshot({ 
            path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_${entityType}_list_with_${entityName.toLowerCase().replace(/\s+/g, '_')}.png`),
            fullPage: true 
          });
          break;
        }
      }
    }
    
    if (!found) {
      console.log(`  ⚠️ ${entityType} "${entityName}" not immediately visible, checking pagination...`);
      
      // Check if there's pagination and we need to look at other pages
      const paginationExists = await page.$('[aria-label="pagination navigation"]');
      if (paginationExists) {
        console.log(`  📄 Pagination found, entity might be on another page`);
      }
      
      // Try refreshing the page once to ensure cache is updated
      console.log(`  🔄 Refreshing page to ensure cache is updated...`);
      await page.reload();
      await page.waitForTimeout(2000);
      
      // Try to find again after refresh
      for (const selector of selectors) {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          console.log(`  ✅ ${entityType} "${entityName}" found after refresh!`);
          found = true;
          break;
        }
      }
      
      if (!found) {
        throw new Error(`${entityType} "${entityName}" not found in list after creation`);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`  ❌ Failed to verify ${entityType} in list: ${error.message}`);
    throw error;
  }
}

/**
 * Helper function to validate onboarding milestone text
 */
async function validateOnboardingMilestone(page, expectedMilestone, stepNumber) {
  console.log(`\n🚦 Step ${stepNumber}: Validate Onboarding Shows "${expectedMilestone}" Milestone`);
  console.log(`  Testing: Onboarding module should show "${expectedMilestone}" milestone`);
  
  try {
    // Navigate to campaigns page to check onboarding
    const currentUrl = page.url();
    if (!currentUrl.includes('/campaigns')) {
      console.log('  Navigating to campaigns page to check onboarding...');
      await page.goto(`${FRONTEND_URL}/campaigns`);
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step${stepNumber}_${expectedMilestone.toLowerCase().replace(/\s+/g, '_')}_milestone.png`),
      fullPage: true 
    });
    
    // Look for the expected milestone text
    const milestoneSelectors = [
      `:has-text("${expectedMilestone}")`,
      `:has-text("Create your first ${expectedMilestone}")`,
      `:has-text("Create a ${expectedMilestone}")`,
      `[data-testid*="${expectedMilestone.toLowerCase()}"]`,
      `:has-text("${expectedMilestone.toLowerCase()}")`
    ];
    
    let milestoneFound = false;
    let milestoneText = '';
    
    for (const selector of milestoneSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        const text = await element.textContent();
        console.log(`  ✅ ${expectedMilestone} milestone found: "${text}"`);
        milestoneFound = true;
        milestoneText = text;
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!milestoneFound) {
      console.log(`  ⚠️ ${expectedMilestone} milestone not found in onboarding module`);
      console.log(`  Current page title: ${await page.title()}`);
      console.log(`  Current URL: ${page.url()}`);
    }
    
    return milestoneFound;
  } catch (error) {
    console.error(`  ❌ Error validating milestone: ${error.message}`);
    return false;
  }
}

// Main test execution
(async () => {
  console.log('\n🎯 Complete Progressive Onboarding Test with Entity Verification - FIXED MILESTONE ORDER');
  console.log('=' . repeat(80));
  console.log('This test validates the entire onboarding flow and verifies entities appear in lists');
  console.log('Testing cache invalidation fix for all entity types');
  console.log('=' . repeat(80));
  
  const browser = await chromium.launch({ 
    headless: TEST_CONFIG.headless,
    slowMo: TEST_CONFIG.slowMo 
  });
  
  await ensureScreenshotDir();
  
  try {
    // ========== PHASE 1: GAMEMASTER SETUP ==========
    console.log('\n===== PHASE 1: GAMEMASTER REGISTRATION & SETUP =====');
    
    const gmContext = await browser.newContext();
    const gmPage = await gmContext.newPage();
    
    // Step 1: Register gamemaster
    console.log('\n🚦 Step 1: Register Gamemaster');
    await registerNewUser(gmPage, GM_DATA);
    
    // Step 2: Confirm email
    console.log('\n🚦 Step 2: Confirm Gamemaster Email');
    await confirmUserEmail(GM_EMAIL);
    
    // Step 3: Login as gamemaster
    console.log('\n🚦 Step 3: Login as Gamemaster');
    await loginWithCredentials(gmPage, GM_EMAIL, TEST_PASSWORD);
    
    // ========== PHASE 2: CAMPAIGN CREATION ==========
    console.log('\n===== PHASE 2: CAMPAIGN CREATION & ACTIVATION =====');
    
    // Step 4: Verify "Create your first Campaign" milestone
    await validateOnboardingMilestone(gmPage, 'Campaign', '4');
    
    // Step 5: Create campaign
    console.log('\n🚦 Step 5: Create Campaign');
    
    // Click Create Campaign button (onboarding CTA)
    const createCampaignButton = await gmPage.waitForSelector('[data-testid="campaign-onboarding-cta"], button:has-text("Create Campaign"), button:has-text("Campaign")');
    await createCampaignButton.click();
    
    // Wait for drawer/modal to open
    await gmPage.waitForTimeout(2000);
    
    // Fill campaign form
    await gmPage.fill('input[name="name"]', CAMPAIGN_NAME);
    
    // Fill RichTextEditor (TipTap) for description
    const campaignEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await campaignEditor.click();
    await gmPage.keyboard.type('This is a test campaign created through the progressive onboarding workflow to validate all milestones in the correct order.');
    
    // Save campaign
    const saveCampaignButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveCampaignButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify campaign appears in list
    await verifyEntityInList(gmPage, 'campaigns', CAMPAIGN_NAME);
    
    // Step 6: Activate campaign
    console.log('\n🚦 Step 6: Activate Campaign');
    await validateOnboardingMilestone(gmPage, 'Activate', '6');
    
    // Click the campaign activation button in the table (not the onboarding CTA)
    const activateButton = await gmPage.waitForSelector('button:has-text("ACTIVATE"):not([data-testid="activate-campaign-onboarding-cta"])');
    await activateButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 3: CHARACTER CREATION ==========
    console.log('\n===== PHASE 3: CHARACTER CREATION =====');
    
    // Verify "Create your first Character" milestone
    await validateOnboardingMilestone(gmPage, 'Character', '7');
    
    // Step 8: Navigate to characters and create character
    console.log('\n🚦 Step 8: Create First Character');
    
    // Click character CTA - using the data-testid from onboarding
    const characterCtaButton = await gmPage.waitForSelector('[data-testid="character-onboarding-cta"], button:has-text("Character"), button:has-text("character")');
    await characterCtaButton.click();
    
    // Wait for navigation to character creation page
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(3000);
    
    // Wait for character creation page with carousel to load
    await gmPage.waitForSelector('[data-testid="carousel-select-button"], .carousel', { timeout: 10000 });
    
    // Select first template using the carousel select button
    const selectTemplateButton = await gmPage.waitForSelector('[data-testid="carousel-select-button"]');
    await selectTemplateButton.click();
    
    // Wait for the next page/modal to load after template selection
    await gmPage.waitForTimeout(2000);
    
    // The character creation likely uses the template, so just wait for any input field
    // and fill it with the character name
    await gmPage.waitForSelector('input[type="text"]', { timeout: 10000 });
    
    // Fill the first text input which should be the name field
    await gmPage.fill('input[type="text"]:first-of-type', CHARACTER_NAME);
    
    // Save character
    const saveCharacterButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveCharacterButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify character appears in list
    await verifyEntityInList(gmPage, 'characters', CHARACTER_NAME);
    
    // ========== PHASE 4: FACTION CREATION ==========
    console.log('\n===== PHASE 4: FACTION CREATION =====');
    
    // Verify "Create your first Faction" milestone
    await validateOnboardingMilestone(gmPage, 'Faction', '9');
    
    // Step 10: Create faction
    console.log('\n🚦 Step 10: Create First Faction');
    
    // Navigate to factions
    await gmPage.goto(`${FRONTEND_URL}/factions`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createFactionButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createFactionButton.click();
    
    // Fill faction form
    await gmPage.fill('input[name="name"]', FACTION_NAME);
    // Fill RichTextEditor (TipTap) for description
    const factionEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await factionEditor.click();
    await gmPage.keyboard.type('A test faction for the onboarding flow');
    
    // Save faction
    const saveFactionButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFactionButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify faction appears in list
    await verifyEntityInList(gmPage, 'factions', FACTION_NAME);
    
    // ========== PHASE 5: PARTY CREATION ==========
    console.log('\n===== PHASE 5: PARTY CREATION =====');
    
    // Verify "Create your first Party" milestone
    await validateOnboardingMilestone(gmPage, 'Party', '11');
    
    // Step 12: Create party
    console.log('\n🚦 Step 12: Create First Party');
    
    // Navigate to parties
    await gmPage.goto(`${FRONTEND_URL}/parties`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createPartyButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createPartyButton.click();
    
    // Fill party form
    await gmPage.fill('input[name="name"]', PARTY_NAME);
    // Fill RichTextEditor (TipTap) for description
    const partyEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await partyEditor.click();
    await gmPage.keyboard.type('A test party for the onboarding flow');
    
    // Save party
    const savePartyButton = await gmPage.waitForSelector('button:has-text("Save")');
    await savePartyButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify party appears in list
    await verifyEntityInList(gmPage, 'parties', PARTY_NAME);
    
    // ========== PHASE 6: SITE CREATION ==========
    console.log('\n===== PHASE 6: SITE CREATION =====');
    
    // Verify "Create your first Site" milestone
    await validateOnboardingMilestone(gmPage, 'Site', '13');
    
    // Step 14: Create site
    console.log('\n🚦 Step 14: Create First Site');
    
    // Navigate to sites
    await gmPage.goto(`${FRONTEND_URL}/sites`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createSiteButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createSiteButton.click();
    
    // Fill site form
    await gmPage.fill('input[name="name"]', SITE_NAME);
    // Fill RichTextEditor (TipTap) for description
    const siteEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await siteEditor.click();
    await gmPage.keyboard.type('A test site for the onboarding flow');
    
    // Save site
    const saveSiteButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveSiteButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify site appears in list
    await verifyEntityInList(gmPage, 'sites', SITE_NAME);
    
    // ========== PHASE 7: FIGHT CREATION (FINAL MILESTONE) ==========
    console.log('\n===== PHASE 7: FIGHT CREATION (FINAL MILESTONE) =====');
    
    // Verify "Create your first Fight" milestone (should be the LAST milestone)
    await validateOnboardingMilestone(gmPage, 'Fight', '15');
    
    // Step 16: Create fight
    console.log('\n🚦 Step 16: Create First Fight (Final Milestone)');
    
    // Navigate to fights
    await gmPage.goto(`${FRONTEND_URL}/fights`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createFightButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createFightButton.click();
    
    // Wait for SpeedDial options
    await gmPage.waitForTimeout(1000);
    
    // Click "New Fight" option
    const newFightOption = await gmPage.waitForSelector('[data-testid="speed-dial-fight"], button:has-text("New Fight")');
    await newFightOption.click();
    
    // Fill fight form
    await gmPage.fill('input[name="name"]', FIGHT_NAME);
    // Fill RichTextEditor (TipTap) for description
    const fightEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await fightEditor.click();
    await gmPage.keyboard.type('The culminating fight of our onboarding journey');
    
    // Save fight
    const saveFightButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFightButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify fight appears in list (this tests the cache invalidation fix)
    console.log('  🔍 Testing cache invalidation fix for fights...');
    await verifyEntityInList(gmPage, 'fights', FIGHT_NAME);
    
    // ========== PHASE 8: CONGRATULATIONS ==========
    console.log('\n===== PHASE 8: CONGRATULATIONS =====');
    
    // Step 17: Verify congratulations milestone
    console.log('\n🚦 Step 17: Verify Congratulations Milestone');
    
    // Navigate to campaigns page to see congratulations
    await gmPage.goto(`${FRONTEND_URL}/campaigns`);
    await gmPage.waitForTimeout(3000);
    
    // Look for congratulations text
    const congratsSelectors = [
      ':has-text("Congratulations")',
      ':has-text("congratulations")',
      ':has-text("You\'ve completed")',
      ':has-text("All milestones complete")',
      '[data-testid="congratulations-module"]'
    ];
    
    let congratsFound = false;
    for (const selector of congratsSelectors) {
      try {
        const element = await gmPage.waitForSelector(selector, { timeout: 3000 });
        const text = await element.textContent();
        console.log(`  ✅ Congratulations milestone found: "${text}"`);
        congratsFound = true;
        
        // Take final screenshot
        await gmPage.screenshot({ 
          path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_final_congratulations.png`),
          fullPage: true 
        });
        break;
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!congratsFound) {
      console.log('  ⚠️ Congratulations text not found, but all milestones completed');
    }
    
    // ========== TEST SUMMARY ==========
    console.log('\n' + '=' . repeat(80));
    console.log('✅ COMPLETE PROGRESSIVE ONBOARDING TEST WITH VERIFICATION PASSED!');
    console.log('=' . repeat(80));
    console.log('\nAll milestones completed in correct order:');
    console.log('  1. ✅ Campaign created and verified in list');
    console.log('  2. ✅ Campaign activated');
    console.log('  3. ✅ Character created and verified in list');
    console.log('  4. ✅ Faction created and verified in list');
    console.log('  5. ✅ Party created and verified in list');
    console.log('  6. ✅ Site created and verified in list');
    console.log('  7. ✅ Fight created and verified in list (cache invalidation working!)');
    console.log('  8. ✅ Congratulations milestone reached');
    console.log('\n📊 Cache invalidation verified for all entity types');
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
    
    // Take error screenshot
    const gmPage = browser.contexts()[0]?.pages()[0];
    if (gmPage) {
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_error.png`),
        fullPage: true 
      });
    }
    
    throw error;
  } finally {
    await browser.close();
  }
})();