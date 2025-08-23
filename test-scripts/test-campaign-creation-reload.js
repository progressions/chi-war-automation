const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { loginAsGamemaster } = require('./login-helper');

// Test configuration
const TEST_URL = 'http://localhost:3005';
const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'campaign-creation-reload');

async function ensureScreenshotDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

async function testCampaignCreationReload() {
  console.log('🚀 Testing Campaign Creation List Reload');
  console.log(`📸 Screenshots: ${SCREENSHOTS_DIR}`);
  
  await ensureScreenshotDir();
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login as gamemaster
    console.log('🔐 Logging in as gamemaster...');
    await loginAsGamemaster(page, { takeScreenshot: true, screenshotPath: SCREENSHOTS_DIR });
    
    // Navigate to campaigns page
    console.log('📍 Navigating to campaigns page...');
    await page.goto(`${TEST_URL}/campaigns?sort=created_at&order=desc&page=1&search=`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-campaigns-list-before.png') });
    
    // Count existing campaigns
    const beforeCount = await page.locator('tr').count();
    console.log(`📊 Campaigns before: ${beforeCount - 1} (excluding header)`); // -1 for header row
    
    // Click create campaign button
    console.log('🆕 Clicking Create Campaign button...');
    await page.click('button:has-text("Create Campaign")');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-campaign-form-opened.png') });
    
    // Fill campaign form
    console.log('📝 Filling campaign form...');
    const campaignName = `Test Campaign ${Date.now()}`;
    await page.fill('input[placeholder*="Campaign name" i], input[name="name"]', campaignName);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-campaign-form-filled.png') });
    
    // Submit form
    console.log('💾 Submitting campaign form...');
    await page.click('button[type="submit"]:has-text("Save")');
    
    // Wait briefly for form to close and ActionCable to work
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-after-creation-wait.png') });
    
    // Check if campaign appears in list WITHOUT page refresh
    console.log(`🔍 Looking for campaign "${campaignName}" in list...`);
    const campaignVisible = await page.locator(`text="${campaignName}"`).isVisible({ timeout: 5000 });
    
    if (campaignVisible) {
      console.log('✅ SUCCESS: Campaign appeared in list immediately (ActionCable working)');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-campaign-found-success.png') });
      return true;
    } else {
      console.log('⚠️ Campaign not visible immediately, trying page refresh...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-after-refresh.png') });
      
      const campaignVisibleAfterRefresh = await page.locator(`text="${campaignName}"`).isVisible({ timeout: 3000 });
      if (campaignVisibleAfterRefresh) {
        console.log('⚠️ PARTIAL SUCCESS: Campaign appeared after refresh (ActionCable NOT working)');
        return false;
      } else {
        console.log('❌ FAILURE: Campaign not found even after refresh');
        return false;
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'ERROR-final-state.png') });
    return false;
  } finally {
    await context.close();
    await browser.close();
  }
}

// Run the test
testCampaignCreationReload().then(success => {
  if (success) {
    console.log('🎉 Test completed successfully - ActionCable reload is working!');
    process.exit(0);
  } else {
    console.log('⚠️ Test completed but ActionCable reload needs investigation');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});