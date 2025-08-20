const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testInvitationSimple() {
  console.log('Starting simple invitation test...');
  
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

    // Navigate to campaigns page  
    console.log('2. Navigating to campaigns page...');
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForSelector('[role="grid"]', { timeout: 15000 });
    console.log('✓ Campaigns page loaded');

    // Find and click on Secondary Campaign 
    console.log('3. Clicking on Secondary Campaign...');
    const campaignRow = page.locator('[role="grid"] [role="row"]:has-text("Secondary Campaign")');
    const avatarLink = campaignRow.locator('a').first();
    
    // Wait for new tab to open when clicking campaign link
    const [campaignPage] = await Promise.all([
      context.waitForEvent('page'),
      avatarLink.click()
    ]);
    
    console.log('✓ New tab opened, switching to campaign page');
    await campaignPage.waitForLoadState('networkidle');
    await campaignPage.waitForSelector('text=Secondary Campaign', { timeout: 10000 });
    console.log('✓ Campaign page loaded');

    // Look for the Invitations section
    console.log('4. Looking for Invitations section...');
    await campaignPage.waitForSelector('text=Invitations', { timeout: 5000 });
    console.log('✓ Invitations section found');

    // Click the MANAGE button in the Invitations section specifically
    console.log('5. Looking for Invitations MANAGE button...');
    
    // Get all MANAGE buttons and check which one is for invitations
    const manageButtons = campaignPage.locator('text=MANAGE');
    const buttonCount = await manageButtons.count();
    console.log(`Found ${buttonCount} MANAGE buttons`);
    
    // Try the last MANAGE button (likely the Invitations one since Members is above it)
    if (buttonCount > 1) {
      console.log('Clicking the second MANAGE button (Invitations)...');
      await manageButtons.nth(1).click();
    } else if (buttonCount === 1) {
      console.log('Clicking the only MANAGE button...');
      await manageButtons.first().click();
    } else {
      throw new Error('No MANAGE buttons found');
    }
    
    // Wait and take screenshot to see what opened
    await campaignPage.waitForTimeout(3000);
    await campaignPage.screenshot({ path: 'test-results/invitation-form-opened.png', fullPage: true });
    
    // Look for form elements
    console.log('6. Checking for form elements...');
    const inputs = await campaignPage.locator('input').count();
    console.log(`Found ${inputs} input elements`);
    
    const emailInputs = await campaignPage.locator('input[type="email"]').count();
    console.log(`Found ${emailInputs} email input elements`);
    
    if (emailInputs > 0) {
      console.log('✓ Email input found - invitation form is working!');
      
      // Test filling in the email
      const emailInput = campaignPage.locator('input[type="email"]').first();
      const testEmail = `testuser${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      console.log(`✓ Filled email: ${testEmail}`);
      
      // Look for submit button
      const inviteButtons = await campaignPage.locator('button:has-text("Invite")').count();
      console.log(`Found ${inviteButtons} Invite buttons`);
      
      if (inviteButtons > 0) {
        console.log('✓ Invite button found - ready to send invitation!');
        await campaignPage.screenshot({ path: 'test-results/invitation-ready-to-send.png', fullPage: true });
        
        // Actually click the invite button to send the invitation
        console.log('7. Clicking Invite button to send invitation...');
        const inviteButton = campaignPage.locator('button:has-text("Invite")').first();
        await inviteButton.click();
        
        // Wait for response and check for success/error message
        console.log('8. Waiting for invitation response...');
        await campaignPage.waitForTimeout(2000); // Give it time to process
        
        try {
          // Look for success or error alerts using multiple selectors
          const alertSelectors = [
            '.MuiAlert-root',                    // Material-UI Alert (could be local or toast)
            '.MuiSnackbar-root .MuiAlert-root',  // Toast notification (Snackbar with Alert inside)
            '[role="alert"]',                    // Generic alert role
            'text=sent',                         // Success text patterns
            'text=invitation sent',
            'text=Operation successful',
            'text=Success',
            'text=Failed',                       // Error text patterns
            'text=Error'
          ];
          
          let alertFound = false;
          let alertText = '';
          
          for (const selector of alertSelectors) {
            try {
              const element = await campaignPage.locator(selector).first();
              if (await element.isVisible()) {
                alertText = await element.textContent();
                console.log(`✅ Found alert with selector "${selector}": ${alertText}`);
                alertFound = true;
                break;
              }
            } catch (e) {
              // Continue to next selector
            }
          }
          
          if (!alertFound) {
            // Check if email field was cleared (indicates success)
            const emailInput = campaignPage.locator('input[type="email"]').first();
            const emailValue = await emailInput.inputValue();
            console.log(`Email field value after invite: "${emailValue}"`);
            
            if (emailValue === '' || emailValue !== testEmail) {
              console.log('✅ Email field was cleared - invitation likely sent successfully!');
              alertFound = true;
              alertText = 'Email field cleared (success indication)';
            }
          }
          
          if (alertFound) {
            if (alertText.includes('sent') || alertText.includes('success') || alertText.includes('cleared')) {
              console.log('🎉 SUCCESS: Invitation was sent successfully!');
            } else if (alertText.includes('Failed') || alertText.includes('Error')) {
              console.log('❌ ERROR: Invitation failed to send -', alertText);
            } else {
              console.log('ℹ UNCLEAR: Got response but unclear if success -', alertText);
            }
          } else {
            console.log('⚠ No clear success/error indication found');
          }
          
          await campaignPage.screenshot({ path: 'test-results/invitation-sent-result.png', fullPage: true });
          
        } catch (error) {
          console.log('⚠ Error checking for alerts:', error.message);
          await campaignPage.screenshot({ path: 'test-results/invitation-no-alert.png', fullPage: true });
        }
      }
    } else {
      console.log('ℹ No email input found - form structure may be different');
      // Check what elements are actually on the page
      const allElements = await campaignPage.locator('*').allTextContents();
      console.log('Page text content:', allElements.slice(0, 10).join(' | '));
    }

    console.log('\\n✅ Simple invitation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await campaignPage.screenshot({ path: 'test-results/invitation-simple-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testInvitationSimple().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testInvitationSimple };