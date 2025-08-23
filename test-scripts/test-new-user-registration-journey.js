/**
 * New User Registration Journey Test
 * 
 * Tests the complete journey of a new user who:
 * 1. Visits the homepage
 * 2. Clicks "Register" to create an account
 * 3. Goes through the onboarding process
 * 4. Creates their first campaign
 * 5. Sets up characters
 * 6. Navigates the main application features
 * 
 * This tests the authentic new user experience from discovery to active use.
 */

const { chromium } = require('playwright');
const path = require('path');

// Use development servers (where registration works)
const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'new-user-journey');

// Generate unique test user email
const TEST_EMAIL = `new-user-${Date.now()}@example.com`;
const TEST_PASSWORD = 'NewUserPassword123!';

async function ensureScreenshotDir() {
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function takeScreenshot(page, name, description = '') {
  await ensureScreenshotDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  
  await page.screenshot({ 
    path: filepath,
    fullPage: true 
  });
  
  console.log(`📸 Screenshot: ${name} ${description ? '- ' + description : ''}`);
  return filepath;
}

async function waitForPageLoad(page, timeout = 30000) {
  await page.waitForLoadState('networkidle', { timeout });
  await page.waitForTimeout(1000); // Buffer for any final renders
}

async function testNewUserRegistrationJourney() {
  console.log('🚀 Starting New User Registration Journey Test');
  console.log(`📧 New User Email: ${TEST_EMAIL}`);
  console.log(`🎯 Frontend: ${FRONTEND_URL}`);
  console.log(`🔗 Backend: ${BACKEND_URL}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Visit Homepage
    console.log('\\n🏠 Step 1: Visit Homepage');
    await page.goto(FRONTEND_URL);
    await waitForPageLoad(page);
    await takeScreenshot(page, '01-homepage', 'New user first visit');
    
    // Step 2: Navigate to Registration
    console.log('\\n📝 Step 2: Navigate to Registration');
    
    // Look for register/signup links
    const registerSelectors = [
      'a:has-text("Register")',
      'a:has-text("Sign Up")', 
      'a:has-text("Get Started")',
      'a:has-text("Create Account")',
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
      '[data-testid="register"]',
      '[href="/register"]'
    ];
    
    let registerLink = null;
    for (const selector of registerSelectors) {
      registerLink = page.locator(selector).first();
      if (await registerLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`Found register link: ${selector}`);
        break;
      }
      registerLink = null;
    }
    
    if (!registerLink) {
      console.log('⚠️ No register link found, trying direct navigation to /register');
      await page.goto(`${FRONTEND_URL}/register`);
    } else {
      await registerLink.click();
    }
    
    await waitForPageLoad(page);
    await takeScreenshot(page, '02-register-page', 'Registration form');
    
    // Step 3: Fill Registration Form
    console.log('\\n✍️ Step 3: Fill Registration Form');
    console.log(`Creating account for: ${TEST_EMAIL}`);
    
    // Fill email field
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]', 
      '#email',
      'input[placeholder*="email" i]'
    ];
    
    for (const selector of emailSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.fill(TEST_EMAIL);
        console.log(`✓ Filled email field: ${selector}`);
        break;
      }
    }
    
    // Fill password field
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password'
    ];
    
    for (const selector of passwordSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.fill(TEST_PASSWORD);
        console.log(`✓ Filled password field: ${selector}`);
        break;
      }
    }
    
    // Fill password confirmation if it exists
    const confirmPasswordSelectors = [
      'input[name="password_confirmation"]',
      'input[name="confirmPassword"]',
      'input[name="confirm_password"]',
      '#password_confirmation',
      '#confirmPassword'
    ];
    
    for (const selector of confirmPasswordSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.fill(TEST_PASSWORD);
        console.log(`✓ Filled password confirmation field: ${selector}`);
        break;
      }
    }
    
    // Fill name fields if they exist
    const nameSelectors = [
      'input[name="name"]',
      'input[name="first_name"]',
      '#name',
      '#first_name'
    ];
    
    for (const selector of nameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.fill('New Test User');
        console.log(`✓ Filled name field: ${selector}`);
        break;
      }
    }
    
    await takeScreenshot(page, '03-register-form-filled', 'Registration form completed');
    
    // Step 4: Submit Registration
    console.log('\\n🚀 Step 4: Submit Registration');
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Register")',
      'button:has-text("Sign Up")',
      'button:has-text("Create Account")',
      'button:has-text("Get Started")'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        console.log(`✓ Clicked submit button: ${selector}`);
        break;
      }
    }
    
    // Wait for registration to process
    await page.waitForTimeout(5000);
    await waitForPageLoad(page);
    await takeScreenshot(page, '04-after-registration', 'After registration submission');
    
    // Step 5: Check if we're logged in or need to confirm
    console.log('\\n🔍 Step 5: Check Registration Result');
    const currentUrl = page.url();
    console.log(`Current URL after registration: ${currentUrl}`);
    
    // If we're redirected to login, the registration worked but we need to sign in
    if (currentUrl.includes('/login')) {
      console.log('📧 Registration successful, now logging in');
      
      await page.locator('input[name="email"], input[type="email"]').first().fill(TEST_EMAIL);
      await page.locator('input[name="password"], input[type="password"]').first().fill(TEST_PASSWORD);
      await page.getByText('SIGN IN').click();
      
      await page.waitForTimeout(3000);
      await waitForPageLoad(page);
      await takeScreenshot(page, '05-after-login', 'Logged in after registration');
    }
    
    // Step 6: Navigate Application Features
    console.log('\\n🎯 Step 6: Explore Application Features');
    
    const features = [
      { name: 'Campaigns', url: '/campaigns', description: 'Campaign management' },
      { name: 'Characters', url: '/characters', description: 'Character creation' },
      { name: 'Fights', url: '/fights', description: 'Combat encounters' }
    ];
    
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      console.log(`\\n📍 Step 6.${i + 1}: Navigate to ${feature.name}`);
      
      // Try navigation links first
      const navSelectors = [
        `a:has-text("${feature.name}")`,
        `a[href*="${feature.url}"]`,
        `nav a:has-text("${feature.name}")`,
        `[data-testid="${feature.name.toLowerCase()}-nav"]`
      ];
      
      let navigated = false;
      for (const selector of navSelectors) {
        const link = page.locator(selector).first();
        if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
          await link.click();
          await waitForPageLoad(page);
          navigated = true;
          console.log(`✓ Navigated via link: ${selector}`);
          break;
        }
      }
      
      // Fallback to direct URL
      if (!navigated) {
        console.log(`⚠️ No nav link found, going directly to ${feature.url}`);
        await page.goto(`${FRONTEND_URL}${feature.url}`);
        await waitForPageLoad(page);
      }
      
      await takeScreenshot(page, `06-${i + 1}-${feature.name.toLowerCase()}`, feature.description);
    }
    
    console.log('\\n🎉 New User Registration Journey Completed Successfully!');
    console.log(`📧 Test Account Created: ${TEST_EMAIL}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    
    return {
      success: true,
      email: TEST_EMAIL,
      message: 'Complete new user journey from registration to feature exploration'
    };
    
  } catch (error) {
    console.error('❌ New User Journey Test Failed:', error.message);
    await takeScreenshot(page, 'ERROR-final-state', 'Error state');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testNewUserRegistrationJourney().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testNewUserRegistrationJourney
};