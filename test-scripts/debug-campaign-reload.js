const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testCampaignReload() {
  console.log('🚀 Testing Campaign List Reload After Creation');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login as existing gamemaster
    console.log('🔐 Logging in as gamemaster...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Go to campaigns page
    console.log('📋 Navigating to campaigns page...');
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of current campaigns
    await page.screenshot({ path: 'test-results/campaigns-before.png' });
    console.log('📸 Screenshot: campaigns-before.png');
    
    // Click "Create Your First Campaign" or campaign creation button
    console.log('🆕 Looking for campaign creation button...');
    const createButtons = [
      'text="Create Your First Campaign"',
      'text="Create Campaign"',
      'button:has-text("Create")',
      '[data-testid="create-campaign"]'
    ];
    
    let createButton = null;
    for (const selector of createButtons) {
      try {
        createButton = await page.waitForSelector(selector, { timeout: 2000 });
        console.log(`✅ Found create button: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!createButton) {
      console.log('❌ No campaign creation button found');
      // Let's see what's actually on the page
      const pageContent = await page.textContent('body');
      console.log('📋 Checking page content for buttons and text...');
      
      if (pageContent.includes('Create')) {
        console.log('✅ Found "Create" text somewhere');
      }
      if (pageContent.includes('Campaign')) {
        console.log('✅ Found "Campaign" text somewhere');
      }
      if (pageContent.includes('New')) {
        console.log('✅ Found "New" text somewhere');
      }
      
      // Check for any buttons on the page
      const allButtons = await page.locator('button').all();
      console.log(`🔘 Found ${allButtons.length} buttons on page`);
      for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
        const buttonText = await allButtons[i].textContent();
        console.log(`  Button ${i + 1}: "${buttonText}"`);
      }
      
      return;
    }
    
    // Click the create button
    await createButton.click();
    console.log('👆 Clicked campaign creation button');
    
    // Wait for form to appear
    await page.waitForSelector('form', { timeout: 5000 });
    await page.screenshot({ path: 'test-results/campaign-form.png' });
    console.log('📸 Screenshot: campaign-form.png');
    
    // Fill campaign name
    const campaignName = `Test Campaign ${Date.now()}`;
    console.log(`📝 Filling campaign name: ${campaignName}`);
    
    const nameInput = await page.waitForSelector('input[name="name"], [label*="Name" i] input, input[placeholder*="name" i]');
    await nameInput.fill(campaignName);
    
    // Submit the form
    console.log('💾 Submitting campaign form...');
    const submitButton = await page.waitForSelector('button[type="submit"], button:has-text("Save")');
    await submitButton.click();
    
    // Wait for form to close
    console.log('⏳ Waiting for form to close...');
    await page.waitForTimeout(2000);
    
    // Take screenshot after submission
    await page.screenshot({ path: 'test-results/after-campaign-submit.png' });
    console.log('📸 Screenshot: after-campaign-submit.png');
    
    // Now wait and check if campaign appears in list
    console.log('🔍 Looking for created campaign in list...');
    console.log('⏱️ Waiting 5 seconds for reload...');
    await page.waitForTimeout(5000);
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/campaigns-after.png' });
    console.log('📸 Screenshot: campaigns-after.png');
    
    // Check if campaign name appears on page
    const pageText = await page.textContent('body');
    if (pageText.includes(campaignName)) {
      console.log(`✅ SUCCESS: Campaign "${campaignName}" found on page!`);
    } else {
      console.log(`❌ FAILURE: Campaign "${campaignName}" NOT found on page`);
      console.log('Debug: Checking for any campaign-related text...');
      if (pageText.toLowerCase().includes('campaign')) {
        console.log('📋 Found "campaign" text on page');
      }
      // Log a sample of page content
      console.log('Sample page content:', pageText.substring(0, 300) + '...');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/error-campaign-test.png' });
  } finally {
    await browser.close();
  }
}

testCampaignReload();