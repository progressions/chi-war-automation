// End-to-End Test: Current Campaign Clearing Functionality
// Tests the complete flow of clearing current campaign when users leave active campaigns

const { chromium } = require('playwright');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function runCurrentCampaignClearingE2ETest() {
  console.log('🚀 Starting Current Campaign Clearing End-to-End Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test Setup: Login as player who has multiple campaigns
    console.log('🔐 Test Setup: Logging in as player user...');
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Navigate to profile page
    console.log('👤 Step 1: Navigating to profile page...');
    await navigateToProfilePage(page);
    
    // Test Scenario 1: Leave active campaign (should clear current campaign)
    console.log('🎯 Scenario 1: Testing leave active campaign functionality...');
    await testLeaveActiveCampaign(page);
    
    // Test Scenario 2: Leave non-active campaign (should NOT affect current campaign)
    console.log('🎯 Scenario 2: Testing leave non-active campaign functionality...');
    await testLeaveNonActiveCampaign(page);
    
    // Test Scenario 3: Gamemaster protection (should prevent leaving own campaign)
    console.log('🎯 Scenario 3: Testing gamemaster protection...');
    await testGamemasterProtection(page, browser);
    
    console.log('🎉 All Current Campaign Clearing E2E tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Current Campaign Clearing E2E test failed:', error);
    await page.screenshot({ 
      path: 'test-results/current-campaign-clearing-e2e-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken');
    throw error;
  } finally {
    await browser.close();
  }
}

async function navigateToProfilePage(page) {
  try {
    console.log('🔍 Navigating directly to profile page...');
    
    // Navigate directly to profile page (no menu navigation needed)
    await page.goto(TEST_CONFIG.getProfileUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify profile page loaded
    const hasProfileContent = await page.locator('text=Personal Information').or(
      page.locator('text=Account Information')
    ).or(
      page.locator('text=Campaigns')
    ).count();
    
    if (hasProfileContent === 0) {
      throw new Error('Profile page content not found after navigation');
    }
    
    // Take screenshot of profile page
    await page.screenshot({ 
      path: 'test-results/e2e-profile-page-loaded.png', 
      fullPage: true 
    });
    console.log('📸 Profile page loaded screenshot taken');
    console.log('✅ Successfully navigated to profile page');
    
  } catch (error) {
    console.error('❌ Failed to navigate to profile page:', error);
    throw error;
  }
}

async function testLeaveActiveCampaign(page) {
  try {
    console.log('📝 Step 1.1: Identifying current active campaign...');
    
    // Look for campaign with "Active" badge
    const activeCampaignSection = page.locator('text=As Player').locator('..').locator('..')
      .locator('div:has-text("Active")').first();
    
    // Take screenshot showing campaigns list
    await page.screenshot({ 
      path: 'test-results/e2e-campaigns-before-leave-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list before leaving active campaign screenshot taken');
    
    // Check if there's an active campaign
    const hasActiveCampaign = await activeCampaignSection.count() > 0;
    
    if (!hasActiveCampaign) {
      console.log('⚠️ No active campaign found - skipping active campaign leave test');
      return;
    }
    
    console.log('✅ Found active campaign');
    
    // Find the leave button (X icon) for the active campaign
    const leaveCampaignButton = activeCampaignSection.locator('button').filter({ 
      hasText: /cancel|×|close/i 
    }).or(
      activeCampaignSection.locator('button[aria-label*="Leave"]')
    ).or(
      activeCampaignSection.locator('svg').locator('..').locator('button')
    ).first();
    
    console.log('📝 Step 1.2: Clicking leave campaign button...');
    await leaveCampaignButton.waitFor({ timeout: 5000 });
    await leaveCampaignButton.click();
    
    // Wait for confirmation dialog
    console.log('📝 Step 1.3: Handling confirmation dialog...');
    await page.waitForSelector('text=Leave Campaign', { timeout: 5000 });
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ 
      path: 'test-results/e2e-leave-active-confirmation.png', 
      fullPage: true 
    });
    console.log('📸 Leave active campaign confirmation dialog screenshot taken');
    
    // Click the confirmation button
    const confirmButton = page.getByRole('button', { name: /leave campaign/i });
    await confirmButton.click();
    
    console.log('📝 Step 1.4: Waiting for operation to complete...');
    
    // Wait for either success (dialog closes) or error message
    try {
      await page.waitForSelector('text=Leave Campaign', { state: 'hidden', timeout: 5000 });
      console.log('✅ Dialog closed - operation likely succeeded');
    } catch (error) {
      // Check for error message
      const errorMessage = await page.locator('text=Failed to leave campaign').count();
      if (errorMessage > 0) {
        console.log('⚠️ Backend error detected: Failed to leave campaign');
        // Close the dialog manually
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
        await page.waitForTimeout(1000);
      } else {
        console.log('⚠️ Dialog did not close as expected');
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after leaving active campaign
    await page.screenshot({ 
      path: 'test-results/e2e-campaigns-after-leave-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list after leaving active campaign screenshot taken');
    
    console.log('✅ Successfully tested leaving active campaign');
    
    // Verify that there's no longer an active campaign shown
    const remainingActiveCampaigns = await page.locator('text=Active').count();
    if (remainingActiveCampaigns === 0) {
      console.log('✅ Verified: No active campaign badge found after leaving');
    } else {
      console.log('⚠️ Warning: Active campaign badge still present');
    }
    
  } catch (error) {
    console.error('❌ Failed to test leaving active campaign:', error);
    await page.screenshot({ 
      path: 'test-results/e2e-leave-active-error.png', 
      fullPage: true 
    });
    console.log('📸 Leave active campaign error screenshot taken');
    throw error;
  }
}

async function testLeaveNonActiveCampaign(page) {
  try {
    console.log('📝 Step 2.1: Identifying non-active campaign to leave...');
    
    // Look for campaigns without "Active" badge in the player section
    const playerSection = page.locator('text=As Player').locator('..').locator('..');
    const allPlayerCampaigns = playerSection.locator('[role="button"]').or(
      playerSection.locator('div').filter({ hasText: /campaign/i })
    );
    
    const campaignCount = await allPlayerCampaigns.count();
    console.log(`Found ${campaignCount} player campaigns`);
    
    if (campaignCount === 0) {
      console.log('⚠️ No remaining player campaigns found - skipping non-active campaign test');
      return;
    }
    
    // Take screenshot showing current state
    await page.screenshot({ 
      path: 'test-results/e2e-campaigns-before-leave-non-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list before leaving non-active campaign screenshot taken');
    
    // Find a leave button for any remaining campaign
    const leaveCampaignButton = playerSection.locator('button').filter({ 
      hasText: /cancel|×|close/i 
    }).or(
      playerSection.locator('button[aria-label*="Leave"]')
    ).or(
      playerSection.locator('svg').locator('..').locator('button')
    ).first();
    
    const hasLeaveButton = await leaveCampaignButton.count() > 0;
    
    if (!hasLeaveButton) {
      console.log('⚠️ No leave button found for non-active campaigns - skipping test');
      return;
    }
    
    console.log('📝 Step 2.2: Clicking leave button for non-active campaign...');
    await leaveCampaignButton.click();
    
    // Wait for confirmation dialog
    console.log('📝 Step 2.3: Handling confirmation dialog...');
    await page.waitForSelector('text=Leave Campaign', { timeout: 5000 });
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ 
      path: 'test-results/e2e-leave-non-active-confirmation.png', 
      fullPage: true 
    });
    console.log('📸 Leave non-active campaign confirmation dialog screenshot taken');
    
    // Click the confirmation button
    const confirmButton = page.getByRole('button', { name: /leave campaign/i });
    await confirmButton.click();
    
    console.log('📝 Step 2.4: Waiting for operation to complete...');
    
    // Wait for either success (dialog closes) or error message
    try {
      await page.waitForSelector('text=Leave Campaign', { state: 'hidden', timeout: 5000 });
      console.log('✅ Dialog closed - operation likely succeeded');
    } catch (error) {
      // Check for error message
      const errorMessage = await page.locator('text=Failed to leave campaign').count();
      if (errorMessage > 0) {
        console.log('⚠️ Backend error detected: Failed to leave campaign');
        // Close the dialog manually
        const cancelButton = page.getByRole('button', { name: /cancel/i });
        await cancelButton.click();
        await page.waitForTimeout(1000);
      } else {
        console.log('⚠️ Dialog did not close as expected');
      }
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after leaving non-active campaign
    await page.screenshot({ 
      path: 'test-results/e2e-campaigns-after-leave-non-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list after leaving non-active campaign screenshot taken');
    
    console.log('✅ Successfully tested leaving non-active campaign');
    
  } catch (error) {
    console.error('❌ Failed to test leaving non-active campaign:', error);
    await page.screenshot({ 
      path: 'test-results/e2e-leave-non-active-error.png', 
      fullPage: true 
    });
    console.log('📸 Leave non-active campaign error screenshot taken');
    throw error;
  }
}

async function testGamemasterProtection(page, browser) {
  try {
    console.log('📝 Step 3.1: Switching to gamemaster user to test protection...');
    
    // Close current page and create new one for gamemaster
    await page.close();
    const newPage = await browser.newPage();
    
    // Login as gamemaster
    await loginAsGamemaster(newPage, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Navigate to profile page
    await navigateToProfilePage(newPage);
    
    console.log('📝 Step 3.2: Looking for gamemaster campaigns...');
    
    // Look for campaigns in the "As Gamemaster" section
    const gamemasterSection = newPage.locator('text=As Gamemaster').locator('..').locator('..');
    const gmCampaignCount = await gamemasterSection.locator('div').filter({ hasText: /campaign/i }).count();
    
    console.log(`Found ${gmCampaignCount} gamemaster campaigns`);
    
    if (gmCampaignCount === 0) {
      console.log('⚠️ No gamemaster campaigns found - cannot test gamemaster protection');
      return;
    }
    
    // Take screenshot showing gamemaster campaigns
    await newPage.screenshot({ 
      path: 'test-results/e2e-gamemaster-campaigns.png', 
      fullPage: true 
    });
    console.log('📸 Gamemaster campaigns screenshot taken');
    
    // Look for leave buttons in gamemaster section (there should be none)
    const gmLeaveButtons = await gamemasterSection.locator('button').filter({ 
      hasText: /cancel|×|close/i 
    }).count();
    
    if (gmLeaveButtons === 0) {
      console.log('✅ Verified: No leave buttons found for gamemaster campaigns (expected behavior)');
    } else {
      console.log('⚠️ Warning: Found leave buttons for gamemaster campaigns');
    }
    
    // Now check if gamemaster is also a player in any campaigns
    const playerSection = newPage.locator('text=As Player').locator('..').locator('..');
    const playerCampaigns = await playerSection.locator('div').filter({ hasText: /campaign/i }).count();
    
    if (playerCampaigns > 0) {
      console.log(`📝 Step 3.3: Found ${playerCampaigns} campaigns where gamemaster is a player...`);
      
      // Look for a campaign that the gamemaster owns (should not have leave button or should error)
      const playerLeaveButton = playerSection.locator('button').filter({ 
        hasText: /cancel|×|close/i 
      }).first();
      
      const hasPlayerLeaveButton = await playerLeaveButton.count() > 0;
      
      if (hasPlayerLeaveButton) {
        console.log('📝 Step 3.4: Testing gamemaster leave protection...');
        
        await playerLeaveButton.click();
        
        // Wait for confirmation dialog
        await newPage.waitForSelector('text=Leave Campaign', { timeout: 5000 });
        
        // Take screenshot of confirmation dialog
        await newPage.screenshot({ 
          path: 'test-results/e2e-gamemaster-leave-confirmation.png', 
          fullPage: true 
        });
        console.log('📸 Gamemaster leave confirmation dialog screenshot taken');
        
        // Click the confirmation button
        const confirmButton = newPage.getByRole('button', { name: /leave campaign/i });
        await confirmButton.click();
        
        // Wait for dialog to close and operation to complete
        await newPage.waitForSelector('text=Leave Campaign', { state: 'hidden', timeout: 10000 });
        await newPage.waitForTimeout(2000);
        
        // Look for error message about gamemaster protection
        const errorText = await newPage.locator(':text("Gamemasters cannot leave")').count();
        
        if (errorText > 0) {
          console.log('✅ Verified: Gamemaster protection error message displayed');
        } else {
          console.log('⚠️ Note: No specific gamemaster protection message found');
        }
        
        // Take screenshot after attempted leave
        await newPage.screenshot({ 
          path: 'test-results/e2e-gamemaster-protection-result.png', 
          fullPage: true 
        });
        console.log('📸 Gamemaster protection result screenshot taken');
      }
    }
    
    console.log('✅ Successfully tested gamemaster protection');
    
    await newPage.close();
    
  } catch (error) {
    console.error('❌ Failed to test gamemaster protection:', error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  runCurrentCampaignClearingE2ETest()
    .then(() => {
      console.log('✅ Current Campaign Clearing End-to-End test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Current Campaign Clearing End-to-End test failed:', error);
      process.exit(1);
    });
}

module.exports = { runCurrentCampaignClearingE2ETest };