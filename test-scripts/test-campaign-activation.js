const { chromium } = require('playwright');
const { loginAsPlayer } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function testCampaignActivation() {
  console.log('Starting campaign activation test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login as player user to test campaign activation from player perspective
    console.log('1. Logging in as player user...');
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });

    // Navigate to campaigns page
    console.log('2. Navigating to campaigns page...');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    
    // Wait for campaigns table to load
    await page.waitForSelector('[role="grid"]', { timeout: 15000 });
    console.log('✓ Campaigns page loaded');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/campaigns-initial.png', fullPage: true });

    // Check that campaigns table is visible with expected columns
    console.log('3. Verifying table structure...');
    const headers = await page.locator('[role="columnheader"]').allTextContents();
    console.log('Table headers:', headers);
    
    if (!headers.includes('Status') || !headers.includes('Actions')) {
      throw new Error('Missing Status or Actions columns in campaigns table');
    }
    console.log('✓ Status and Actions columns found');

    // Find all campaigns and their current status
    console.log('4. Analyzing campaign states...');
    const campaigns = await page.locator('[role="grid"] [role="row"]:not(:first-child)').all();
    
    let activeCampaign = null;
    let inactiveCampaigns = [];
    
    for (let i = 0; i < campaigns.length; i++) {
      const row = campaigns[i];
      const campaignName = await row.locator('[role="gridcell"]').nth(1).textContent();
      const statusCell = row.locator('[role="gridcell"]').nth(3);
      const actionCell = row.locator('[role="gridcell"]').nth(4);
      
      // Debug: Get the actual text content
      const statusText = await statusCell.textContent();
      const actionText = await actionCell.textContent();
      console.log(`  Campaign: ${campaignName.trim()}, Status: "${statusText}", Action: "${actionText}"`);
      
      // Check for active status (green chip with "Active" text)
      const hasActiveChip = await statusCell.locator('text=Active').count() > 0;
      // Check for activate button (says "Activate" for inactive campaigns)
      const hasActivateButton = await actionCell.locator('button:has-text("Activate")').count() > 0;
      
      if (hasActivateButton) {
        inactiveCampaigns.push({ index: i, name: campaignName.trim(), row });
        console.log(`  -> Detected as INACTIVE campaign: ${campaignName.trim()}`);
      } else if (hasActiveChip) {
        activeCampaign = { index: i, name: campaignName.trim(), row };
        console.log(`  -> Detected as ACTIVE campaign: ${campaignName.trim()}`);
      } else {
        console.log(`  -> Could not classify campaign: ${campaignName.trim()}`);
      }
    }

    if (!activeCampaign) {
      throw new Error('No active campaign found');
    }
    
    if (inactiveCampaigns.length === 0) {
      throw new Error('No inactive campaigns found to test activation');
    }

    console.log(`✓ Found 1 active campaign and ${inactiveCampaigns.length} inactive campaigns`);

    // Test activating an inactive campaign
    console.log('5. Testing campaign activation...');
    const campaignToActivate = inactiveCampaigns[0];
    console.log(`Activating campaign: ${campaignToActivate.name}`);

    // Click the activate button
    const activateButton = campaignToActivate.row.locator('[role="gridcell"]').nth(4).locator('button:has-text("Activate")');
    await activateButton.click();

    // Wait for the UI to update (check for toast notification)
    console.log('6. Waiting for activation to complete...');
    await page.waitForSelector('[role="alert"]:has-text("activated")', { timeout: 10000 });
    console.log('✓ Success toast notification appeared');

    // Take screenshot after activation
    await page.screenshot({ path: 'test-results/campaigns-after-activation.png', fullPage: true });

    // Verify the campaign status has changed
    console.log('7. Verifying status changes...');
    
    // Wait a moment for the UI to update
    await page.waitForTimeout(1000);

    // Check that the previously inactive campaign is now active
    const newActiveCampaign = campaigns[campaignToActivate.index];
    const newStatusCell = newActiveCampaign.locator('[role="gridcell"]').nth(3);
    const newActionCell = newActiveCampaign.locator('[role="gridcell"]').nth(4);
    
    const hasActiveChipNow = await newStatusCell.locator('text=Active').count() > 0;
    const hasActiveButtonNow = await newActionCell.locator('button:has-text("Active")').count() > 0;
    
    if (!hasActiveChipNow || !hasActiveButtonNow) {
      throw new Error(`Campaign ${campaignToActivate.name} was not properly activated`);
    }
    
    console.log(`✓ Campaign ${campaignToActivate.name} is now active`);

    // Check that the previously active campaign is now inactive
    const previousActiveCampaign = campaigns[activeCampaign.index];
    const prevStatusCell = previousActiveCampaign.locator('[role="gridcell"]').nth(3);
    const prevActionCell = previousActiveCampaign.locator('[role="gridcell"]').nth(4);
    
    const hasInactiveChipNow = await prevStatusCell.locator('text=Inactive').count() > 0;
    const hasActivateButtonNow = await prevActionCell.locator('button:has-text("Activate")').count() > 0;
    
    if (!hasInactiveChipNow || !hasActivateButtonNow) {
      throw new Error(`Previous active campaign ${activeCampaign.name} was not properly deactivated`);
    }
    
    console.log(`✓ Previous campaign ${activeCampaign.name} is now inactive`);

    // Test that the new active campaign button is disabled
    console.log('8. Verifying active campaign button is disabled...');
    const activeButton = newActionCell.locator('button:has-text("Active")');
    const isDisabled = await activeButton.isDisabled();
    
    if (!isDisabled) {
      throw new Error('Active campaign button should be disabled');
    }
    
    console.log('✓ Active campaign button is properly disabled');

    console.log('\n🎉 ALL TESTS PASSED! Campaign activation functionality is working correctly.');
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/campaigns-test-complete.png', fullPage: true });

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'test-results/campaigns-test-error.png', fullPage: true });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testCampaignActivation().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});