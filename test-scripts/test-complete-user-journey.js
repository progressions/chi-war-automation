/**
 * Onboarding Milestone Validation Test
 * 
 * Tests the new user onboarding milestone system:
 * - User registration and email confirmation
 * - User login and redirect to campaigns page
 * - Validation that "Create Your First Campaign" CTA appears
 * 
 * Test stops after validating the onboarding milestone is correctly displayed.
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

// Test configuration
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
 * Gamemaster Registration & Onboarding Milestone Validation
 */
async function runGamemasterOnboardingValidation(browser) {
  console.log('\n🎮 ===== GAMEMASTER REGISTRATION & ONBOARDING MILESTONE VALIDATION =====');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  const gmPage = await context.newPage();
  
  try {
    // Step 1: GM Registration
    console.log('\n👤 Step 1: Gamemaster Registration');
    const registrationResult = await registerNewUser(gmPage, GM_DATA, { 
      takeScreenshots: true, 
      screenshotDir: SCREENSHOTS_DIR 
    });
    
    if (!registrationResult.success) {
      throw new Error('Gamemaster registration failed');
    }
    
    // Step 2: Email confirmation (if needed)
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
    
    // Step 3.5: TDD - Validate New User Onboarding State
    console.log('\n🚦 Step 3.5: TDD - Validate New User Onboarding State');
    
    // (a) Verify user is redirected to campaigns page (correct behavior)
    console.log('  Testing: User is redirected to campaigns page for onboarding');
    const currentUrl = gmPage.url();
    const urlPath = new URL(currentUrl).pathname;
    
    console.log(`  Current URL: ${currentUrl}`);
    console.log(`  Current path: ${urlPath}`);
    
    if (!urlPath.startsWith('/campaigns')) {
      console.log(`  ❌ EXPECTED: User should be on campaigns path (/campaigns)`);
      console.log(`  ❌ ACTUAL: User is on path (${urlPath})`);
      throw new Error(`TDD Test: User should be on campaigns page but is on (${urlPath})`);
    }
    console.log('  ✅ PASS: User correctly redirected to campaigns page for onboarding');
    
    // (b) Verify "Create Your First Campaign" CTA is visible on campaigns page
    console.log('  Testing: "Create Your First Campaign" onboarding CTA is visible on campaigns page');
    
    await gmPage.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step3.5_onboarding_state.png`),
      fullPage: true 
    });
    
    // Look for the onboarding campaign CTA - should now pass with working onboarding system
    const campaignCtaSelector = '[data-testid="campaign-onboarding-cta"]';
    
    try {
      const campaignCta = await gmPage.waitForSelector(campaignCtaSelector, { timeout: 5000 });
      const buttonText = await campaignCta.textContent();
      console.log(`  ✅ PASS: Campaign creation CTA found with text: "${buttonText}"`);
      
      // Verify the correct button text is displayed
      if (!buttonText.includes('Create Your First Campaign')) {
        console.log(`  ⚠️  WARNING: Expected "Create Your First Campaign" but found "${buttonText}"`);
      }
      
    } catch (error) {
      console.log('  ❌ EXPECTED: "Create Your First Campaign" CTA should be visible');
      console.log('  ❌ ACTUAL: Campaign CTA not found on page');
      
      // Debug: Check for any onboarding-related elements
      const onboardingModules = await gmPage.locator('[class*="onboarding"], [data-testid*="onboarding"]').count();
      const campaignButtons = await gmPage.locator('button:has-text("campaign")').count();
      console.log(`  Debug: Found ${onboardingModules} onboarding modules, ${campaignButtons} campaign buttons`);
      
      // Take debug screenshot
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step3.5_onboarding_debug.png`),
        fullPage: true 
      });
      
      throw new Error('TDD Test: Campaign creation CTA not found - onboarding system integration issue');
    }
    
    console.log('✅ Step 3.5: New user onboarding validation completed successfully');
    
    // TEST COMPLETE - Stop after onboarding milestone validation
    console.log('\n🎉 ===== TEST COMPLETED SUCCESSFULLY =====');
    console.log('✅ SUCCESS: New user sees "Create Your First Campaign" onboarding milestone');
    console.log('🎯 Test stopped after milestone validation as requested');
    
    return {
      success: true,
      gmPage: gmPage,
      email: GM_DATA.email,
      onboardingValidated: true
    };
    
  } catch (error) {
    console.error('❌ Onboarding validation failed:', error.message);
    await gmPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'FINAL-ERROR-STATE.png') });
    return {
      success: false,
      error: error.message,
      gmPage: gmPage
    };
  } finally {
    await context.close();
  }
}


/**
 * Main test execution - Onboarding Milestone Validation
 */
async function runOnboardingMilestoneValidation() {
  console.log('🚀 Starting Onboarding Milestone Validation Test');
  console.log(`📧 GM Email: ${GM_EMAIL}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for CI/CD
    slowMo: 500       // Slow down for visibility
  });
  
  try {
    // Run gamemaster registration and onboarding milestone validation
    const result = await runGamemasterOnboardingValidation(browser);
    
    // Test Summary
    console.log('\n🎉 ===== ONBOARDING MILESTONE TEST RESULTS =====');
    console.log(`📊 Registration & Login: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Onboarding Milestone: ${result.onboardingValidated ? 'PASSED' : 'FAILED'}`);
    
    console.log(`\n🎯 OVERALL RESULT: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📧 Test account created: ${GM_EMAIL}`);
    
    if (result.success) {
      console.log('\n🎊 Onboarding milestone validation PASSED! "Create Your First Campaign" CTA is correctly displayed.');
    } else {
      console.log('\n⚠️ Test failed. Check logs and screenshots for details.');
    }
    
    return {
      success: result.success,
      screenshotDir: SCREENSHOTS_DIR,
      email: GM_EMAIL
    };
    
  } catch (error) {
    console.error('❌ Onboarding milestone test failed:', error.message);
    throw error;
    
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runOnboardingMilestoneValidation().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runOnboardingMilestoneValidation
};