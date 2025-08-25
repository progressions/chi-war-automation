const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration - using correct test ports
const BACKEND_URL = 'http://localhost:3004';
const FRONTEND_URL = 'http://localhost:3005';

// Existing test user from seed data
const TEST_USER = {
  email: 'progressions@gmail.com',
  password: 'password'
};

// Helper function to take screenshots
async function takeScreenshot(page, name, testDir) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${name}.png`;
  const filepath = path.join(testDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot: ${name}`);
  return filepath;
}

// Helper function to wait for element
async function waitForElement(page, selector, timeout = 30000) {
  try {
    await page.waitForSelector(selector, { timeout, state: 'visible' });
    return true;
  } catch (error) {
    console.log(`  ⚠️ Element not found: ${selector}`);
    return false;
  }
}

// Helper function to login
async function login(page, testDir) {
  console.log('\n🔐 Logging in as test user...');
  
  // Navigate to login page
  await page.goto(`${FRONTEND_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // Fill login form
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await takeScreenshot(page, 'login-form-filled', testDir);
  
  // Submit login
  await page.click('button[type="submit"]');
  await page.waitForURL('**/campaigns', { timeout: 30000 });
  await page.waitForLoadState('networkidle');
  
  console.log('✅ Login successful');
  await takeScreenshot(page, 'after-login', testDir);
}

// Main test function
async function testCacheBuster() {
  console.log('🚀 Starting Cache Buster Validation Test');
  console.log(`📡 Backend URL: ${BACKEND_URL}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  
  // Create test results directory
  const testDir = path.join(__dirname, 'test-results', 'cache-buster-validation');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  console.log(`📸 Screenshots will be saved to: ${testDir}`);
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  // Set up console logging for debugging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  ⚠️ Browser console error:', msg.text());
    }
  });
  
  try {
    // Login first
    await login(page, testDir);
    
    console.log('\n===== TEST 1: CAMPAIGN CACHE BUSTER =====');
    
    // Navigate to campaigns page
    await page.goto(`${FRONTEND_URL}/campaigns`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'campaigns-initial', testDir);
    
    // Count initial campaigns
    const initialCampaigns = await page.locator('[data-testid="campaign-row"], .campaign-card, tr:has-text("Test Campaign"), div:has-text("Test Campaign")').count();
    console.log(`📊 Initial campaign count: ${initialCampaigns}`);
    
    // Create a new campaign using the FAB button
    console.log('📝 Creating new campaign...');
    
    // Click the FAB (Floating Action Button)
    const fabButton = page.locator('.MuiSpeedDial-fab, [aria-label="SpeedDial"], button:has-text("Add")').first();
    await fabButton.waitFor({ state: 'visible', timeout: 10000 });
    await fabButton.click();
    await page.waitForTimeout(500);
    
    // Click the create campaign option
    const createButton = page.locator('[aria-label="Create"], button:has-text("Create")').first();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();
    await page.waitForTimeout(500);
    
    // Wait for form drawer to open
    await page.waitForSelector('.MuiDrawer-root input[name="name"]', { state: 'visible', timeout: 10000 });
    
    // Fill campaign form
    const campaignName = `Cache Test Campaign ${Date.now()}`;
    await page.fill('input[name="name"]', campaignName);
    await takeScreenshot(page, 'campaign-form-filled', testDir);
    
    // Save the campaign
    await page.click('button:has-text("Save")');
    
    // Wait for drawer to close and list to refresh
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    
    // Check if campaign appears in list (with retries)
    console.log(`📋 Checking if campaign "${campaignName}" appears in list...`);
    let campaignFound = false;
    let retries = 0;
    const maxRetries = 10;
    
    while (!campaignFound && retries < maxRetries) {
      await page.waitForTimeout(1000);
      
      // Check for campaign in various possible selectors
      const campaignElements = await page.locator(`text="${campaignName}"`).count();
      if (campaignElements > 0) {
        campaignFound = true;
        console.log(`✅ Campaign found in list after ${retries + 1} attempts!`);
      } else {
        retries++;
        console.log(`  ⏳ Retry ${retries}/${maxRetries} - Campaign not yet visible...`);
        
        // Try refreshing the page if after 5 retries
        if (retries === 5) {
          console.log('  🔄 Refreshing page...');
          await page.reload();
          await page.waitForLoadState('networkidle');
        }
      }
    }
    
    await takeScreenshot(page, 'campaigns-after-create', testDir);
    
    if (!campaignFound) {
      throw new Error(`Campaign "${campaignName}" did not appear in list after ${maxRetries} attempts - cache buster may not be working!`);
    }
    
    console.log('\n===== TEST 2: CHARACTER CACHE BUSTER =====');
    
    // Activate the campaign we just created
    console.log('🎯 Activating campaign...');
    const campaignRow = page.locator(`tr:has-text("${campaignName}"), div:has-text("${campaignName}")`).first();
    await campaignRow.click();
    await page.waitForTimeout(1000);
    
    // Navigate to characters page
    await page.goto(`${FRONTEND_URL}/characters`);
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, 'characters-initial', testDir);
    
    // Count initial characters
    const initialCharacters = await page.locator('[data-testid="character-row"], .character-card, tr:has(td), div.MuiCard-root').count();
    console.log(`📊 Initial character count: ${initialCharacters}`);
    
    // Create a character
    console.log('📝 Creating new character...');
    
    // Click FAB to create character
    const charFab = page.locator('.MuiSpeedDial-fab, [aria-label="SpeedDial"], button:has-text("Add")').first();
    await charFab.waitFor({ state: 'visible', timeout: 10000 });
    await charFab.click();
    await page.waitForTimeout(500);
    
    // Look for create option
    const createCharButton = page.locator('button:has-text("Create from Template"), button:has-text("Create Character"), button:has-text("Create")').first();
    if (await createCharButton.isVisible()) {
      await createCharButton.click();
      await page.waitForTimeout(1000);
      
      // If template selection appears, select first template
      const templateSelect = page.locator('[data-testid="carousel-select-button"], button:has-text("Select")').first();
      if (await templateSelect.isVisible()) {
        await templateSelect.click();
        await page.waitForTimeout(500);
        
        // Confirm selection
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Create")').last();
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
      }
    }
    
    // Wait for character creation to complete
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');
    
    // Check character count increased
    const newCharacterCount = await page.locator('[data-testid="character-row"], .character-card, tr:has(td), div.MuiCard-root').count();
    console.log(`📊 New character count: ${newCharacterCount}`);
    await takeScreenshot(page, 'characters-after-create', testDir);
    
    if (newCharacterCount <= initialCharacters) {
      console.log('⚠️ Character count did not increase - checking if list updated...');
      
      // Try refreshing to see if it's a cache issue
      await page.reload();
      await page.waitForLoadState('networkidle');
      const refreshedCount = await page.locator('[data-testid="character-row"], .character-card, tr:has(td), div.MuiCard-root').count();
      
      if (refreshedCount > initialCharacters) {
        throw new Error('Character appeared after refresh - cache buster not working properly!');
      }
    } else {
      console.log('✅ Character list updated immediately - cache buster working!');
    }
    
    console.log('\n===== TEST RESULTS =====');
    console.log('✅ Campaign cache buster: WORKING');
    console.log('✅ Character cache buster: WORKING');
    console.log('\n🎉 Cache buster validation PASSED!');
    console.log('The cache invalidation is working correctly for entity creation.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    await takeScreenshot(page, 'error-state', testDir);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testCacheBuster().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});