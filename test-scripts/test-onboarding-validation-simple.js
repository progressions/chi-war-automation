/**
 * Simple Onboarding Validation Test
 * 
 * Tests only:
 * 1. User registration
 * 2. Email confirmation  
 * 3. User login
 * 4. Validates "Create your first Campaign" onboarding milestone is visible
 * 
 * Stops after milestone validation - no campaign creation.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Import helper modules
const { 
  generateTestEmail, 
  registerNewUser, 
  loginWithCredentials,
  confirmUserEmail 
} = require('./helpers/user-registration-helper');

// Test configuration
const TEST_CONFIG = require('./test-config');
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'onboarding-validation-simple');
const TIMESTAMP = Date.now();

// Generate unique test email
const GM_EMAIL = generateTestEmail('onboarding_test');
const TEST_PASSWORD = 'TestPass123!';

const GM_DATA = {
  email: GM_EMAIL,
  password: TEST_PASSWORD,
  firstName: 'Test',
  lastName: 'User',
  role: 'gamemaster'
};

async function runOnboardingValidationTest() {
  console.log('🚀 Starting Simple Onboarding Validation Test');
  console.log(`📧 Test email: ${GM_EMAIL}`);
  console.log(`🎯 Frontend URL: ${TEST_CONFIG.getFrontendUrl()}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);

  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  const page = await context.newPage();
  
  try {
    // Step 1: User Registration
    console.log('\n👤 Step 1: User Registration');
    const registrationResult = await registerNewUser(page, GM_DATA, { 
      takeScreenshots: true, 
      screenshotDir: SCREENSHOTS_DIR 
    });
    
    if (!registrationResult.success) {
      throw new Error('User registration failed');
    }
    console.log('✅ Registration completed');
    
    // Step 2: Email Confirmation
    console.log('\n📧 Step 2: Email Confirmation');
    await confirmUserEmail(GM_DATA.email);
    console.log('✅ Email confirmation completed');
    
    // Step 3: User Login
    console.log('\n🔐 Step 3: User Login');
    const loginResult = await loginWithCredentials(page, GM_DATA.email, GM_DATA.password, {
      takeScreenshots: true,
      screenshotDir: SCREENSHOTS_DIR
    });
    
    if (!loginResult.success) {
      throw new Error('User login failed');
    }
    console.log('✅ Login completed');
    
    // Step 4: Onboarding Milestone Validation
    console.log('\n🎯 Step 4: Onboarding Milestone Validation');
    
    await page.waitForTimeout(3000); // Wait for page to load
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_onboarding_state.png`),
      fullPage: true 
    });
    
    // Check current URL - should be on campaigns page for onboarding
    const currentUrl = page.url();
    const urlPath = new URL(currentUrl).pathname;
    
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Current path: ${urlPath}`);
    
    if (!urlPath.startsWith('/campaigns')) {
      console.log(`❌ EXPECTED: User should be on campaigns page (/campaigns)`);
      console.log(`❌ ACTUAL: User is on path (${urlPath})`);
      throw new Error(`User should be on campaigns page but is on (${urlPath})`);
    }
    console.log('✅ PASS: User correctly redirected to campaigns page for onboarding');
    
    // Look for the "Create Your First Campaign" onboarding CTA
    console.log('Testing: "Create Your First Campaign" onboarding CTA is visible');
    
    const campaignCtaSelector = '[data-testid="campaign-onboarding-cta"]';
    
    try {
      const campaignCta = await page.waitForSelector(campaignCtaSelector, { timeout: 10000 });
      const buttonText = await campaignCta.textContent();
      console.log(`✅ PASS: Campaign creation CTA found with text: "${buttonText}"`);
      
      // Verify the correct button text is displayed
      if (!buttonText.includes('Create Your First Campaign')) {
        console.log(`⚠️  WARNING: Expected "Create Your First Campaign" but found "${buttonText}"`);
      }
      
      // Take final screenshot showing successful milestone
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_milestone_validated.png`),
        fullPage: true 
      });
      
    } catch (error) {
      console.log('❌ EXPECTED: "Create Your First Campaign" CTA should be visible');
      console.log('❌ ACTUAL: Campaign CTA not found on page');
      
      // Debug: Check for any onboarding-related elements
      const onboardingModules = await page.locator('[class*="onboarding"], [data-testid*="onboarding"]').count();
      const campaignButtons = await page.locator('button:has-text("campaign")').count();
      console.log(`Debug: Found ${onboardingModules} onboarding modules, ${campaignButtons} campaign buttons`);
      
      // Take debug screenshot
      await page.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_milestone_not_found.png`),
        fullPage: true 
      });
      
      throw new Error('Campaign creation CTA not found - onboarding system issue');
    }
    
    console.log('\n🎉 ===== ONBOARDING VALIDATION TEST COMPLETED =====');
    console.log('✅ SUCCESS: New user sees "Create Your First Campaign" onboarding milestone');
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log('🎯 Test stopped after milestone validation as requested');
    
    return { success: true, email: GM_EMAIL };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_error_state.png`),
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runOnboardingValidationTest().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runOnboardingValidationTest };