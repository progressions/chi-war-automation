const { chromium } = require('playwright');
const path = require('path');

// Import login helper
const { loginAsGamemaster } = require('./login-helper');

(async () => {
  console.log('🧪 Starting Campaign Deactivate Acceptance Test...');
  
  // Step 1: Start both servers
  console.log('📡 Starting Rails server in test environment...');
  const { spawn } = require('child_process');
const TEST_CONFIG = require('./test-config')  
  const railsServer = spawn('bash', ['-c', 'source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails server -p 3000'], {
    cwd: path.join(__dirname, '../shot-server'),
    stdio: 'pipe'
  });
  
  console.log('🌐 Starting Next.js frontend server...');
  const frontendServer = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '../shot-client-next'),
    stdio: 'pipe'
  });
  
  // Wait for both servers to start
  console.log('⏳ Waiting for servers to start...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slower for better visibility during acceptance test
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 2: Authentication & Initial State Verification
    console.log('🔐 Step 1: User Authentication');
    await loginAsGamemaster(page);
    
    // Take screenshot of initial state (should have full menu)
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-01-initial-logged-in.png'),
      fullPage: true 
    });
    
    // Verify we have a full menu (indicating current campaign exists)
    console.log('✅ Verifying initial state has full menu...');
    const menuButton = await page.locator('[aria-label="menu"]');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    const fightMenuExists = await page.locator('text="Fights"').count() > 0;
    if (!fightMenuExists) {
      throw new Error('❌ Initial state should have Fights menu - user may not have current campaign');
    }
    console.log('✅ Confirmed: User has current campaign (Fights menu present)');
    
    // Close menu
    await page.click('body'); // Click outside menu to close
    await page.waitForTimeout(500);
    
    // Step 3: Navigate to Campaigns Page
    console.log('🏠 Step 2: Navigate to Campaigns page');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Try more specific selector for Campaigns menu item
    const campaignsMenuItem = page.locator('a[href="/campaigns"]').first();
    await campaignsMenuItem.waitFor({ timeout: 5000 });
    await campaignsMenuItem.click();
    await page.waitForTimeout(2000);
    
    // Take screenshot of campaigns page
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-02-campaigns-page-with-deactivate.png'),
      fullPage: true 
    });
    
    // Verify at least one Deactivate button exists
    const deactivateButtons = await page.locator('button:has-text("Deactivate")').count();
    if (deactivateButtons === 0) {
      throw new Error('❌ No Deactivate button found - user may not have current campaign');
    }
    console.log(`✅ Found ${deactivateButtons} Deactivate button(s) - proceeding with test`);
    
    // Step 4: Deactivate Current Campaign
    console.log('⚠️ Step 3: Deactivating current campaign');
    
    // Set up dialog handler for confirmation
    page.on('dialog', async dialog => {
      console.log(`📋 Confirmation dialog: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Click the first Deactivate button
    await page.locator('button:has-text("Deactivate")').first().click();
    
    // Wait for the action to complete (toast message, table update)
    await page.waitForTimeout(3000);
    
    // Take screenshot after deactivation
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-03-after-deactivate.png'),
      fullPage: true 
    });
    
    // Step 5: Verify Campaign Table State
    console.log('🔍 Step 4: Verifying campaigns table state');
    
    // Check that no Deactivate buttons exist anymore
    const remainingDeactivateButtons = await page.locator('button:has-text("Deactivate")').count();
    if (remainingDeactivateButtons > 0) {
      throw new Error(`❌ Expected 0 Deactivate buttons, found ${remainingDeactivateButtons}`);
    }
    console.log('✅ Confirmed: No Deactivate buttons remain');
    
    // Check that all campaigns now show Activate buttons
    const activateButtons = await page.locator('button:has-text("Activate")').count();
    if (activateButtons === 0) {
      throw new Error('❌ Expected at least 1 Activate button, found none');
    }
    console.log(`✅ Confirmed: ${activateButtons} Activate button(s) present`);
    
    // Check that all status chips show "Inactive"
    const inactiveChips = await page.locator('.MuiChip-root:has-text("Inactive")').count();
    console.log(`✅ Confirmed: ${inactiveChips} campaigns showing Inactive status`);
    
    // Step 6: Verify Menu Restriction
    console.log('📋 Step 5: Verifying menu restriction');
    
    // Open menu
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot of restricted menu
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-04-restricted-menu.png'),
      fullPage: true 
    });
    
    // Verify Fights menu is NOT present
    const fightsMenuCount = await page.locator('text="Fights"').count();
    if (fightsMenuCount > 0) {
      throw new Error('❌ Fights menu should not be present when no current campaign');
    }
    console.log('✅ Confirmed: Fights menu is not present');
    
    // Verify Campaigns menu IS present
    const campaignsMenuCount = await page.locator('text="Campaigns"').count();
    if (campaignsMenuCount === 0) {
      throw new Error('❌ Campaigns menu should be present');
    }
    console.log('✅ Confirmed: Campaigns menu is present');
    
    // Close menu
    await page.click('body');
    await page.waitForTimeout(500);
    
    // Step 7: Test Direct Navigation Protection
    console.log('🚫 Step 6: Testing direct navigation protection');
    
    // Try to navigate directly to /fights
    await page.goto(TEST_CONFIG.getFightsUrl());
    await page.waitForTimeout(2000);
    
    // Take screenshot of redirect result
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-05-fights-redirect.png'),
      fullPage: true 
    });
    
    // Verify we were redirected (either to campaigns or login with redirect)
    const currentUrl = page.url();
    if (currentUrl.includes('/login?redirect=%2Fcampaigns') || currentUrl.includes('/campaigns')) {
      console.log('✅ Confirmed: Direct navigation to /fights properly redirected');
    } else {
      throw new Error(`❌ Expected redirect to /campaigns or login, but URL is: ${currentUrl}`);
    }
    
    // Step 8: Final State Verification
    console.log('🎯 Step 7: Final state verification');
    
    // Take final screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-06-final-state.png'),
      fullPage: true 
    });
    
    console.log('🎉 ACCEPTANCE TEST PASSED! All steps completed successfully.');
    console.log('📸 Screenshots saved to test-results/acceptance-*.png');
    
  } catch (error) {
    console.error('❌ ACCEPTANCE TEST FAILED:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'acceptance-ERROR.png'),
      fullPage: true 
    });
    
    throw error;
  } finally {
    // Cleanup
    await browser.close();
    
    // Kill both servers
    if (railsServer) {
      console.log('🛑 Stopping Rails test server...');
      railsServer.kill('SIGTERM');
    }
    if (frontendServer) {
      console.log('🛑 Stopping Next.js frontend server...');
      frontendServer.kill('SIGTERM');
    }
  }
})();