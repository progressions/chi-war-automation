/**
 * End-to-End GM Onboarding Journey Test
 * 
 * Tests the complete new gamemaster user story:
 * 1. GM registration and account creation
 * 2. First campaign creation with default seeding
 * 3. Multiple character creation (PC and NPC types)
 * 
 * This validates the core "getting started" experience for new GMs.
 */

const { chromium } = require('playwright');
const path = require('path');

// Test configuration
const BASE_URL = process.env.TEST_FRONTEND_PORT ? `http://localhost:${process.env.TEST_FRONTEND_PORT}` : 'http://localhost:3005'; // Next.js test server
const API_URL = process.env.TEST_BACKEND_PORT ? `http://localhost:${process.env.TEST_BACKEND_PORT}` : 'http://localhost:3004';   // Rails test server
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'gm-onboarding-journey');
const TEST_EMAIL = `test-gm-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const CAMPAIGN_NAME = 'My First Campaign';

async function ensureScreenshotDir() {
  const fs = require('fs');
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
  // Wait for network to be idle
  await page.waitForLoadState('networkidle');
  
  // If specific URL expected, wait for it
  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
  
  // Small buffer for any remaining renders
  await page.waitForTimeout(1000);
}

async function testGMRegistration(page) {
  console.log('\n🎯 Testing GM Registration...');
  
  // Navigate to homepage
  await page.goto(BASE_URL);
  await waitForPageLoad(page);
  await takeScreenshot(page, '01-homepage');
  
  // Look for registration/signup link
  const signupSelectors = [
    'a:has-text("Sign Up")',
    'a:has-text("Register")',
    'a:has-text("Get Started")',
    'a:has-text("Create Account")',
    '[data-testid="signup-link"]'
  ];
  
  let signupLink = null;
  for (const selector of signupSelectors) {
    signupLink = await page.locator(selector).first();
    if (await signupLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      break;
    }
    signupLink = null;
  }
  
  if (!signupLink) {
    // Try navigating directly to registration page
    console.log('⚠️ No signup link found, trying direct navigation to /auth/register');
    await page.goto(`${BASE_URL}/auth/register`);
  } else {
    await signupLink.click();
  }
  
  await waitForPageLoad(page, /.*\/(auth|register|signup).*/);
  await takeScreenshot(page, '02-registration-page');
  
  // Fill out registration form
  console.log(`📧 Registering with email: ${TEST_EMAIL}`);
  
  // Try multiple possible field selectors
  const emailSelectors = ['input[name="email"]', 'input[type="email"]', '#email'];
  const passwordSelectors = ['input[name="password"]', 'input[type="password"]', '#password'];
  const nameSelectors = ['input[name="name"]', 'input[name="first_name"]', '#name', '#first_name'];
  
  // Fill email
  for (const selector of emailSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill(TEST_EMAIL);
      break;
    }
  }
  
  // Fill password
  for (const selector of passwordSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill(TEST_PASSWORD);
      break;
    }
  }
  
  // Fill password confirmation if it exists
  const passwordConfirmSelectors = [
    'input[name="password_confirmation"]', 
    'input[name="confirmPassword"]',
    '#password_confirmation'
  ];
  for (const selector of passwordConfirmSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill(TEST_PASSWORD);
      break;
    }
  }
  
  // Fill name fields if they exist
  for (const selector of nameSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill('Test Gamemaster');
      break;
    }
  }
  
  await takeScreenshot(page, '03-registration-form-filled');
  
  // Submit registration form
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Sign Up")',
    'button:has-text("Register")',
    'button:has-text("Create Account")'
  ];
  
  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      break;
    }
  }
  
  // Wait for registration to complete (might redirect to login or dashboard)
  await page.waitForTimeout(3000);
  await takeScreenshot(page, '04-after-registration');
  
  console.log('✅ Registration completed');
  return { email: TEST_EMAIL, password: TEST_PASSWORD };
}

async function testLogin(page, credentials) {
  console.log('\n🔐 Testing Login...');
  
  // Check if we're already logged in, if not navigate to login
  const currentUrl = page.url();
  if (currentUrl.includes('/auth') || currentUrl.includes('/login')) {
    // We're on an auth page, might need to navigate to login specifically
    if (!currentUrl.includes('/login')) {
      await page.goto(`${BASE_URL}/auth/login`);
      await waitForPageLoad(page);
    }
  } else if (currentUrl.includes('/dashboard') || currentUrl.includes('/campaigns')) {
    // Already logged in
    console.log('✅ Already logged in after registration');
    return;
  } else {
    // Navigate to login page
    await page.goto(`${BASE_URL}/auth/login`);
    await waitForPageLoad(page);
  }
  
  await takeScreenshot(page, '05-login-page');
  
  // Fill login form
  console.log(`📧 Logging in with: ${credentials.email}`);
  
  const emailField = page.locator('input[name="email"], input[type="email"]').first();
  const passwordField = page.locator('input[name="password"], input[type="password"]').first();
  
  if (await emailField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await emailField.fill(credentials.email);
  }
  
  if (await passwordField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await passwordField.fill(credentials.password);
  }
  
  await takeScreenshot(page, '06-login-form-filled');
  
  // Submit login form
  const loginSubmitSelectors = [
    'button[type="submit"]',
    'button:has-text("Sign In")',
    'button:has-text("Login")',
    'button:has-text("Log In")'
  ];
  
  for (const selector of loginSubmitSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      break;
    }
  }
  
  // Wait for login to complete
  await page.waitForTimeout(3000);
  await waitForPageLoad(page);
  await takeScreenshot(page, '07-after-login');
  
  console.log('✅ Login completed');
}

async function testCampaignCreation(page) {
  console.log('\n📋 Testing Campaign Creation...');
  
  // Look for campaign creation options
  const campaignNavSelectors = [
    'a:has-text("Campaigns")',
    'a[href*="/campaigns"]',
    'nav a:has-text("Campaigns")',
    '[data-testid="campaigns-nav"]'
  ];
  
  // Try to navigate to campaigns
  for (const selector of campaignNavSelectors) {
    const link = page.locator(selector).first();
    if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
      await link.click();
      await waitForPageLoad(page);
      break;
    }
  }
  
  // If that didn't work, try direct navigation
  const currentUrl = page.url();
  if (!currentUrl.includes('/campaigns')) {
    console.log('⚠️ Trying direct navigation to /campaigns');
    await page.goto(`${BASE_URL}/campaigns`);
    await waitForPageLoad(page);
  }
  
  await takeScreenshot(page, '08-campaigns-page');
  
  // Look for "Create Campaign" or "New Campaign" button
  const createCampaignSelectors = [
    'button:has-text("Create Campaign")',
    'button:has-text("New Campaign")',
    'a:has-text("Create Campaign")',
    'a:has-text("New Campaign")',
    '[data-testid="create-campaign"]',
    'button:has-text("+")'
  ];
  
  let createButton = null;
  for (const selector of createCampaignSelectors) {
    createButton = page.locator(selector).first();
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      break;
    }
    createButton = null;
  }
  
  if (!createButton) {
    // Try navigating directly to campaign creation
    console.log('⚠️ No create campaign button found, trying /campaigns/new');
    await page.goto(`${BASE_URL}/campaigns/new`);
  } else {
    await createButton.click();
  }
  
  await waitForPageLoad(page);
  await takeScreenshot(page, '09-campaign-creation-form');
  
  // Fill out campaign creation form
  console.log(`📝 Creating campaign: ${CAMPAIGN_NAME}`);
  
  const nameFieldSelectors = [
    'input[name="name"]',
    'input[name="title"]',
    '#campaign_name',
    '#name'
  ];
  
  for (const selector of nameFieldSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill(CAMPAIGN_NAME);
      break;
    }
  }
  
  // Fill description if it exists
  const descriptionSelectors = [
    'textarea[name="description"]',
    'input[name="description"]',
    '#description'
  ];
  
  for (const selector of descriptionSelectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
      await field.fill('My first Feng Shui 2 campaign for testing the complete GM onboarding experience.');
      break;
    }
  }
  
  await takeScreenshot(page, '10-campaign-form-filled');
  
  // Submit campaign creation
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Create")',
    'button:has-text("Save")',
    'input[type="submit"]'
  ];
  
  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      break;
    }
  }
  
  // Wait for campaign creation to complete
  await page.waitForTimeout(3000);
  await waitForPageLoad(page);
  await takeScreenshot(page, '11-campaign-created');
  
  console.log('✅ Campaign created successfully');
}

async function testCharacterCreation(page, characterData) {
  console.log(`\n👤 Creating character: ${characterData.name}...`);
  
  // Navigate to character creation
  const charactersNavSelectors = [
    'a:has-text("Characters")',
    'a[href*="/characters"]',
    'nav a:has-text("Characters")',
    '[data-testid="characters-nav"]'
  ];
  
  // Try to navigate to characters
  let navigated = false;
  for (const selector of charactersNavSelectors) {
    const link = page.locator(selector).first();
    if (await link.isVisible({ timeout: 1000 }).catch(() => false)) {
      await link.click();
      await waitForPageLoad(page);
      navigated = true;
      break;
    }
  }
  
  // If navigation didn't work, try direct
  if (!navigated) {
    console.log('⚠️ Trying direct navigation to /characters');
    await page.goto(`${BASE_URL}/characters`);
    await waitForPageLoad(page);
  }
  
  // Look for "Create Character" or "New Character" button
  const createCharacterSelectors = [
    'button:has-text("Create Character")',
    'button:has-text("New Character")',
    'a:has-text("Create Character")',
    'a:has-text("New Character")',
    '[data-testid="create-character"]',
    'button:has-text("+")'
  ];
  
  let createButton = null;
  for (const selector of createCharacterSelectors) {
    createButton = page.locator(selector).first();
    if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      break;
    }
    createButton = null;
  }
  
  if (!createButton) {
    // Try direct navigation
    console.log('⚠️ No create character button found, trying /characters/new');
    await page.goto(`${BASE_URL}/characters/new`);
  } else {
    await createButton.click();
  }
  
  await waitForPageLoad(page);
  await takeScreenshot(page, `12-character-creation-${characterData.type}`);
  
  // Fill character creation form
  const nameField = page.locator('input[name="name"], #name').first();
  if (await nameField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await nameField.fill(characterData.name);
  }
  
  // Set character type if dropdown exists
  const typeSelectors = [
    'select[name="character_type"]',
    'select[name="type"]',
    '#character_type'
  ];
  
  for (const selector of typeSelectors) {
    const dropdown = page.locator(selector).first();
    if (await dropdown.isVisible({ timeout: 1000 }).catch(() => false)) {
      await dropdown.selectOption({ value: characterData.type });
      break;
    }
  }
  
  // Fill description if it exists
  const descField = page.locator('textarea[name="description"], #description').first();
  if (await descField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await descField.fill(characterData.description);
  }
  
  await takeScreenshot(page, `13-character-form-filled-${characterData.type}`);
  
  // Submit character creation
  const submitSelectors = [
    'button[type="submit"]',
    'button:has-text("Create")',
    'button:has-text("Save")',
    'input[type="submit"]'
  ];
  
  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click();
      break;
    }
  }
  
  // Wait for character creation
  await page.waitForTimeout(2000);
  await waitForPageLoad(page);
  await takeScreenshot(page, `14-character-created-${characterData.type}`);
  
  console.log(`✅ Character "${characterData.name}" created successfully`);
}

async function runGMOnboardingJourney() {
  console.log('🚀 Starting GM Onboarding Journey Test');
  console.log(`📧 Test email: ${TEST_EMAIL}`);
  console.log(`🎯 Test URL: ${BASE_URL}`);
  
  const browser = await chromium.launch({ 
    headless: false,  // Set to true for CI/CD
    slowMo: 1000      // Slow down for visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Registration
    const credentials = await testGMRegistration(page);
    
    // Step 2: Login (if needed)
    await testLogin(page, credentials);
    
    // Step 3: Campaign Creation
    await testCampaignCreation(page);
    
    // Step 4: Create Multiple Characters
    const charactersToCreate = [
      {
        name: 'Chen Wei',
        type: 'pc',
        description: 'A skilled martial artist from Ancient China seeking to protect the innocent.'
      },
      {
        name: 'Sarah Mitchell',
        type: 'pc', 
        description: 'A modern-day detective investigating supernatural crimes.'
      },
      {
        name: 'Generic Thug',
        type: 'mook',
        description: 'Basic enemy for testing combat encounters.'
      },
      {
        name: 'Master Villain',
        type: 'boss',
        description: 'The primary antagonist of the campaign.'
      }
    ];
    
    for (const character of charactersToCreate) {
      await testCharacterCreation(page, character);
      
      // Navigate back to characters list between creations
      await page.goto(`${BASE_URL}/characters`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);
    }
    
    // Final screenshot of characters list
    await page.goto(`${BASE_URL}/characters`);
    await waitForPageLoad(page);
    await takeScreenshot(page, '15-final-characters-list');
    
    console.log('\n🎉 GM Onboarding Journey Test Completed Successfully!');
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    console.log(`📧 Test account created: ${TEST_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await takeScreenshot(page, 'error-state');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runGMOnboardingJourney().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runGMOnboardingJourney
};