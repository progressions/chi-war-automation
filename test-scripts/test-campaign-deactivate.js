const { chromium } = require('playwright');
const path = require('path');

// Import login helper
const { loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
(async () => {
  console.log('Starting campaign deactivate test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login as gamemaster
    console.log('Logging in as gamemaster...');
    await loginAsGamemaster(page);
    
    // Step 2: Navigate to campaigns page
    console.log('Navigating to campaigns page...');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await page.waitForTimeout(2000);
    
    // Take screenshot of campaigns page
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'campaigns-before-deactivate.png'),
      fullPage: true 
    });
    
    // Step 3: Look for deactivate buttons
    console.log('Looking for deactivate buttons...');
    const deactivateButtons = await page.locator('button:has-text("Deactivate")').count();
    console.log(`Found ${deactivateButtons} deactivate buttons`);
    
    if (deactivateButtons > 0) {
      // Step 4: Click first deactivate button
      console.log('Clicking first deactivate button...');
      await page.locator('button:has-text("Deactivate")').first().click();
      
      // Handle confirmation dialog
      await page.waitForTimeout(1000);
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
      });
      
      // Wait for action to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot after deactivation
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'campaigns-after-deactivate.png'),
        fullPage: true 
      });
      
      console.log('Deactivate test completed successfully');
    } else {
      console.log('No deactivate buttons found - checking if campaigns exist...');
      
      const campaignRows = await page.locator('[role="row"]').count();
      console.log(`Found ${campaignRows} campaign rows`);
      
      // Take screenshot showing no deactivate buttons
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'campaigns-no-deactivate-buttons.png'),
        fullPage: true 
      });
    }
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'campaign-deactivate-error.png'),
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();