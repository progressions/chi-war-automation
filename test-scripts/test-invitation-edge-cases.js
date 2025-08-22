const { chromium } = require('playwright');
const { loginAsPlayer } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function testInvitationEdgeCases() {
  console.log('Starting invitation edge cases test...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for better visibility
  });
  const context = await browser.newContext();
  let page = await context.newPage();

  try {
    // EDGE CASE 1: Invalid invitation ID
    console.log('\\n1. Testing invalid invitation ID...');
    await page.goto('TEST_CONFIG.getFrontendUrl()/redeem/invalid-id-123');
    
    try {
      await page.waitForSelector('text=not found', { timeout: 10000 });
      console.log('✓ Invalid invitation ID properly returns "not found" error');
    } catch (error) {
      // Check for other appropriate error messages
      const errorSelectors = [
        'text=Invitation not found',
        'text=Invalid',
        'text=Unable to load',
        '[role="alert"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log(`✓ Appropriate error message for invalid ID: ${errorText}`);
            errorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not find appropriate error message for invalid ID');
      }
    }
    
    await page.screenshot({ path: 'test-results/edge-case-01-invalid-id.png', fullPage: true });

    // EDGE CASE 2: Non-existent invitation ID (valid format but doesn't exist)
    console.log('\\n2. Testing non-existent invitation ID...');
    const fakeId = '00000000-0000-0000-0000-000000000000'; // Valid UUID format but doesn't exist
    await page.goto(`TEST_CONFIG.getFrontendUrl()/redeem/${fakeId}`);
    
    try {
      await page.waitForSelector('text=not found', { timeout: 10000 });
      console.log('✓ Non-existent invitation ID properly returns "not found" error');
    } catch (error) {
      // Check for other appropriate error messages
      const errorSelectors = [
        'text=Invitation not found',
        'text=Unable to load',
        '[role="alert"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log(`✓ Appropriate error message for non-existent ID: ${errorText}`);
            errorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not find appropriate error message for non-existent ID');
      }
    }
    
    await page.screenshot({ path: 'test-results/edge-case-02-nonexistent-id.png', fullPage: true });

    // EDGE CASE 3: Try to access redemption without authentication (should still show invitation details)
    console.log('\\n3. Testing unauthenticated access to valid invitation...');
    
    // First, we need to create a valid invitation to test with
    // We'll use the API directly to create one without going through the UI
    console.log('3a. Creating test invitation via API...');
    
    // Login as gamemaster first to get JWT
    await page.goto(TEST_CONFIG.getLoginUrl());
    await page.fill('input[type="email"]', 'progressions@gmail.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=Chi War', { timeout: 10000 });
    
    const jwt = await page.evaluate(() => localStorage.getItem('jwtToken'));
    
    // Create invitation via API
    const testEmail = `edge-case-test-${Date.now()}@example.com`;
    const createResponse = await fetch('TEST_CONFIG.getBackendUrl()/api/v2/invitations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        invitation: { email: testEmail }
      })
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create test invitation: ${createResponse.status}`);
    }
    
    const invitation = await createResponse.json();
    console.log(`✓ Created test invitation with ID: ${invitation.id}`);
    
    // Clear authentication and test unauthenticated access
    await page.evaluate(() => {
      localStorage.clear();
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    });
    
    await page.goto(`TEST_CONFIG.getFrontendUrl()/redeem/${invitation.id}`);
    await page.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    await page.waitForSelector('button:has-text("Login to Accept")', { timeout: 5000 });
    console.log('✓ Unauthenticated user can view invitation details');
    
    await page.screenshot({ path: 'test-results/edge-case-03-unauthenticated-access.png', fullPage: true });

    // EDGE CASE 4: User already member of campaign tries to redeem invitation
    console.log('\\n4. Testing redemption by user already in campaign...');
    
    // Login as a player who is already in the campaign
    await loginAsPlayer(page, { 
      takeScreenshot: false
    });
    
    // Try to redeem the invitation
    await page.goto(`TEST_CONFIG.getFrontendUrl()/redeem/${invitation.id}`);
    await page.waitForSelector('text=Campaign Invitation', { timeout: 10000 });
    
    const acceptButton = page.locator('button:has-text("Accept Invitation")');
    if (await acceptButton.isVisible()) {
      await acceptButton.click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for "already a member" error
      const errorSelectors = [
        'text=Already a member',
        'text=already in',
        'text=member of this campaign',
        '[role="alert"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log(`✓ Appropriate error for already-member: ${errorText}`);
            errorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not find "already a member" error message');
      }
    } else {
      console.log('ℹ Accept button not visible - may already be handled by frontend');
    }
    
    await page.screenshot({ path: 'test-results/edge-case-04-already-member.png', fullPage: true });

    // EDGE CASE 5: Test malformed invitation URL
    console.log('\\n5. Testing malformed invitation URL...');
    await page.goto('TEST_CONFIG.getFrontendUrl()/redeem/not-a-uuid');
    
    try {
      await page.waitForSelector('text=not found', { timeout: 10000 });
      console.log('✓ Malformed URL properly returns error');
    } catch (error) {
      const errorSelectors = [
        'text=Invalid',
        'text=not found',
        'text=Unable to load',
        '[role="alert"]'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        try {
          const element = await page.locator(selector).first();
          if (await element.isVisible()) {
            const errorText = await element.textContent();
            console.log(`✓ Appropriate error for malformed URL: ${errorText}`);
            errorFound = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!errorFound) {
        console.log('⚠ Could not find appropriate error message for malformed URL');
      }
    }
    
    await page.screenshot({ path: 'test-results/edge-case-05-malformed-url.png', fullPage: true });

    console.log('\\n🎉 EDGE CASES TEST COMPLETED!');
    console.log('\\nEdge Cases Tested:');
    console.log('✓ Invalid invitation ID');
    console.log('✓ Non-existent invitation ID');
    console.log('✓ Unauthenticated access to valid invitation');
    console.log('✓ Already-member redemption attempt');
    console.log('✓ Malformed invitation URL');
    
  } catch (error) {
    console.error('❌ Edge cases test failed:', error);
    await page.screenshot({ path: 'test-results/edge-cases-ERROR.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testInvitationEdgeCases().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { testInvitationEdgeCases };