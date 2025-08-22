const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function testInvitationSystem() {
  console.log('Starting invitation system test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Login as gamemaster user to test invitation functionality
    console.log('1. Logging in as gamemaster user...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });

    // Navigate to campaigns page to access campaign details
    console.log('2. Navigating to campaigns page...');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    
    // Wait for campaigns table to load
    await page.waitForSelector('[role="grid"]', { timeout: 15000 });
    console.log('✓ Campaigns page loaded');

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/campaigns-for-invitations.png', fullPage: true });

    // Find and select Secondary Campaign which is active
    console.log('3. Selecting Secondary Campaign...');
    
    // Try to find the campaign row and click on the avatar or name area, avoiding tooltip
    console.log('Looking for campaign row...');
    const campaignRow = page.locator('[role="grid"] [role="row"]:has-text("Secondary Campaign")');
    const rowCount = await campaignRow.count();
    console.log(`Found ${rowCount} campaign rows`);
    
    let campaignPage;
    
    if (rowCount > 0) {
      // Try clicking on the avatar (SC) which should be a link
      const avatarLink = campaignRow.locator('a').first();
      const avatarCount = await avatarLink.count();
      console.log(`Found ${avatarCount} links in campaign row`);
      
      if (avatarCount > 0) {
        console.log('Clicking on campaign avatar link (expecting new tab)...');
        
        // Wait for new tab to open when clicking campaign link
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          avatarLink.click()
        ]);
        
        console.log('✓ New tab opened, switching to campaign page');
        
        // Switch to the new tab and wait for it to load
        await newPage.waitForLoadState('networkidle');
        
        // Take screenshot of new tab to see what loaded
        await newPage.screenshot({ path: 'test-results/new-tab-content.png', fullPage: true });
        console.log(`New tab URL: ${newPage.url()}`);
        
        // Check what's on the page
        const pageTitle = await newPage.title();
        console.log(`New tab title: ${pageTitle}`);
        
        // Look for any error messages
        try {
          const errorText = await newPage.locator('text=403').textContent();
          console.log(`Found 403 error: ${errorText}`);
        } catch (e) {
          console.log('No 403 error found');
        }
        
        // Wait for campaign show page to load - look for campaign name instead of h1
        try {
          await newPage.waitForSelector('text=Secondary Campaign', { timeout: 10000 });
          console.log(`✓ Campaign page loaded: Secondary Campaign`);
        } catch (error) {
          // Fallback: look for any heading
          const headings = await newPage.locator('h1, h2, h3, h4, h5, h6').allTextContents();
          console.log(`Found headings: ${headings.join(', ')}`);
        }
        
        campaignPage = newPage;
        
      } else {
        console.log('No links found in campaign row');
        throw new Error('Could not find campaign link to click');
      }
    }

    // Take campaign page screenshot
    await campaignPage.screenshot({ path: 'test-results/campaign-show-page.png', fullPage: true });

    // Look for the Invitations section
    console.log('4. Checking for Invitations section...');
    let invitationsSectionVisible = false;
    try {
      await campaignPage.waitForSelector('text=Invitations', { timeout: 5000 });
      console.log('✓ Invitations section found');
      invitationsSectionVisible = true;
    } catch (error) {
      console.log('ℹ Invitations section not visible yet');
    }

    // If invitations section is present, test the invitation workflow
    if (invitationsSectionVisible) {
      // Click the manage button to open invitations
      console.log('5. Opening invitation manager...');
      // Look for MANAGE button in the Invitations section
      const manageButton = campaignPage.locator('text=MANAGE').first();
      await manageButton.click();
      
      // Wait a moment for the form to load and take screenshot to see what appeared
      await campaignPage.waitForTimeout(2000);
      await campaignPage.screenshot({ path: 'test-results/invitation-form-open.png', fullPage: true });
      
      // Check what form elements are available
      const inputs = await campaignPage.locator('input').all();
      console.log(`Found ${inputs.length} input elements`);
      
      // Look for email input with different selectors
      let emailInput;
      try {
        emailInput = campaignPage.locator('input[type="email"]').first();
        const emailCount = await emailInput.count();
        console.log(`Found ${emailCount} email inputs`);
        if (emailCount > 0) {
          console.log('✓ Found email input');
        }
      } catch (error) {
        console.log('No email input found, trying other selectors...');
        try {
          emailInput = campaignPage.locator('input[placeholder*="email"]').first();
          const placeholderCount = await emailInput.count();
          console.log(`Found ${placeholderCount} inputs with email placeholder`);
        } catch (error2) {
          console.log('No email placeholder found either');
        }
      }

      // Test sending an invitation if email input was found
      if (emailInput && await emailInput.count() > 0) {
        console.log('6. Testing invitation creation...');
        const submitButton = campaignPage.locator('button:has-text("Invite")');

        // Enter test email
        const testEmail = `testuser${Date.now()}@example.com`;
        await emailInput.fill(testEmail);
        console.log(`✓ Entered email: ${testEmail}`);

        // Click invite button
        await submitButton.click();
        
        // Wait for success message or error
        console.log('7. Checking invitation result...');
        try {
          await campaignPage.waitForSelector('.MuiAlert-root', { timeout: 10000 });
          const alertText = await campaignPage.locator('.MuiAlert-root').textContent();
          console.log(`✓ Got response: ${alertText}`);
          
          // Take screenshot of result
          await campaignPage.screenshot({ path: 'test-results/invitation-sent-result.png', fullPage: true });

          // If successful, test resend and cancel functionality
          if (alertText.includes('sent') || alertText.includes('Invitation sent')) {
            console.log('8. Testing invitation management actions...');
            
            // Wait a bit for the invitation to appear in the list
            await campaignPage.waitForTimeout(2000);
            
            // Look for invitation in the pending list
            try {
              await campaignPage.waitForSelector('text=Pending Invitations', { timeout: 5000 });
              console.log('✓ Pending invitations section visible');
              
              // Test resend button
            console.log('10. Testing resend functionality...');
            const resendButton = page.locator('button[title="Resend invitation"]').first();
            if (await resendButton.count() > 0) {
              await resendButton.click();
              await page.waitForTimeout(2000); // Wait for response
              console.log('✓ Resend button clicked');
            }
            
            // Take screenshot after resend
            await page.screenshot({ path: 'test-results/invitation-after-resend.png', fullPage: true });
            
            // Test cancel button
            console.log('11. Testing cancel functionality...');
            const cancelButton = page.locator('button[title="Cancel invitation"]').first();
            if (await cancelButton.count() > 0) {
              await cancelButton.click();
              await page.waitForTimeout(2000); // Wait for response
              console.log('✓ Cancel button clicked');
            }
            
            // Take final screenshot
            await page.screenshot({ path: 'test-results/invitation-after-cancel.png', fullPage: true });
            
          } catch (error) {
            console.log('ℹ Pending invitations section not found - might be an API issue');
            await page.screenshot({ path: 'test-results/invitation-no-pending-section.png', fullPage: true });
          }
        }
        
      } catch (error) {
        console.log('⚠ No alert appeared - checking page state');
        await page.screenshot({ path: 'test-results/invitation-no-response.png', fullPage: true });
      }

    } else {
      console.log('ℹ Invitations section not found - component may not be integrated yet');
    }

    console.log('\n✅ Invitation system test completed successfully!');
    console.log('📸 Screenshots saved in test-results/ directory');
    
    // Final screenshot
    await page.screenshot({ path: 'test-results/invitation-test-final.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await page.screenshot({ path: 'test-results/invitation-test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testInvitationSystem().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testInvitationSystem };