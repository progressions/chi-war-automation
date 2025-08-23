const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testCampaignReloadFixed() {
  console.log('🚀 Testing Fixed Campaign List Reload');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login as gamemaster
    await loginAsGamemaster(page, { takeScreenshot: false });
    
    // Go to campaigns page and create a new campaign
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForLoadState('networkidle');
    
    // Check if we have the onboarding CTA or regular create button
    let createButton = null;
    const selectors = [
      'text="Create Your First Campaign"',
      'button:has-text("Create")',
    ];
    
    for (const selector of selectors) {
      try {
        createButton = await page.waitForSelector(selector, { timeout: 2000 });
        if (createButton) {
          console.log(`✅ Found create button: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!createButton) {
      console.log('❌ No create button found');
      return;
    }
    
    // Click create button
    await createButton.click();
    console.log('👆 Clicked create button');
    
    // Wait for form and fill it
    await page.waitForSelector('form', { timeout: 5000 });
    
    const campaignName = `Test Campaign Reload ${Date.now()}`;
    const nameInput = await page.waitForSelector('input[name="name"], [label*="Name" i] input, input[placeholder*="name" i]');
    await nameInput.fill(campaignName);
    console.log(`📝 Filled campaign name: ${campaignName}`);
    
    // Submit form
    const submitButton = await page.waitForSelector('button[type="submit"], button:has-text("Save")');
    await submitButton.click();
    console.log('💾 Submitted form');
    
    // Wait for form to close and check if campaign appears
    console.log('⏳ Waiting 8 seconds for reload mechanism...');
    await page.waitForTimeout(8000);
    
    // Check if campaign appears on page
    const pageContent = await page.textContent('body');
    if (pageContent.includes(campaignName)) {
      console.log(`✅ SUCCESS: Campaign "${campaignName}" found on page!`);
    } else {
      console.log(`❌ FAILURE: Campaign "${campaignName}" NOT found on page`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCampaignReloadFixed();