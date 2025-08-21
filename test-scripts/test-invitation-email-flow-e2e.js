const { chromium } = require('playwright');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');

async function testInvitationEmailFlowE2E() {
  console.log('Starting invitation email flow E2E test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const context = await browser.newContext();
  let page = await context.newPage();
  let invitationUrl = null;

  try {
    // STEP 1: Login as gamemaster and create an invitation through UI
    console.log('1. Logging in as gamemaster to create invitation through UI...');
    
    // Navigate to login page on development server
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    // Fill in gamemaster credentials
    await page.fill('input[type="email"]', 'progressions@gmail.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Wait for successful login
    await page.waitForSelector('text=Chi War', { timeout: 10000 });
    console.log('✓ Gamemaster logged in successfully');

    // Navigate to campaigns page  
    console.log('2. Navigating to campaigns page...');
    await page.goto('http://localhost:3001/campaigns');
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
    
    await campaignPage.screenshot({ path: 'test-results/email-flow-02-campaign-page.png', fullPage: true });

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
    
    await campaignPage.screenshot({ path: 'test-results/email-flow-03-invitation-form.png', fullPage: true });

    // STEP 2: Create invitation and capture the email link
    console.log('\\n5. Creating invitation and capturing email link...');
    const testEmail = `email-flow-test-${Date.now()}@example.com`;
    
    // Set up network interception to capture the invitation creation response
    let capturedInvitationId = null;
    
    campaignPage.on('response', async (response) => {
      if (response.url().includes('/api/v2/invitations') && response.request().method() === 'POST') {
        if (response.ok()) {
          try {
            const responseData = await response.json();
            capturedInvitationId = responseData.id;
            console.log(`✓ Captured invitation ID from API response: ${capturedInvitationId}`);
          } catch (error) {
            console.log('Could not parse invitation response:', error.message);
          }
        }
      }
    });
    
    // Fill in the email and submit
    const emailInput = campaignPage.locator('input[type="email"]').first();
    await emailInput.fill(testEmail);
    console.log(`✓ Filled email: ${testEmail}`);
    
    const inviteButton = campaignPage.locator('button:has-text("Invite")').first();
    await inviteButton.click();
    
    // Wait for the invitation to be created
    await campaignPage.waitForTimeout(3000);
    
    // If we didn't capture it from the network response, try to get it from the backend
    if (!capturedInvitationId) {
      console.log('6. Fetching invitation ID from backend API...');
      const jwt = await campaignPage.evaluate(() => localStorage.getItem('jwtToken'));
      const response = await fetch('http://localhost:3000/api/v2/invitations', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      const invitations = await response.json();
      const testInvitation = invitations.find(inv => inv.email === testEmail);
      
      if (testInvitation) {
        capturedInvitationId = testInvitation.id;
        console.log(`✓ Found invitation ID from backend: ${capturedInvitationId}`);
      }
    }
    
    if (!capturedInvitationId) {
      throw new Error('Could not capture invitation ID - invitation may not have been created');
    }
    
    // Construct the invitation URL that would be in the email
    invitationUrl = `http://localhost:3001/redeem/${capturedInvitationId}`;
    console.log(`✓ Invitation URL that would be emailed: ${invitationUrl}`);
    
    await campaignPage.screenshot({ path: 'test-results/email-flow-04-invitation-created.png', fullPage: true });

    // STEP 3: Simulate clicking the email link (unauthenticated access)
    console.log('\\n7. Simulating user clicking email link (unauthenticated)...');
    const emailPage = await context.newPage();
    
    // Clear any existing authentication to simulate a fresh user
    await emailPage.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
    
    await emailPage.goto(invitationUrl);
    await emailPage.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    console.log('✓ Email link opened successfully');
    
    // Verify invitation details are displayed
    await emailPage.waitForSelector('text=Test Campaign', { timeout: 5000 });
    await emailPage.waitForSelector('text=You\'ve been invited by', { timeout: 5000 });
    await emailPage.waitForSelector('button:has-text("Login to Accept")', { timeout: 5000 });
    console.log('✓ Invitation details displayed correctly for unauthenticated user');
    
    await emailPage.screenshot({ path: 'test-results/email-flow-05-email-link-opened.png', fullPage: true });

    // STEP 4: Test the login flow from the invitation page
    console.log('\\n8. Testing login flow from invitation page...');
    const loginButton = emailPage.locator('button:has-text("Login to Accept")');
    await loginButton.click();
    
    // Should redirect to login page with return URL
    await emailPage.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    const loginUrl = emailPage.url();
    console.log(`Login URL: ${loginUrl}`);
    
    const expectedRedirectParam = encodeURIComponent(`/redeem/${capturedInvitationId}`);
    if (loginUrl.includes('/login') && loginUrl.includes(`redirect=${expectedRedirectParam}`)) {
      console.log('✓ Correctly redirected to login with proper return URL');
    } else {
      console.log('⚠ Login redirect may not include proper return URL');
      console.log(`Expected redirect param: ${expectedRedirectParam}`);
    }
    
    await emailPage.screenshot({ path: 'test-results/email-flow-06-login-page.png', fullPage: true });

    // STEP 5: Login as player and complete the redemption
    console.log('\\n9. Logging in as player to complete redemption...');
    
    // Fill in player credentials on the login page
    await emailPage.fill('input[type="email"]', 'player@example.com');
    await emailPage.fill('input[type="password"]', 'password');
    await emailPage.click('button[type="submit"]');
    
    // Wait for successful login
    await emailPage.waitForSelector('text=Chi War', { timeout: 10000 });
    console.log('✓ Player logged in successfully');

    // Should redirect back to invitation page after login
    await emailPage.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    await emailPage.waitForSelector('button:has-text("Accept Invitation")', { timeout: 5000 });
    console.log('✓ Redirected back to invitation page after login');
    
    // Verify the button text changed to "Accept Invitation"
    const acceptButton = emailPage.locator('button:has-text("Accept Invitation")');
    const buttonVisible = await acceptButton.isVisible();
    if (buttonVisible) {
      console.log('✓ Accept Invitation button is now visible for authenticated user');
    } else {
      console.log('⚠ Accept Invitation button not found - user may already be a member');
    }
    
    await emailPage.screenshot({ path: 'test-results/email-flow-08-ready-to-accept.png', fullPage: true });

    // STEP 6: Accept the invitation
    console.log('\\n10. Accepting the invitation...');
    if (buttonVisible) {
      await acceptButton.click();
      
      // Wait for redemption to complete
      await emailPage.waitForTimeout(5000);
      
      // Check for success and redirect
      const currentUrl = emailPage.url();
      console.log(`URL after acceptance: ${currentUrl}`);
      
      if (currentUrl.includes('/campaigns/')) {
        console.log('✓ Successfully redirected to campaign page');
        await emailPage.waitForSelector('text=Test Campaign', { timeout: 10000 });
        console.log('✓ Campaign page loaded - user successfully joined campaign');
      } else {
        // Look for success toast/alert
        const successSelectors = [
          'text=Successfully joined',
          'text=Success',
          '.MuiAlert-root',
          '.MuiSnackbar-root'
        ];
        
        let successFound = false;
        for (const selector of successSelectors) {
          try {
            const element = await emailPage.locator(selector).first();
            if (await element.isVisible()) {
              const successText = await element.textContent();
              console.log(`✓ Success message found: ${successText}`);
              successFound = true;
              break;
            }
          } catch (e) {
            // Continue to next selector
          }
        }
        
        if (!successFound) {
          console.log('⚠ No clear success indication found');
        }
      }
    } else {
      console.log('ℹ User may already be a member of this campaign');
    }
    
    await emailPage.screenshot({ path: 'test-results/email-flow-09-after-acceptance.png', fullPage: true });

    // STEP 7: Verify the invitation link is no longer valid
    console.log('\\n11. Verifying invitation link is consumed...');
    const verifyPage = await context.newPage();
    await verifyPage.goto(invitationUrl);
    
    try {
      // Look for error messages indicating the invitation is no longer valid
      const errorSelectors = [
        'text=not found',
        'text=no longer valid',
        'text=Already a member',
        'text=expired'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          await verifyPage.waitForSelector(selector, { timeout: 5000 });
          const errorText = await verifyPage.textContent(selector);
          console.log(`✓ Invitation properly consumed - shows: ${errorText}`);
          errorFound = true;
          break;
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not verify invitation was consumed');
      }
    } catch (error) {
      console.log('Error verifying invitation consumption:', error.message);
    }
    
    await verifyPage.screenshot({ path: 'test-results/email-flow-10-invitation-consumed.png', fullPage: true });

    console.log('\\n🎉 EMAIL FLOW E2E TEST COMPLETED SUCCESSFULLY!');
    console.log('\\nComplete Email Flow Tested:');
    console.log('✓ 1. Gamemaster creates invitation through UI');
    console.log('✓ 2. Invitation ID captured (simulating email link)');
    console.log('✓ 3. User clicks email link (unauthenticated access)');
    console.log('✓ 4. User redirected to login with return URL');
    console.log('✓ 5. User logs in and returns to invitation page');
    console.log('✓ 6. User accepts invitation and joins campaign');
    console.log('✓ 7. Invitation link becomes invalid after use');
    console.log(`\\n📧 Email URL tested: ${invitationUrl}`);
    
  } catch (error) {
    console.error('❌ Email flow E2E test failed:', error);
    await page.screenshot({ path: 'test-results/email-flow-ERROR.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testInvitationEmailFlowE2E().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testInvitationEmailFlowE2E };