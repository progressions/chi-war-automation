/**
 * Onboarding System Validation Test - Existing User
 * 
 * Tests the onboarding system with existing test users to validate 
 * that the onboarding interface appears correctly after login
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { validateOnboardingSystem } = require('./helpers/user-registration-helper');

// Test configuration
const BASE_URL = 'http://localhost:3005';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'onboarding-validation');

// Test users from seed data
const TEST_USERS = [
  { email: 'progressions@gmail.com', password: 'TestPass123!', type: 'gamemaster' },
  { email: 'player@example.com', password: 'TestPass123!', type: 'player' }
];

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function takeScreenshot(page, name) {
  await ensureScreenshotDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: path.join(SCREENSHOTS_DIR, `${timestamp}-${name}.png`),
    fullPage: true 
  });
  console.log(`📸 Screenshot: ${name}`);
}

async function waitForPageLoad(page, expectedUrl = null) {
  await page.waitForLoadState('networkidle');
  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
  await page.waitForTimeout(1000);
}

async function testUserOnboarding(user) {
  console.log(`\n🧪 Testing Onboarding for: ${user.email} (${user.type})`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to login
    console.log('📍 Step 1: Navigate to Login');
    await page.goto(`${BASE_URL}/login`);
    await waitForPageLoad(page);
    await takeScreenshot(page, `01-login-${user.type}`);
    
    // Step 2: Login with existing user
    console.log('📍 Step 2: Login with Test User');
    await page.fill('input[name="email"]', user.email);
    await page.fill('input[name="password"]', user.password);
    await takeScreenshot(page, `02-login-filled-${user.type}`);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    await waitForPageLoad(page);
    
    console.log(`Current URL after login: ${page.url()}`);
    await takeScreenshot(page, `03-after-login-${user.type}`);
    
    // Step 3: Validate Onboarding System
    console.log('🎯 Step 3: Validate Onboarding System');
    const onboardingValidation = await validateOnboardingSystem(page);
    
    // Step 4: Check page content and state
    console.log('🔍 Step 4: Analyze Page State');
    const pageTitle = await page.title();
    const currentUrl = page.url();
    const pageText = await page.textContent('body');
    
    // Look for various indicators
    const indicators = {
      hasOnboardingModule: await page.locator('[data-testid="onboarding-module"]').isVisible({ timeout: 2000 }).catch(() => false),
      hasCampaignCTA: pageText.includes('Ready to start your first campaign'),
      hasProgressIndicator: await page.locator('.MuiLinearProgress-root').isVisible({ timeout: 2000 }).catch(() => false),
      hasCongratulations: pageText.includes('Congratulations'),
      isOnCampaignsPage: currentUrl.includes('/campaigns'),
      hasCreateButton: await page.locator('button:has-text("CREATE")').isVisible({ timeout: 2000 }).catch(() => false),
      hasSpeedDial: await page.locator('[data-testid="speed-dial"]').isVisible({ timeout: 2000 }).catch(() => false)
    };
    
    // Step 5: Manual DOM inspection
    console.log('🔍 Step 5: DOM Inspection');
    const allPapers = await page.$$('.MuiPaper-root');
    console.log(`Found ${allPapers.length} Material-UI Paper components`);
    
    for (let i = 0; i < Math.min(allPapers.length, 5); i++) {
      const paperText = await allPapers[i].textContent();
      const isVisible = await allPapers[i].isVisible();
      console.log(`  Paper ${i + 1}: ${isVisible ? 'VISIBLE' : 'HIDDEN'} - "${paperText?.substring(0, 80)}..."`);
    }
    
    await takeScreenshot(page, `04-final-validation-${user.type}`);
    
    // Results Summary
    console.log(`\n📊 ONBOARDING VALIDATION RESULTS for ${user.email}:`);
    console.log(`   Page Title: ${pageTitle}`);
    console.log(`   Current URL: ${currentUrl}`);
    console.log(`   Onboarding Visible: ${onboardingValidation.onboardingVisible ? '✅' : '❌'}`);
    console.log(`   Onboarding Type: ${onboardingValidation.onboardingType}`);
    
    for (const [key, value] of Object.entries(indicators)) {
      console.log(`   ${value ? '✅' : '❌'} ${key}: ${value}`);
    }
    
    return {
      success: true,
      user: user.email,
      onboarding: onboardingValidation,
      indicators,
      pageInfo: { title: pageTitle, url: currentUrl }
    };
    
  } catch (error) {
    console.error(`❌ Test failed for ${user.email}:`, error.message);
    await takeScreenshot(page, `ERROR-${user.type}`);
    return {
      success: false,
      user: user.email,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

async function runOnboardingValidationTest() {
  console.log('🚀 Starting Onboarding System Validation Test');
  console.log(`🎯 Frontend URL: ${BASE_URL}`);
  console.log(`👥 Test Users: ${TEST_USERS.map(u => u.email).join(', ')}`);
  
  const results = [];
  
  for (const user of TEST_USERS) {
    const result = await testUserOnboarding(user);
    results.push(result);
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Overall Summary
  console.log('\n🎉 ===== ONBOARDING SYSTEM VALIDATION RESULTS =====');
  
  let onboardingWorking = false;
  for (const result of results) {
    if (result.success) {
      const status = result.onboarding?.onboardingVisible ? 'WORKING' : 'NOT WORKING';
      console.log(`📊 ${result.user}: ${status} (${result.onboarding?.onboardingType || 'N/A'})`);
      
      if (result.onboarding?.onboardingVisible) {
        onboardingWorking = true;
      }
    } else {
      console.log(`❌ ${result.user}: FAILED - ${result.error}`);
    }
  }
  
  console.log(`\n🎯 OVERALL ONBOARDING STATUS: ${onboardingWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
  console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
  
  return {
    success: onboardingWorking,
    results,
    screenshotDir: SCREENSHOTS_DIR
  };
}

// Run the validation test
if (require.main === module) {
  runOnboardingValidationTest().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runOnboardingValidationTest };