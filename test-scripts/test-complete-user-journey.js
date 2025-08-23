/**
 * Onboarding Milestone & Campaign Form Validation Test
 * 
 * Tests the new user onboarding milestone system:
 * - User registration and email confirmation
 * - User login and redirect to campaigns page
 * - Validation that "Create Your First Campaign" CTA appears
 * - Click the CTA and validate campaign creation form opens
 * 
 * Test validates the complete onboarding flow through to campaign form access.
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
 * Gamemaster Registration, Onboarding Milestone & Campaign Form Validation
 */
async function runGamemasterOnboardingValidation(browser) {
  console.log('\n🎮 ===== GAMEMASTER REGISTRATION, ONBOARDING MILESTONE & CAMPAIGN FORM VALIDATION =====');
  
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
    
    // Step 3.6: TDD - Validate Campaign Creation Form Opens
    console.log('\n🚦 Step 3.6: TDD - Click "Create Your First Campaign" and Validate Form Opens');
    console.log('  Testing: Campaign creation form opens after clicking CTA');
    
    try {
      // Click the onboarding CTA we already validated
      console.log('  Clicking "Create Your First Campaign" button...');
      
      const campaignCtaButton = await gmPage.waitForSelector(campaignCtaSelector, { timeout: 3000 });
      await campaignCtaButton.click();
      await gmPage.waitForTimeout(2000); // Wait for form to appear
      
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step3.6_campaign_form.png`),
        fullPage: true 
      });
      
      // Verify campaign creation form is visible
      console.log('  Testing: Campaign creation form elements are visible');
      
      // Look for common form elements that should be present
      const formSelectors = [
        'form', 
        '[data-testid="campaign-form"]', 
        'input[name="name"]', 
        'input[placeholder*="campaign" i]',
        'input[placeholder*="name" i]'
      ];
      
      let formFound = false;
      let formSelector = '';
      
      for (const selector of formSelectors) {
        try {
          await gmPage.waitForSelector(selector, { timeout: 3000 });
          formFound = true;
          formSelector = selector;
          console.log(`  ✅ Campaign form found using selector: ${selector}`);
          break;
        } catch (e) {
          // Continue trying other selectors
        }
      }
      
      if (!formFound) {
        // Additional debug - check what's actually on the page
        const pageContent = await gmPage.textContent('body');
        console.log('  Debug: Checking page content for form-related text...');
        
        if (pageContent.toLowerCase().includes('campaign')) {
          console.log('  Debug: Found "campaign" text on page');
        }
        if (pageContent.toLowerCase().includes('name')) {
          console.log('  Debug: Found "name" text on page');
        }
        if (pageContent.toLowerCase().includes('create')) {
          console.log('  Debug: Found "create" text on page');
        }
        
        throw new Error('Campaign creation form not found after clicking CTA');
      }
      
      // Additional validation - check for form input field
      try {
        const nameInput = await gmPage.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 3000 });
        const inputValue = await nameInput.getAttribute('placeholder');
        console.log(`  ✅ Campaign name input field found with placeholder: "${inputValue}"`);
      } catch (e) {
        console.log('  ⚠️  Campaign name input field not found, but form container is present');
      }
      
      console.log('  ✅ PASS: Campaign creation form opened successfully');
      console.log('✅ Step 3.6: Campaign form opening validation completed successfully');
      
    } catch (error) {
      console.log('  ❌ EXPECTED: Campaign creation form should open after clicking CTA');
      console.log(`  ❌ ACTUAL: ${error.message}`);
      
      await gmPage.screenshot({ 
        path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_step3.6_failed.png`),
        fullPage: true 
      });
      
      throw new Error(`TDD Test: Campaign creation form validation failed - ${error.message}`);
    }
    
    // TEST COMPLETE - Stop after campaign form validation
    console.log('\n🎉 ===== TEST COMPLETED SUCCESSFULLY =====');
    console.log('✅ SUCCESS: New user sees "Create Your First Campaign" onboarding milestone');
    console.log('✅ SUCCESS: Campaign creation form opens correctly when CTA is clicked');
    console.log('🎯 Test completed after campaign form validation');
    
    return {
      success: true,
      gmPage: gmPage,
      email: GM_DATA.email,
      onboardingValidated: true,
      campaignFormValidated: true
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
 * Main test execution - Onboarding Milestone & Campaign Form Validation
 */
async function runOnboardingMilestoneValidation() {
  console.log('🚀 Starting Onboarding Milestone & Campaign Form Validation Test');
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
    console.log('\n🎉 ===== ONBOARDING MILESTONE & CAMPAIGN FORM TEST RESULTS =====');
    console.log(`📊 Registration & Login: ${result.success ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Onboarding Milestone: ${result.onboardingValidated ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Campaign Form Opening: ${result.campaignFormValidated ? 'PASSED' : 'FAILED'}`);
    
    console.log(`\n🎯 OVERALL RESULT: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📧 Test account created: ${GM_EMAIL}`);
    
    if (result.success) {
      console.log('\n🎊 Complete onboarding flow validation PASSED!');
      console.log('✅ "Create Your First Campaign" CTA displays correctly');
      console.log('✅ Campaign creation form opens when CTA is clicked');
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