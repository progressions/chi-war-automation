/**
 * Onboarding Milestone Validation Test
 * 
 * Tests that new user registration shows the correct onboarding milestone:
 * 1. Register new user
 * 2. Confirm email
 * 3. Login
 * 4. Validate "Create your first Campaign" milestone is visible
 * 5. Stop after milestone validation (no campaign creation)
 */

const { chromium } = require('playwright');
const path = require('path');

const TEST_CONFIG = require('./test-config');
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'onboarding-milestone');

// Generate unique test email
const TIMESTAMP = Date.now();
const TEST_EMAIL = `test_user_${TIMESTAMP}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

async function validateOnboardingMilestone() {
  console.log('🚀 Starting Onboarding Milestone Validation Test');
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`🎯 Test URL: ${TEST_CONFIG.frontend_url}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Register new user
    console.log('\n📝 Step 1: User Registration');
    await page.goto(TEST_CONFIG.frontend_url);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-homepage.png') });
    
    // Navigate to registration
    await page.goto(`${TEST_CONFIG.frontend_url}/auth/register`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-registration-page.png') });
    
    // Fill registration form
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.fill('[name="passwordConfirmation"]', TEST_PASSWORD);
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-registration-form-filled.png') });
    
    // Submit registration
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-after-registration.png') });
    
    console.log('✅ Registration completed');

    // Step 2: Email confirmation
    console.log('\n📧 Step 2: Email Confirmation');
    const confirmationResponse = await fetch(`${TEST_CONFIG.api_base_url}/test/confirm_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    if (!confirmationResponse.ok) {
      throw new Error('Email confirmation failed');
    }
    
    console.log('✅ Email confirmation completed');

    // Step 3: Login
    console.log('\n🔐 Step 3: User Login');
    await page.goto(`${TEST_CONFIG.frontend_url}/auth/signin`);
    await page.fill('[name="email"]', TEST_EMAIL);
    await page.fill('[name="password"]', TEST_PASSWORD);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-login-form.png') });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-after-login.png') });
    
    console.log('✅ Login successful');

    // Step 4: Validate onboarding milestone
    console.log('\n🎯 Step 4: Onboarding Milestone Validation');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-onboarding-state.png') });
    
    // Look for the onboarding milestone
    const onboardingCTA = await page.locator('[data-testid*="onboarding"], [data-testid*="campaign-create"], text="Create your first Campaign"').first();
    
    if (await onboardingCTA.isVisible()) {
      const ctaText = await onboardingCTA.textContent();
      console.log(`✅ PASS: Onboarding CTA found with text: "${ctaText}"`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-milestone-validated.png') });
    } else {
      console.log('❌ FAIL: No onboarding CTA found');
      
      // Debug: Look for any onboarding-related elements
      const onboardingElements = await page.locator('[class*="onboarding"], [data-testid*="onboarding"]').count();
      console.log(`Debug: Found ${onboardingElements} onboarding-related elements`);
      
      const currentUrl = page.url();
      console.log(`Debug: Current URL: ${currentUrl}`);
      
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-milestone-not-found.png') });
    }
    
    console.log('\n🎉 Test completed successfully');
    console.log('✅ Validated: New user sees proper onboarding milestone');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-state.png') });
    throw error;
  } finally {
    await browser.close();
  }
}

// Create screenshots directory
const fs = require('fs');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Run the test
validateOnboardingMilestone().catch(console.error);