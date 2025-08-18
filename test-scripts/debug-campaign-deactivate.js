const { chromium } = require('playwright');
const path = require('path');

// Import login helper
const { loginAsGamemaster } = require('./login-helper');

(async () => {
  console.log('🔍 Debug Campaign Deactivate Test...');
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login
    console.log('🔐 Step 1: User Authentication');
    await loginAsGamemaster(page, {
      takeScreenshot: true,
      screenshotPath: path.join(__dirname, 'test-results')
    });
    
    // Check cookies after login
    const cookies = await page.context().cookies();
    console.log('🍪 Cookies after login:');
    for (const cookie of cookies) {
      console.log(`  - ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
    }
    
    const jwtCookie = cookies.find(c => c.name === 'jwtToken');
    if (!jwtCookie) {
      console.log('❌ No jwtToken cookie found after login!');
    } else {
      console.log('✅ jwtToken cookie found');
    }
    
    // Take screenshot of initial state
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'debug-01-after-login.png'),
      fullPage: true 
    });
    
    // Step 2: Check menu state
    console.log('📋 Step 2: Check initial menu state');
    const menuButton = await page.locator('[aria-label="menu"]');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'debug-02-initial-menu.png'),
      fullPage: true 
    });
    
    const fightMenuExists = await page.locator('text="Fights"').count();
    console.log(`Fights menu count: ${fightMenuExists}`);
    
    // Close menu
    await page.click('body');
    await page.waitForTimeout(500);
    
    // Step 3: Navigate to campaigns with more detailed debugging
    console.log('🏠 Step 3: Navigate to Campaigns page');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Try clicking campaigns
    const campaignsMenuItem = page.locator('a[href="/campaigns"]').first();
    const campaignsExists = await campaignsMenuItem.count();
    console.log(`Campaigns menu item count: ${campaignsExists}`);
    
    if (campaignsExists > 0) {
      console.log('Clicking campaigns menu item...');
      await campaignsMenuItem.click();
      await page.waitForTimeout(3000);
      
      console.log(`Current URL after campaigns click: ${page.url()}`);
      
      // Check if we're still authenticated by looking at cookies again
      const cookiesAfterNav = await page.context().cookies();
      const jwtAfterNav = cookiesAfterNav.find(c => c.name === 'jwtToken');
      if (!jwtAfterNav) {
        console.log('❌ jwtToken cookie missing after navigation!');
      } else {
        console.log('✅ jwtToken still present after navigation');
      }
      
      await page.screenshot({ 
        path: path.join(__dirname, 'test-results', 'debug-03-campaigns-page.png'),
        fullPage: true 
      });
      
      // Check for deactivate buttons
      const deactivateButtons = await page.locator('button:has-text("Deactivate")').count();
      const activateButtons = await page.locator('button:has-text("Activate")').count();
      console.log(`Deactivate buttons found: ${deactivateButtons}`);
      console.log(`Activate buttons found: ${activateButtons}`);
      
      // Look for all buttons
      const allButtons = await page.locator('button').all();
      console.log('All buttons found:');
      for (const button of allButtons) {
        const text = await button.textContent();
        const visible = await button.isVisible();
        console.log(`  - "${text}" (visible: ${visible})`);
      }
      
      // Look for table content
      const tableRows = await page.locator('tr').count();
      console.log(`Table rows found: ${tableRows}`);
      
      if (tableRows > 0) {
        const rows = await page.locator('tr').all();
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
          const rowText = await rows[i].textContent();
          console.log(`Row ${i}: "${rowText}"`);
        }
      }
    } else {
      console.log('❌ No campaigns menu item found');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'debug-ERROR.png'),
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
})();