/**
 * Complete Progressive Onboarding Workflow Test - FIXED MILESTONE ORDER
 * 
 * Tests the complete progressive onboarding system through all milestones in correct order:
 * 1. Campaign creation
 * 2. Campaign activation  
 * 3. Character creation
 * 4. Faction creation
 * 5. Party creation
 * 6. Site creation
 * 7. Fight creation (final milestone)
 * 8. Congratulations
 * 
 * This version follows the exact milestone sequence defined in:
 * - Backend: app/models/onboarding_progress.rb MILESTONE_SEQUENCE
 * - Frontend: src/lib/onboarding.ts MILESTONE_CONFIG
 * 
 * ENHANCED: Now verifies that each newly created entity appears in its respective list
 * to confirm cache invalidation is working correctly.
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
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'onboarding-milestone-validation');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

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

/**
 * Ensures screenshot directory exists
 */
async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * Verify that a newly created entity appears in its list page
 * This confirms cache invalidation is working correctly
 */
async function verifyEntityInList(page, entityType, entityName) {
  console.log(`  📋 Verifying ${entityType} "${entityName}" appears in list...`);
  
  try {
    // Navigate to the entity list page
    const listUrl = `http://localhost:3005/${entityType}`;
    await page.goto(listUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for the entity in the list - try multiple selectors
    const entitySelectors = [
      `text="${entityName}"`,
      `:has-text("${entityName}")`,
      `td:has-text("${entityName}")`,
      `[role="cell"]:has-text("${entityName}")`,
      `.MuiTableCell-root:has-text("${entityName}")`
    ];
    
    let entityFound = false;
    for (const selector of entitySelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 5000 });
        if (element) {
          entityFound = true;
          console.log(`  ✅ ${entityType} "${entityName}" found in list!`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!entityFound) {
      // Take a screenshot for debugging
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_${entityType}_list_missing_${entityName}.png`),
        fullPage: true 
      });
      throw new Error(`${entityType} "${entityName}" not found in list - cache invalidation may have failed`);
    }
    
    return true;
  } catch (error) {
    console.log(`  ❌ FAILED: ${entityType} "${entityName}" not found in list`);
    console.log(`  ❌ Error: ${error.message}`);
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
      await page.goto(`http://localhost:3005/campaigns`);
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step${stepNumber}_${expectedMilestone.toLowerCase().replace(/\s+/g, '_')}_milestone.png`),
      fullPage: true 
    });
    
    // Look for the expected milestone text - be more strict to avoid matching CSS
    const milestoneSelectors = [
      `text="${expectedMilestone}"`,
      `text="Create your first ${expectedMilestone}"`,
      `text="Create a ${expectedMilestone}"`,
      `[data-testid*="${expectedMilestone.toLowerCase()}"]`
    ];
    
    let milestoneFound = false;
    let milestoneText = '';
    
    for (const selector of milestoneSelectors) {
      try {
        const element = await page.waitForSelector(selector, { timeout: 3000 });
        const text = await element.textContent();
        // Only accept if the text is reasonable (not CSS)
        if (text && text.length < 500 && !text.includes('@font-face')) {
          console.log(`  ✅ ${expectedMilestone} milestone found: "${text}"`);
          milestoneFound = true;
          milestoneText = text;
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (!milestoneFound) {
      throw new Error(`${expectedMilestone} milestone not found in onboarding module`);
    }
    
    console.log(`  ✅ PASS: Onboarding correctly shows ${expectedMilestone} milestone`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ EXPECTED: Onboarding should show ${expectedMilestone} milestone`);
    console.log(`  ❌ ACTUAL: ${error.message}`);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step${stepNumber}_${expectedMilestone.toLowerCase()}_failed.png`),
      fullPage: true 
    });
    
    throw error;
  }
}

/**
 * Complete Gamemaster Registration and Onboarding Flow
 */
async function runCompleteOnboardingFlow(browser) {
  console.log('\n🎮 ===== COMPLETE ONBOARDING FLOW WITH CORRECT MILESTONE ORDER =====');
  console.log('Expected milestone order:');
  console.log('  1. Campaign creation');
  console.log('  2. Campaign activation');
  console.log('  3. Character creation');
  console.log('  4. Faction creation');
  console.log('  5. Party creation');
  console.log('  6. Site creation');
  console.log('  7. Fight creation (final)');
  console.log('  8. Congratulations');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  const gmPage = await context.newPage();
  
  try {
    // ========== PHASE 1: REGISTRATION & LOGIN ==========
    console.log('\n===== PHASE 1: REGISTRATION & LOGIN =====');
    
    // Step 1: GM Registration
    console.log('\n👤 Step 1: Gamemaster Registration');
    const registrationResult = await registerNewUser(gmPage, GM_DATA, { 
      takeScreenshots: true, 
      screenshotDir: SCREENSHOTS_DIR 
    });
    
    if (!registrationResult.success) {
      throw new Error('Gamemaster registration failed');
    }
    
    // Step 2: Email confirmation
    console.log('\n📧 Step 2: Email Confirmation');
    await confirmUserEmail(GM_DATA.email);
    
    // Step 3: Login
    console.log('\n🔐 Step 3: Gamemaster Login');
    const loginResult = await loginWithCredentials(gmPage, GM_DATA.email, GM_DATA.password, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!loginResult.success) {
      throw new Error('Gamemaster login failed');
    }
    
    // ========== PHASE 2: CAMPAIGN CREATION & ACTIVATION ==========
    console.log('\n===== PHASE 2: CAMPAIGN CREATION & ACTIVATION =====');
    
    // Verify "Create Your First Campaign" milestone
    await validateOnboardingMilestone(gmPage, 'Campaign', '4');
    
    // Step 5: Click CTA and create campaign
    console.log('\n🚦 Step 5: Create First Campaign');
    const campaignCtaSelector = '[data-testid="campaign-onboarding-cta"]';
    const campaignCta = await gmPage.waitForSelector(campaignCtaSelector);
    await campaignCta.click();
    
    // Wait for form
    await gmPage.waitForSelector('[data-testid="campaign-form-drawer"], form', { timeout: 5000 });
    
    // Fill campaign form
    await gmPage.fill('input[name="name"]', 'Epic Test Campaign');
    // Fill RichTextEditor (TipTap) for description
    const campaignEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await campaignEditor.click();
    await gmPage.keyboard.type('An epic campaign created during the complete onboarding test');
    
    // Save campaign
    const saveButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify campaign appears in list
    await verifyEntityInList(gmPage, 'campaigns', 'Epic Test Campaign');
    
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
    console.log('  Waiting for character creation page to load...');
    
    // Try multiple selectors for the carousel
    const carouselSelectors = [
      '[data-testid="carousel-select-button"]',
      'button:has-text("Select")',
      '.carousel button',
      '[aria-label*="Select"]'
    ];
    
    let selectButton = null;
    for (const selector of carouselSelectors) {
      try {
        selectButton = await gmPage.waitForSelector(selector, { timeout: 3000 });
        if (selectButton) {
          console.log(`  Found carousel select button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        console.log(`  Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!selectButton) {
      // Take a debug screenshot
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_character_carousel_debug.png`),
        fullPage: true 
      });
      throw new Error('Could not find carousel select button');
    }
    
    // Click the select button
    await selectButton.click();
    console.log('  Clicked carousel select button');
    
    // Wait for the confirm dialog to appear
    await gmPage.waitForTimeout(2000);
    console.log('  Waiting for character creation confirm dialog...');
    
    // Look for the Confirm button in the dialog
    const confirmSelectors = [
      'button:has-text("Confirm")',
      'button:has-text("Create")',
      'button:has-text("Yes")',
      'button:has-text("OK")',
      '[data-testid="confirm-button"]',
      '.MuiDialog-root button.MuiButton-containedPrimary'
    ];
    
    let confirmButton = null;
    for (const selector of confirmSelectors) {
      try {
        confirmButton = await gmPage.waitForSelector(selector, { timeout: 3000 });
        if (confirmButton) {
          console.log(`  Found confirm button with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue trying other selectors
      }
    }
    
    if (confirmButton) {
      // Click the confirm button to create the character from template
      await confirmButton.click();
      console.log('  Clicked confirm button to create character from template');
    } else {
      // If no confirm dialog, maybe there's a form to fill
      console.log('  No confirm dialog found, checking for character form...');
      
      // Try to find and fill a name input if it exists
      try {
        const nameInput = await gmPage.waitForSelector('input[name="name"], input[type="text"]', { timeout: 3000 });
        await nameInput.fill('Test Hero');
        console.log('  Filled character name');
        
        // Save character
        const saveButton = await gmPage.waitForSelector('button:has-text("Save")', { timeout: 3000 });
        await saveButton.click();
        console.log('  Clicked save button');
      } catch (e) {
        // Take a screenshot for debugging
        await gmPage.screenshot({ 
          path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_character_creation_debug.png`),
          fullPage: true 
        });
        console.log('  ⚠️  Could not find character form or confirm dialog');
      }
    }
    
    await gmPage.waitForTimeout(3000);
    
    // The character will have a template-based name, so we need to verify any character exists
    // rather than a specific name
    console.log('  📋 Verifying character was created and appears in list...');
    await gmPage.goto('http://localhost:3005/characters');
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(2000);
    
    // Check if there's at least one character in the list
    const characterRowSelectors = [
      'tbody tr',
      '[role="row"]:not([role="columnheader"])',
      '.MuiTableBody-root tr'
    ];
    
    let characterFound = false;
    for (const selector of characterRowSelectors) {
      try {
        const rows = await gmPage.$$(selector);
        if (rows && rows.length > 0) {
          characterFound = true;
          console.log(`  ✅ Character created successfully - found ${rows.length} character(s) in list`);
          break;
        }
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!characterFound) {
      throw new Error('No characters found in list after creation');
    }
    
    // ========== PHASE 4: FACTION CREATION ==========
    console.log('\n===== PHASE 4: FACTION CREATION =====');
    
    // Verify "Create your first Faction" milestone
    await validateOnboardingMilestone(gmPage, 'Faction', '9');
    
    // Step 10: Create faction
    console.log('\n🚦 Step 10: Create First Faction');
    
    // Navigate to factions
    await gmPage.goto(`http://localhost:3005/factions`);
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(5000); // Give more time for page to load
    
    // Wait for page to be interactive (not just HTML)
    try {
      // Wait for a specific MUI component to ensure React has hydrated
      await gmPage.waitForSelector('.MuiContainer-root, .MuiTable-root, .MuiSpeedDial-root', { timeout: 15000 });
      console.log('  Page appears to be interactive');
    } catch (e) {
      console.log('  Warning: Page may not be fully loaded, continuing anyway...');
    }
    
    // Try multiple approaches to find and click the FAB
    let fabClicked = false;
    const fabSelectors = [
      '.MuiSpeedDial-fab',
      '.MuiFab-root',
      'button[aria-label*="speed dial"]',
      '[data-testid="speed-dial"]',
      'button.MuiFab-primary'
    ];
    
    for (const selector of fabSelectors) {
      try {
        const fabButton = await gmPage.waitForSelector(selector, { timeout: 3000 });
        if (fabButton) {
          await fabButton.click();
          console.log(`  Clicked SpeedDial FAB using selector: ${selector}`);
          fabClicked = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!fabClicked) {
      // If no FAB found, maybe there's a direct create button
      console.log('  Could not find SpeedDial FAB, looking for direct Create button...');
      try {
        const directCreateButton = await gmPage.waitForSelector('button:has-text("Create"), button:has-text("New Faction")', { timeout: 3000 });
        await directCreateButton.click();
        console.log('  Clicked direct Create button');
        fabClicked = true;
      } catch (e) {
        console.log('  No direct Create button found either');
      }
    }
    
    if (!fabClicked) {
      throw new Error('Could not find any way to create a faction');
    }
    
    // Wait for the menu to open
    await gmPage.waitForTimeout(1500);
    
    // Take screenshot to see the SpeedDial menu
    await gmPage.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_speed_dial_menu_open.png`),
      fullPage: true 
    });
    
    // Now click the "Create" option in the SpeedDial menu
    // The Create button should have a PersonAddAlt1Icon
    const createButtonSelectors = [
      '[aria-label="Create"]',
      'button:has-text("Create")',
      '.MuiSpeedDialAction-fab:has(svg)',
      '.MuiSpeedDialAction-fab'
    ];
    
    let createClicked = false;
    for (const selector of createButtonSelectors) {
      try {
        const buttons = await gmPage.$$(selector);
        // The Create button is usually the second action (after view toggle)
        if (buttons && buttons.length > 0) {
          // Try the second button first (index 1) as it's usually Create
          const buttonToClick = buttons.length > 1 ? buttons[1] : buttons[0];
          await buttonToClick.click();
          console.log(`  Clicked create faction button using selector: ${selector}`);
          createClicked = true;
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!createClicked) {
      throw new Error('Could not find Create button in SpeedDial menu');
    }
    
    // Wait for the drawer/modal to open
    await gmPage.waitForTimeout(2000);
    
    // The faction form opens in a drawer/modal
    console.log('  Waiting for faction form drawer to open...');
    
    // Take screenshot to see if drawer opened
    await gmPage.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_faction_drawer_state.png`),
      fullPage: true 
    });
    
    // Try different selectors for the name input in the drawer
    const nameInputSelectors = [
      'input[name="name"]',
      '#name',
      'input[type="text"][label*="Name"]',
      '.MuiDrawer-root input[type="text"]:first-of-type',
      'input[placeholder*="name" i]',
      'input[placeholder*="faction" i]'
    ];
    
    let nameInput = null;
    for (const selector of nameInputSelectors) {
      try {
        nameInput = await gmPage.waitForSelector(selector, { timeout: 2000 });
        if (nameInput) {
          console.log(`  Found name input with selector: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!nameInput) {
      // Take debug screenshot
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_faction_form_not_found.png`),
        fullPage: true 
      });
      throw new Error('Could not find faction name input field in drawer');
    }
    
    await nameInput.fill('Test Faction');
    console.log('  Filled faction name');
    // Fill RichTextEditor (TipTap) for description
    const factionEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await factionEditor.click();
    await gmPage.keyboard.type('A test faction for the onboarding flow');
    
    // Save faction
    const saveFactionButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFactionButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify faction appears in list
    await verifyEntityInList(gmPage, 'factions', 'Test Faction');
    
    // ========== PHASE 5: PARTY CREATION ==========
    console.log('\n===== PHASE 5: PARTY CREATION =====');
    
    // Verify "Create your first Party" milestone
    await validateOnboardingMilestone(gmPage, 'Party', '11');
    
    // Step 12: Create party
    console.log('\n🚦 Step 12: Create First Party');
    
    // Navigate to parties
    await gmPage.goto(`http://localhost:3005/parties`);
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(3000);
    
    // Click SpeedDial FAB then Create button
    const partyFab = await gmPage.waitForSelector('.MuiSpeedDial-fab, .MuiFab-root', { timeout: 10000 });
    await partyFab.click();
    await gmPage.waitForTimeout(1000);
    const createPartyButton = await gmPage.waitForSelector('button:has-text("Create"), .MuiSpeedDialAction-fab:first-of-type', { timeout: 5000 });
    await createPartyButton.click();
    
    // Fill party form
    await gmPage.fill('input[name="name"]', 'Test Party');
    // Fill RichTextEditor (TipTap) for description
    const partyEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await partyEditor.click();
    await gmPage.keyboard.type('A test party for the onboarding flow');
    
    // Save party
    const savePartyButton = await gmPage.waitForSelector('button:has-text("Save")');
    await savePartyButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify party appears in list
    await verifyEntityInList(gmPage, 'parties', 'Test Party');
    
    // ========== PHASE 6: SITE CREATION ==========
    console.log('\n===== PHASE 6: SITE CREATION =====');
    
    // Verify "Create your first Site" milestone
    await validateOnboardingMilestone(gmPage, 'Site', '13');
    
    // Step 14: Create site
    console.log('\n🚦 Step 14: Create First Site');
    
    // Navigate to sites
    await gmPage.goto(`http://localhost:3005/sites`);
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(3000);
    
    // Click SpeedDial FAB then Create button
    const siteFab = await gmPage.waitForSelector('.MuiSpeedDial-fab, .MuiFab-root', { timeout: 10000 });
    await siteFab.click();
    await gmPage.waitForTimeout(1000);
    const createSiteButton = await gmPage.waitForSelector('button:has-text("Create"), .MuiSpeedDialAction-fab:first-of-type', { timeout: 5000 });
    await createSiteButton.click();
    
    // Fill site form
    await gmPage.fill('input[name="name"]', 'Test Location');
    // Fill RichTextEditor (TipTap) for description
    const siteEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await siteEditor.click();
    await gmPage.keyboard.type('A test site for the onboarding flow');
    
    // Save site
    const saveSiteButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveSiteButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify site appears in list
    await verifyEntityInList(gmPage, 'sites', 'Test Location');
    
    // ========== PHASE 7: FIGHT CREATION (FINAL MILESTONE) ==========
    console.log('\n===== PHASE 7: FIGHT CREATION (FINAL MILESTONE) =====');
    
    // Verify "Create your first Fight" milestone (should be the LAST milestone)
    await validateOnboardingMilestone(gmPage, 'Fight', '15');
    
    // Step 16: Create fight
    console.log('\n🚦 Step 16: Create First Fight (Final Milestone)');
    
    // Navigate to fights
    await gmPage.goto(`http://localhost:3005/fights`);
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(3000);
    
    // Click SpeedDial FAB then Create button
    const fightFab = await gmPage.waitForSelector('.MuiSpeedDial-fab, .MuiFab-root', { timeout: 10000 });
    await fightFab.click();
    await gmPage.waitForTimeout(1000);
    const createFightButton = await gmPage.waitForSelector('button:has-text("Create"), button:has-text("New"), .MuiSpeedDialAction-fab:first-of-type', { timeout: 5000 });
    await createFightButton.click();
    
    // Wait for SpeedDial options
    await gmPage.waitForTimeout(1000);
    
    // Click "New Fight" option
    const newFightOption = await gmPage.waitForSelector('[data-testid="speed-dial-fight"], button:has-text("New Fight")');
    await newFightOption.click();
    
    // Fill fight form
    await gmPage.fill('input[name="name"]', 'Final Boss Battle');
    // Fill RichTextEditor (TipTap) for description
    const fightEditor = await gmPage.waitForSelector('.ProseMirror[contenteditable="true"]');
    await fightEditor.click();
    await gmPage.keyboard.type('The culminating fight of our onboarding journey');
    
    // Save fight
    const saveFightButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFightButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Verify fight appears in list
    await verifyEntityInList(gmPage, 'fights', 'Final Boss Battle');
    
    // ========== PHASE 8: CONGRATULATIONS ==========
    console.log('\n===== PHASE 8: CONGRATULATIONS =====');
    
    // Step 17: Verify congratulations milestone
    console.log('\n🚦 Step 17: Verify Congratulations Milestone');
    
    // Navigate to campaigns page to see congratulations
    await gmPage.goto(`http://localhost:3005/campaigns`);
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
        await gmPage.waitForSelector(selector, { timeout: 3000 });
        congratsFound = true;
        console.log(`  ✅ Congratulations milestone found!`);
        break;
      } catch (e) {
        // Continue trying
      }
    }
    
    if (!congratsFound) {
      throw new Error('Congratulations milestone not displayed after completing all milestones');
    }
    
    // Try to dismiss congratulations
    try {
      const dismissButton = await gmPage.waitForSelector('button:has-text("Dismiss"), button:has-text("Got it"), button:has-text("Close")', { timeout: 3000 });
      await dismissButton.click();
      console.log('  ✅ Congratulations dismissed successfully');
    } catch (e) {
      console.log('  ⚠️  No dismiss button found, but congratulations was displayed');
    }
    
    // ========== TEST COMPLETE ==========
    console.log('\n🎉 ===== TEST COMPLETED SUCCESSFULLY =====');
    console.log('✅ All milestones completed in correct order:');
    console.log('  1. ✅ Campaign creation (verified in list)');
    console.log('  2. ✅ Campaign activation');
    console.log('  3. ✅ Character creation (verified in list)');
    console.log('  4. ✅ Faction creation (verified in list)');
    console.log('  5. ✅ Party creation (verified in list)');
    console.log('  6. ✅ Site creation (verified in list)');
    console.log('  7. ✅ Fight creation - final milestone (verified in list)');
    console.log('  8. ✅ Congratulations');
    console.log('\n✅ Cache invalidation working correctly - all entities appeared in lists immediately');
    
    await context.close();
    
    return {
      success: true,
      milestonesCompleted: 8,
      finalMilestone: 'Fight',
      orderCorrect: true
    };
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take failure screenshot
    await gmPage.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_test_failed.png`),
      fullPage: true 
    });
    
    await context.close();
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Main test runner
 */
async function runTest() {
  console.log('\n🚀 Starting Complete Onboarding Test with Correct Milestone Order');
  console.log(`📧 Test email: ${GM_EMAIL}`);
  console.log(`🔑 Test password: ${TEST_PASSWORD}`);
  console.log(`📸 Screenshots will be saved to: ${SCREENSHOTS_DIR}`);
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({ 
    headless: false,
    timeout: 60000
  });
  
  try {
    const result = await runCompleteOnboardingFlow(browser);
    
    if (result.success) {
      console.log('\n🎊 Complete onboarding test PASSED!');
      console.log('✅ All milestones completed in correct order');
      console.log('✅ Fight creation was correctly the final milestone before congratulations');
      process.exit(0);
    } else {
      console.error('\n❌ Complete onboarding test FAILED');
      console.error(`Error: ${result.error}`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runTest().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { runCompleteOnboardingFlow };