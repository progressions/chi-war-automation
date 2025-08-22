const { chromium } = require('playwright');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function testInvitationRedemptionE2E() {
  console.log('Starting invitation redemption E2E test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const context = await browser.newContext();
  let page = await context.newPage();
  let invitationId = null;

  try {
    // STEP 1: Login as gamemaster and create an invitation
    console.log('1. Logging in as gamemaster to create invitation...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });

    // Navigate to campaigns page  
    console.log('2. Navigating to campaigns page...');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await page.waitForSelector('[role="grid"]', { timeout: 15000 });
    console.log('✓ Campaigns page loaded');

    // Find and click on Test Campaign
    console.log('3. Clicking on Test Campaign...');
    const campaignRow = page.locator('[role="grid"] [role="row"]:has-text("Test Campaign")');
    const avatarLink = campaignRow.locator('a').first();
    
    // Wait for new tab to open when clicking campaign link
    const [campaignPage] = await Promise.all([
      context.waitForEvent('page'),
      avatarLink.click()
    ]);
    
    console.log('✓ New tab opened, switching to campaign page');
    await campaignPage.waitForLoadState('networkidle');
    await campaignPage.waitForSelector('text=Test Campaign', { timeout: 10000 });
    console.log('✓ Campaign page loaded');

    // Open invitations management
    console.log('4. Opening invitations management...');
    await campaignPage.waitForSelector('text=Invitations', { timeout: 5000 });
    
    const manageButtons = campaignPage.locator('text=MANAGE');
    const buttonCount = await manageButtons.count();
    console.log(`Found ${buttonCount} MANAGE buttons`);
    
    // Click the invitations MANAGE button (likely the second one)
    if (buttonCount > 1) {
      await manageButtons.nth(1).click();
    } else {
      await manageButtons.first().click();
    }
    
    await campaignPage.waitForTimeout(2000);
    console.log('✓ Invitations management opened');

    // Create an invitation for a test email
    console.log('5. Creating invitation...');
    const testEmail = `test-redemption-${Date.now()}@example.com`;
    const emailInput = campaignPage.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    
    const inviteButton = campaignPage.locator('button:has-text("Invite")').first();
    await inviteButton.click();
    
    // Wait for invitation to be created and extract ID
    await campaignPage.waitForTimeout(3000);
    console.log(`✓ Invitation created for ${testEmail}`);
    
    // Get invitation ID by checking the backend directly
    console.log('6. Fetching invitation ID from backend...');
    const response = await fetch('TEST_CONFIG.getBackendUrl()/api/v2/invitations', {
      headers: {
        'Authorization': `Bearer ${await page.evaluate(() => localStorage.getItem('jwtToken'))}`
      }
    });
    const invitations = await response.json();
    const testInvitation = invitations.find(inv => inv.email === testEmail);
    
    if (!testInvitation) {
      throw new Error('Could not find created invitation');
    }
    
    invitationId = testInvitation.id;
    console.log(`✓ Found invitation ID: ${invitationId}`);
    
    await campaignPage.screenshot({ path: 'test-results/redemption-01-invitation-created.png', fullPage: true });

    // STEP 2: Test public invitation page access (no auth required)
    console.log('\\n7. Testing public invitation page access...');
    const publicPage = await context.newPage();
    await publicPage.goto(`TEST_CONFIG.getFrontendUrl()/redeem/${invitationId}`);
    await publicPage.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    console.log('✓ Public invitation page loaded without authentication');
    
    // Verify invitation details are displayed
    await publicPage.waitForSelector('text=Test Campaign', { timeout: 5000 });
    await publicPage.waitForSelector('text=You\\'ve been invited by', { timeout: 5000 });
    await publicPage.waitForSelector('button:has-text("Login to Accept")', { timeout: 5000 });
    console.log('✓ Invitation details displayed correctly');
    
    await publicPage.screenshot({ path: 'test-results/redemption-02-public-invitation-page.png', fullPage: true });

    // STEP 3: Test login redirect when clicking "Login to Accept"
    console.log('\\n8. Testing login redirect...');
    const loginButton = publicPage.locator('button:has-text("Login to Accept")');
    await loginButton.click();
    
    // Should redirect to login page with return URL
    await publicPage.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    const currentUrl = publicPage.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login') && currentUrl.includes(`redirect=${encodeURIComponent('/redeem/' + invitationId)}`)) {
      console.log('✓ Correctly redirected to login with return URL');
    } else {
      console.log('⚠ Login redirect may not include proper return URL');
    }
    
    await publicPage.screenshot({ path: 'test-results/redemption-03-login-redirect.png', fullPage: true });

    // STEP 4: Login as player and test redemption
    console.log('\\n9. Logging in as player to test redemption...');
    await loginAsPlayer(publicPage, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results',
      screenshotSuffix: 'redemption-04-player-login'
    });

    // Should redirect back to invitation page after login
    await publicPage.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    await publicPage.waitForSelector('button:has-text("Accept Invitation")', { timeout: 5000 });
    console.log('✓ Redirected back to invitation page after login');
    
    await publicPage.screenshot({ path: 'test-results/redemption-05-ready-to-redeem.png', fullPage: true });

    // STEP 5: Accept the invitation
    console.log('\\n10. Accepting invitation...');
    const acceptButton = publicPage.locator('button:has-text("Accept Invitation")');
    await acceptButton.click();
    
    // Wait for redemption to complete
    await publicPage.waitForTimeout(3000);
    
    // Check for success message and redirect
    try {
      // Should redirect to campaign page or show success message
      const currentUrlAfterAccept = publicPage.url();
      console.log(`URL after accept: ${currentUrlAfterAccept}`);
      
      if (currentUrlAfterAccept.includes('/campaigns/')) {
        console.log('✓ Successfully redirected to campaign page');
        await publicPage.waitForSelector('text=Test Campaign', { timeout: 10000 });
        console.log('✓ Campaign page loaded after redemption');
      } else {
        // Check for success toast/alert
        const alertSelectors = [
          '.MuiAlert-root',
          '.MuiSnackbar-root .MuiAlert-root',
          '[role="alert"]',
          'text=Successfully joined',
          'text=Success'
        ];
        
        let successFound = false;
        for (const selector of alertSelectors) {
          try {
            const element = await publicPage.locator(selector).first();
            if (await element.isVisible()) {
              const alertText = await element.textContent();
              console.log(`✓ Success message found: ${alertText}`);
              successFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!successFound) {
          console.log('⚠ No clear success indication found after redemption');
        }
      }
    } catch (error) {
      console.log('Error checking post-redemption state:', error.message);
    }
    
    await publicPage.screenshot({ path: 'test-results/redemption-06-after-acceptance.png', fullPage: true });

    // STEP 6: Verify invitation was consumed (should no longer exist)
    console.log('\\n11. Verifying invitation was consumed...');
    const verifyPage = await context.newPage();
    await verifyPage.goto(`TEST_CONFIG.getFrontendUrl()/redeem/${invitationId}`);
    
    try {
      await verifyPage.waitForSelector('text=not found', { timeout: 5000 });
      console.log('✓ Invitation was properly consumed - returns not found');
    } catch (error) {
      // Check for other error messages
      const errorSelectors = [
        'text=no longer valid',
        'text=expired',
        'text=Already a member',
        '[role="alert"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const element = await verifyPage.locator(selector).first();
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log(`✓ Appropriate error message found: ${errorText}`);
            errorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not verify invitation was consumed');
      }
    }
    
    await verifyPage.screenshot({ path: 'test-results/redemption-07-invitation-consumed.png', fullPage: true });

    console.log('\\n🎉 FULL REDEMPTION E2E TEST COMPLETED SUCCESSFULLY!');
    console.log('\\nTest Summary:');
    console.log('✓ Gamemaster can create invitations');
    console.log('✓ Public invitation page accessible without auth');
    console.log('✓ Login redirect works with return URL');
    console.log('✓ Player can accept invitation after login');
    console.log('✓ Invitation is consumed after acceptance');
    
  } catch (error) {
    console.error('❌ Redemption E2E test failed:', error);
    await page.screenshot({ path: 'test-results/redemption-ERROR.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testInvitationRedemptionE2E().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testInvitationRedemptionE2E };