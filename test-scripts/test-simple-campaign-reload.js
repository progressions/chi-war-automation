const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Test configuration - use existing confirmed user
const TEST_URL = 'http://localhost:3005';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'simple-campaign-reload');
const GM_EMAIL = 'progressions@gmail.com';
const GM_PASSWORD = 'TestPass123!';

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function testSimpleCampaignReload() {
  console.log('🚀 Testing Campaign Creation Reload (Using Existing User)');
  console.log(`📧 Using: ${GM_EMAIL}`);
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Go directly to login page
    console.log('🔐 Going to login page...');
    await page.goto(`${TEST_URL}/login`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png') });
    
    // Login with existing confirmed user
    console.log(`🔐 Logging in as ${GM_EMAIL}...`);
    await page.fill('input[name="email"]', GM_EMAIL);
    await page.fill('input[name="password"]', GM_PASSWORD);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-login-filled.png') });
    
    await page.click('button[type="submit"]');
    
    // Wait for login redirect
    console.log('⏳ Waiting for login redirect...');
    await page.waitForURL(/.*\/campaigns.*/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-after-login.png') });
    
    // Navigate to campaigns page explicitly
    console.log('📍 Navigating to campaigns page...');
    await page.goto(`${TEST_URL}/campaigns?sort=created_at&order=desc&page=1&search=`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-campaigns-page.png') });
    
    // Click create campaign button
    console.log('🆕 Looking for Create Campaign button...');
    
    // Try different possible selectors for the create button
    const createButtonSelectors = [
      'button:has-text("Create Campaign")',
      'button:has-text("Create Your First Campaign")',
      '[data-testid="create-campaign"]',
      'button[type="button"]:has-text("Create")',
      '.create-campaign-btn'
    ];
    
    let buttonFound = false;
    for (const selector of createButtonSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`✅ Found create button with selector: ${selector}`);
        await page.click(selector);
        buttonFound = true;
        break;
      } catch (e) {
        console.log(`⚠️ Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!buttonFound) {
      console.log('❌ Could not find Create Campaign button');
      const bodyText = await page.textContent('body');
      if (bodyText.includes('Create')) {
        console.log('✅ Page contains "Create" text');
      }
      return false;
    }
    
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-form-opened.png') });
    
    // Fill campaign form
    console.log('📝 Filling campaign form...');
    const campaignName = `ActionCable Test Campaign ${Date.now()}`;
    
    const nameInputSelectors = [
      'input[name="name"]',
      'input[placeholder*="name" i]',
      'input[type="text"]:first-child'
    ];
    
    let nameInputFound = false;
    for (const selector of nameInputSelectors) {
      try {
        await page.fill(selector, campaignName);
        console.log(`✅ Filled name with selector: ${selector}`);
        nameInputFound = true;
        break;
      } catch (e) {
        console.log(`⚠️ Name input selector ${selector} not found, trying next...`);
      }
    }
    
    if (!nameInputFound) {
      console.log('❌ Could not find campaign name input');
      return false;
    }
    
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-form-filled.png') });
    
    // Submit form
    console.log('💾 Submitting campaign form...');
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Wait for ActionCable to work
    console.log('⏳ Waiting for ActionCable reload (3 seconds)...');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-after-submit.png') });
    
    // Check if campaign appears in list immediately
    console.log(`🔍 Looking for campaign "${campaignName}" WITHOUT refresh...`);
    const campaignVisible = await page.locator(`text="${campaignName}"`).isVisible({ timeout: 2000 });
    
    if (campaignVisible) {
      console.log('🎉 SUCCESS: Campaign appeared immediately! ActionCable is working!');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08-success-found.png') });
      return true;
    } else {
      console.log('⚠️ Campaign not visible immediately, checking after page refresh...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09-after-refresh.png') });
      
      const campaignVisibleAfterRefresh = await page.locator(`text="${campaignName}"`).isVisible({ timeout: 3000 });
      if (campaignVisibleAfterRefresh) {
        console.log('⚠️ PARTIAL: Campaign found after refresh. ActionCable needs fixing.');
        return false;
      } else {
        console.log('❌ FAILURE: Campaign not found even after refresh');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ERROR-state.png') });
    return false;
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
testSimpleCampaignReload().then(success => {
  if (success) {
    console.log('\n🎉 RESULT: ActionCable campaign list reload is working correctly!');
    process.exit(0);
  } else {
    console.log('\n⚠️ RESULT: ActionCable campaign list reload needs investigation');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});