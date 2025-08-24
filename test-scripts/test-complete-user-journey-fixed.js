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
    await gmPage.fill('textarea[name="description"]', 'An epic campaign created during the complete onboarding test');
    
    // Save campaign
    const saveButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // Step 6: Activate campaign
    console.log('\n🚦 Step 6: Activate Campaign');
    await validateOnboardingMilestone(gmPage, 'Activate', '6');
    
    const activateButton = await gmPage.waitForSelector('button:has-text("Activate")');
    await activateButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 3: CHARACTER CREATION ==========
    console.log('\n===== PHASE 3: CHARACTER CREATION =====');
    
    // Verify "Create your first Character" milestone
    await validateOnboardingMilestone(gmPage, 'Character', '7');
    
    // Step 8: Navigate to characters and create character
    console.log('\n🚦 Step 8: Create First Character');
    
    // Click character CTA
    const characterCtaButton = await gmPage.waitForSelector('button:has-text("Character"), button:has-text("character")');
    await characterCtaButton.click();
    
    // Wait for navigation
    await gmPage.waitForLoadState('networkidle');
    await gmPage.waitForTimeout(2000);
    
    // Click Create button on characters page
    const createCharacterButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createCharacterButton.click();
    
    // Wait for character creation page
    await gmPage.waitForSelector('[data-testid="character-templates"], .template-grid', { timeout: 5000 });
    
    // Select first template
    const firstTemplate = await gmPage.waitForSelector('[data-testid="template-card-0"], .template-card:first-child');
    await firstTemplate.click();
    
    // Fill character name
    await gmPage.fill('input[name="name"]', 'Test Hero');
    
    // Save character
    const saveCharacterButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveCharacterButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 4: FACTION CREATION ==========
    console.log('\n===== PHASE 4: FACTION CREATION =====');
    
    // Verify "Create your first Faction" milestone
    await validateOnboardingMilestone(gmPage, 'Faction', '9');
    
    // Step 10: Create faction
    console.log('\n🚦 Step 10: Create First Faction');
    
    // Navigate to factions
    await gmPage.goto(`http://localhost:3005/factions`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createFactionButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createFactionButton.click();
    
    // Fill faction form
    await gmPage.fill('input[name="name"]', 'Test Faction');
    await gmPage.fill('textarea[name="description"]', 'A test faction for the onboarding flow');
    
    // Save faction
    const saveFactionButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFactionButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 5: PARTY CREATION ==========
    console.log('\n===== PHASE 5: PARTY CREATION =====');
    
    // Verify "Create your first Party" milestone
    await validateOnboardingMilestone(gmPage, 'Party', '11');
    
    // Step 12: Create party
    console.log('\n🚦 Step 12: Create First Party');
    
    // Navigate to parties
    await gmPage.goto(`http://localhost:3005/parties`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createPartyButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createPartyButton.click();
    
    // Fill party form
    await gmPage.fill('input[name="name"]', 'Test Party');
    await gmPage.fill('textarea[name="description"]', 'A test party for the onboarding flow');
    
    // Save party
    const savePartyButton = await gmPage.waitForSelector('button:has-text("Save")');
    await savePartyButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 6: SITE CREATION ==========
    console.log('\n===== PHASE 6: SITE CREATION =====');
    
    // Verify "Create your first Site" milestone
    await validateOnboardingMilestone(gmPage, 'Site', '13');
    
    // Step 14: Create site
    console.log('\n🚦 Step 14: Create First Site');
    
    // Navigate to sites
    await gmPage.goto(`http://localhost:3005/sites`);
    await gmPage.waitForTimeout(2000);
    
    // Click Create button
    const createSiteButton = await gmPage.waitForSelector('button:has-text("Create")');
    await createSiteButton.click();
    
    // Fill site form
    await gmPage.fill('input[name="name"]', 'Test Location');
    await gmPage.fill('textarea[name="description"]', 'A test site for the onboarding flow');
    
    // Save site
    const saveSiteButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveSiteButton.click();
    
    await gmPage.waitForTimeout(3000);
    
    // ========== PHASE 7: FIGHT CREATION (FINAL MILESTONE) ==========
    console.log('\n===== PHASE 7: FIGHT CREATION (FINAL MILESTONE) =====');
    
    // Verify "Create your first Fight" milestone (should be the LAST milestone)
    await validateOnboardingMilestone(gmPage, 'Fight', '15');
    
    // Step 16: Create fight
    console.log('\n🚦 Step 16: Create First Fight (Final Milestone)');
    
    // Navigate to fights
    await gmPage.goto(`http://localhost:3005/fights`);
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
    await gmPage.fill('input[name="name"]', 'Final Boss Battle');
    await gmPage.fill('textarea[name="description"]', 'The culminating fight of our onboarding journey');
    
    // Save fight
    const saveFightButton = await gmPage.waitForSelector('button:has-text("Save")');
    await saveFightButton.click();
    
    await gmPage.waitForTimeout(3000);
    
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
    console.log('  1. ✅ Campaign creation');
    console.log('  2. ✅ Campaign activation');
    console.log('  3. ✅ Character creation');
    console.log('  4. ✅ Faction creation');
    console.log('  5. ✅ Party creation');
    console.log('  6. ✅ Site creation');
    console.log('  7. ✅ Fight creation (final milestone)');
    console.log('  8. ✅ Congratulations');
    
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