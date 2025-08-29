const { chromium } = require('@playwright/test');
const { loginAsGamemaster } = require('./login-helper');

// Test server configuration
const FRONTEND_BASE = 'http://localhost:3005';

async function testCampaignDeletion() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🧪 Testing Campaign Deletion UI');
    console.log('================================\n');
    
    // Login as gamemaster
    console.log('1. Logging in as gamemaster...');
    await loginAsGamemaster(page, {
      takeScreenshot: true,
      screenshotPath: 'test-results/campaign-deletion',
      screenshotName: 'login'
    });
    
    // Navigate to campaigns page
    console.log('2. Navigating to campaigns page...');
    await page.goto(`${FRONTEND_BASE}/campaigns`);
    await page.waitForLoadState('networkidle');
    
    // Find the Secondary Campaign (safe to delete)
    console.log('3. Looking for Secondary Campaign...');
    
    // Click on Secondary Campaign to go to its show page
    const secondaryCampaignLink = page.locator('text="Secondary Campaign"').first();
    if (await secondaryCampaignLink.isVisible()) {
      console.log('4. Clicking on Secondary Campaign...');
      await secondaryCampaignLink.click();
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of campaign show page
      await page.screenshot({
        path: 'test-results/campaign-deletion/campaign-show.png',
        fullPage: true
      });
      
      // Find and click the speed dial menu button
      console.log('5. Looking for speed dial menu...');
      const speedDialButton = page.locator('[aria-label="SpeedDial basic example"]').first();
      if (await speedDialButton.isVisible()) {
        console.log('6. Opening speed dial menu...');
        await speedDialButton.click();
        await page.waitForTimeout(500); // Wait for animation
        
        // Find and click delete action
        const deleteAction = page.locator('[aria-label="Delete"]').first();
        if (await deleteAction.isVisible()) {
          console.log('7. Clicking delete action...');
          
          // Set up dialog handler before clicking delete
          page.once('dialog', async dialog => {
            console.log(`8. First dialog message: "${dialog.message()}"`);
            console.log('   Accepting first confirmation...');
            await dialog.accept();
          });
          
          await deleteAction.click();
          
          // Wait a moment to see if there's a second dialog
          await page.waitForTimeout(2000);
          
          // Check if we're still on the same page or redirected
          const currentUrl = page.url();
          console.log(`9. Current URL after deletion attempt: ${currentUrl}`);
          
          if (currentUrl.includes('/campaigns') && !currentUrl.includes('/campaigns/')) {
            console.log('✅ Successfully redirected to campaigns list!');
            console.log('   Campaign was deleted (no associations)');
          } else if (currentUrl.includes('/campaigns/')) {
            console.log('⚠️ Still on campaign show page');
            console.log('   Deletion may have been blocked by associations');
            
            // Check for any error messages
            const errorToast = page.locator('.MuiAlert-message').first();
            if (await errorToast.isVisible()) {
              const errorText = await errorToast.textContent();
              console.log(`   Error message: ${errorText}`);
            }
          }
          
          // Take final screenshot
          await page.screenshot({
            path: 'test-results/campaign-deletion/after-deletion.png',
            fullPage: true
          });
        } else {
          console.log('❌ Delete action not found in speed dial menu');
        }
      } else {
        console.log('❌ Speed dial menu button not found');
      }
    } else {
      console.log('❌ Secondary Campaign not found in list');
    }
    
    console.log('\n================================');
    console.log('✅ Campaign Deletion UI Test Completed!');
    console.log('================================');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({
      path: 'test-results/campaign-deletion/error.png',
      fullPage: true
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testCampaignDeletion().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});