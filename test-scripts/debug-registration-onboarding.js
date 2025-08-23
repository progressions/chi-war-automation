/**
 * Debug Registration and Onboarding Test
 * 
 * Focused test to debug registration issues and validate onboarding system
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration
const BASE_URL = 'http://localhost:3005';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'debug-onboarding');
const TEST_EMAIL = `debug-user-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPass123!';

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

async function debugRegistration() {
  console.log('🚀 Starting Registration & Onboarding Debug Test');
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`🎯 Frontend URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to homepage
    console.log('\n📍 Step 1: Navigate to Homepage');
    await page.goto(BASE_URL);
    await waitForPageLoad(page);
    await takeScreenshot(page, '01-homepage');
    
    // Step 2: Navigate to registration
    console.log('\n📍 Step 2: Navigate to Registration');
    await page.goto(`${BASE_URL}/register`);
    await waitForPageLoad(page);
    await takeScreenshot(page, '02-registration-page');
    
    // Step 3: Fill registration form carefully
    console.log('\n📍 Step 3: Fill Registration Form');
    
    // Use more flexible selectors based on the visible form
    const fieldSelectors = [
      { name: 'email', selectors: ['input[name="email"]', 'input[type="email"]', 'input:below(:text("Email"))'], value: TEST_EMAIL },
      { name: 'firstName', selectors: ['input[name="first_name"]', 'input[name="firstName"]', 'input:below(:text("First Name"))'], value: 'Debug' },
      { name: 'lastName', selectors: ['input[name="last_name"]', 'input[name="lastName"]', 'input:below(:text("Last Name"))'], value: 'User' },
      { name: 'password', selectors: ['input[name="password"]', 'input[type="password"]:first', 'input:below(:text("Password"))'], value: TEST_PASSWORD },
      { name: 'confirmPassword', selectors: ['input[name="password_confirmation"]', 'input[name="confirmPassword"]', 'input:below(:text("Confirm Password"))'], value: TEST_PASSWORD }
    ];
    
    for (const field of fieldSelectors) {
      console.log(`📝 Filling ${field.name}...`);
      let filled = false;
      
      for (const selector of field.selectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible({ timeout: 2000 })) {
            await element.fill(field.value);
            console.log(`✅ Filled ${field.name} using selector: ${selector}`);
            filled = true;
            break;
          }
        } catch (error) {
          console.log(`⚠️ Selector ${selector} failed for ${field.name}`);
        }
      }
      
      if (!filled) {
        console.log(`❌ Could not fill ${field.name} with any selector`);
      }
    }
    
    await takeScreenshot(page, '03-form-filled');
    
    // Step 4: Submit registration
    console.log('\n📍 Step 4: Submit Registration');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    await waitForPageLoad(page);
    await takeScreenshot(page, '04-after-registration');
    
    console.log(`Current URL after registration: ${page.url()}`);
    
    // Step 5: Check if we need to login or if auto-logged in
    if (page.url().includes('/login')) {
      console.log('\n📍 Step 5: Login Required');
      await page.fill('input[name="email"]', TEST_EMAIL);
      await page.fill('input[name="password"]', TEST_PASSWORD);
      await takeScreenshot(page, '05-login-form');
      
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000);
      await waitForPageLoad(page);
      await takeScreenshot(page, '06-after-login');
    }
    
    // Step 6: Look for onboarding system
    console.log('\n🎯 Step 6: Validate Onboarding System');
    await page.waitForTimeout(3000); // Give time for components to render
    
    const onboardingResults = {};
    
    // Check for various onboarding elements
    const onboardingChecks = [
      { name: 'onboarding-module', selector: '[data-testid="onboarding-module"]' },
      { name: 'onboarding-paper', selector: '.MuiPaper-root:has-text("Ready to start")' },
      { name: 'campaign-cta', selector: 'text="Ready to start your first campaign"' },
      { name: 'progress-indicator', selector: '.MuiLinearProgress-root' },
      { name: 'congratulations', selector: 'text="Congratulations"' },
      { name: 'any-onboarding-text', selector: 'text="onboarding"' }
    ];
    
    for (const check of onboardingChecks) {
      try {
        const isVisible = await page.locator(check.selector).isVisible({ timeout: 2000 });
        onboardingResults[check.name] = isVisible;
        console.log(`${isVisible ? '✅' : '❌'} ${check.name}: ${isVisible}`);
      } catch (error) {
        onboardingResults[check.name] = false;
        console.log(`❌ ${check.name}: false (error)`);
      }
    }
    
    await takeScreenshot(page, '07-onboarding-validation');
    
    // Step 7: Inspect page content
    console.log('\n🔍 Step 7: Page Content Analysis');
    const pageText = await page.textContent('body');
    const hasOnboardingText = pageText.toLowerCase().includes('onboarding') || 
                             pageText.includes('Ready to start') ||
                             pageText.includes('campaign');
    
    console.log(`Page contains onboarding-related text: ${hasOnboardingText}`);
    console.log(`Current URL: ${page.url()}`);
    console.log(`Page title: ${await page.title()}`);
    
    // Step 8: Check DOM for onboarding module
    console.log('\n🔍 Step 8: DOM Analysis');
    const onboardingModule = await page.$('[data-testid="onboarding-module"]');
    if (onboardingModule) {
      const moduleText = await onboardingModule.textContent();
      console.log(`✅ Found onboarding module with text: ${moduleText?.substring(0, 100)}...`);
    } else {
      console.log('❌ No onboarding module found in DOM');
      
      // Check if there's any element that might be the onboarding
      const anyModules = await page.$$('.MuiPaper-root');
      console.log(`Found ${anyModules.length} MuiPaper elements`);
      
      for (let i = 0; i < Math.min(anyModules.length, 3); i++) {
        const text = await anyModules[i].textContent();
        console.log(`Paper ${i + 1}: ${text?.substring(0, 50)}...`);
      }
    }
    
    // Final screenshot
    await takeScreenshot(page, '08-final-analysis');
    
    console.log('\n📊 ONBOARDING VALIDATION RESULTS:');
    for (const [check, result] of Object.entries(onboardingResults)) {
      console.log(`   ${result ? '✅' : '❌'} ${check}: ${result}`);
    }
    
    const onboardingWorking = Object.values(onboardingResults).some(r => r);
    console.log(`\n🎯 OVERALL ONBOARDING STATUS: ${onboardingWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
    return { success: true, onboardingWorking, results: onboardingResults };
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
    await takeScreenshot(page, 'ERROR-debug-failed');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the debug test
if (require.main === module) {
  debugRegistration().catch(error => {
    console.error('Debug test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { debugRegistration };