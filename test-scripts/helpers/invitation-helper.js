/**
 * Invitation Helper for Chi War End-to-End Tests
 * 
 * Provides reusable functions for invitation system workflows including:
 * - Sending invitations to players
 * - Email invitation redemption
 * - Player registration through invitations
 * - Multi-user invitation flows
 */

const TEST_CONFIG = require('../test-config');
const { takeScreenshot, waitForPageLoad } = require('./user-registration-helper');

/**
 * Sends an invitation to a player email address
 * @param {Page} page - Playwright page object (GM session)
 * @param {string} playerEmail - Email address to invite
 * @param {Object} options - Optional configuration
 * @returns {Object} Invitation sending result
 */
async function sendInvitation(page, playerEmail, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`📧 Sending invitation to: ${playerEmail}`);
  
  try {
    // Navigate to campaigns page or invitations section
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await waitForPageLoad(page);
    
    // Look for invitation or invite button/link
    const inviteSelectors = [
      'button:has-text("Invite")',
      'button:has-text("Invite Player")',
      'button:has-text("Send Invitation")',
      'a:has-text("Invite")',
      'a:has-text("Invite Player")',
      '[data-testid="invite-button"]',
      '[data-testid="send-invitation"]'
    ];
    
    let inviteButton = null;
    for (const selector of inviteSelectors) {
      inviteButton = page.locator(selector).first();
      if (await inviteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      inviteButton = null;
    }
    
    if (!inviteButton) {
      // Try looking for invitations in navigation or direct URL
      console.log('⚠️ No invite button found, trying invitations page');
      await page.goto(`${TEST_CONFIG.getFrontendUrl()}/invitations`);
      await waitForPageLoad(page);
      
      // Look for create/new invitation button
      const createInviteSelectors = [
        'button:has-text("New Invitation")',
        'button:has-text("Create Invitation")',
        'button:has-text("+")',
        'a:has-text("New Invitation")',
        'a:has-text("Create Invitation")'
      ];
      
      for (const selector of createInviteSelectors) {
        inviteButton = page.locator(selector).first();
        if (await inviteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          break;
        }
        inviteButton = null;
      }
    }
    
    if (!inviteButton) {
      throw new Error('Could not find invitation button or form');
    }
    
    await inviteButton.click();
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `18-invitation-form`, screenshotDir);
    }
    
    // Fill invitation form
    console.log('📝 Filling invitation form...');
    
    // Fill email field
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      '#email',
      'input[placeholder*="email" i]'
    ];
    
    for (const selector of emailSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(playerEmail);
        break;
      }
    }
    
    // Fill optional message if field exists
    const messageSelectors = [
      'textarea[name="message"]',
      'input[name="message"]',
      '#message',
      'textarea[placeholder*="message" i]'
    ];
    
    for (const selector of messageSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(`Welcome to our Feng Shui 2 campaign! Join us for epic adventures across time and space.`);
        break;
      }
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `19-invitation-form-filled`, screenshotDir);
    }
    
    // Submit invitation
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Send")',
      'button:has-text("Invite")',
      'button:has-text("Send Invitation")',
      '[data-testid="submit-invitation"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for invitation to be sent
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `20-invitation-sent`, screenshotDir);
    }
    
    console.log(`✅ Invitation sent to ${playerEmail}`);
    
    return {
      success: true,
      email: playerEmail,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Failed to send invitation to ${playerEmail}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-send-invitation`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Sends invitations to multiple player email addresses
 * @param {Page} page - Playwright page object (GM session)
 * @param {Array} playerEmails - Array of email addresses
 * @param {Object} options - Optional configuration
 * @returns {Array} Results of invitation sending
 */
async function sendMultipleInvitations(page, playerEmails, options = {}) {
  console.log(`📧 Sending invitations to ${playerEmails.length} players...`);
  
  const results = [];
  
  for (let i = 0; i < playerEmails.length; i++) {
    const email = playerEmails[i];
    
    console.log(`\n[${i + 1}/${playerEmails.length}] Inviting: ${email}`);
    
    try {
      const result = await sendInvitation(page, email, options);
      results.push(result);
      
      // Small delay between invitations
      if (i < playerEmails.length - 1) {
        await page.waitForTimeout(1000);
      }
      
    } catch (error) {
      console.error(`❌ Failed to invite ${email}: ${error.message}`);
      results.push({
        success: false,
        email,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`✅ Sent ${successCount}/${playerEmails.length} invitations successfully`);
  
  return results;
}

/**
 * Extracts invitation redemption URL from invitation list
 * @param {Page} page - Playwright page object (GM session)
 * @param {string} playerEmail - Email address to find invitation for
 * @param {Object} options - Optional configuration
 * @returns {string|null} Invitation URL
 */
async function getInvitationUrl(page, playerEmail, options = {}) {
  console.log(`🔍 Getting invitation URL for: ${playerEmail}`);
  
  try {
    // Navigate to invitations page
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/invitations`);
    await waitForPageLoad(page);
    
    // Look for the invitation in the list
    const invitationRow = page.locator(`tr:has-text("${playerEmail}"), .invitation-item:has-text("${playerEmail}")`).first();
    
    if (await invitationRow.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Look for redemption link or copy link button
      const linkSelectors = [
        'a[href*="/redeem/"]',
        'button:has-text("Copy Link")',
        '[data-testid="invitation-link"]',
        '.invitation-url'
      ];
      
      for (const selector of linkSelectors) {
        const element = invitationRow.locator(selector).first();
        
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          // If it's a link, get href
          const href = await element.getAttribute('href').catch(() => null);
          if (href && href.includes('/redeem/')) {
            const fullUrl = href.startsWith('http') ? href : `${TEST_CONFIG.getFrontendUrl()}${href}`;
            console.log(`✅ Found invitation URL: ${fullUrl}`);
            return fullUrl;
          }
          
          // If it's a button, try clicking it to copy and extract from clipboard
          if (selector.includes('Copy')) {
            await element.click();
            // In real scenario, would need clipboard access
            console.log('⚠️ Copy link button clicked, but cannot access clipboard in test');
          }
        }
      }
    }
    
    // Alternative: Look for invitation ID in URL or data attributes
    const invitationElements = await page.locator('[data-invitation-id], [data-id]').all();
    
    for (const element of invitationElements) {
      const rowText = await element.textContent().catch(() => '');
      if (rowText.includes(playerEmail)) {
        const invitationId = await element.getAttribute('data-invitation-id') || 
                           await element.getAttribute('data-id');
        
        if (invitationId) {
          const url = `${TEST_CONFIG.getFrontendUrl()}/redeem/${invitationId}`;
          console.log(`✅ Constructed invitation URL: ${url}`);
          return url;
        }
      }
    }
    
    console.log(`❌ Could not find invitation URL for ${playerEmail}`);
    return null;
    
  } catch (error) {
    console.error(`❌ Failed to get invitation URL for ${playerEmail}:`, error.message);
    return null;
  }
}

/**
 * Simulates clicking an invitation link and redeeming it
 * @param {Page} page - Playwright page object (new player session)
 * @param {string} invitationUrl - Invitation redemption URL
 * @param {Object} options - Optional configuration
 * @returns {Object} Redemption result
 */
async function redeemInvitation(page, invitationUrl, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`🎫 Redeeming invitation: ${invitationUrl}`);
  
  try {
    // Navigate to invitation URL
    await page.goto(invitationUrl);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `21-invitation-redemption-page`, screenshotDir);
    }
    
    // Check if login is required first
    const currentUrl = page.url();
    if (currentUrl.includes('/login') || await page.locator('text=Login Required').isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('🔐 Login required for invitation redemption');
      
      if (takeScreenshots) {
        await takeScreenshot(page, `22-login-required`, screenshotDir);
      }
      
      return {
        success: false,
        requiresLogin: true,
        loginUrl: currentUrl,
        invitationUrl
      };
    }
    
    // Look for accept invitation button
    const acceptSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept Invitation")',
      'button:has-text("Join")',
      'button:has-text("Join Campaign")',
      '[data-testid="accept-invitation"]'
    ];
    
    let acceptButton = null;
    for (const selector of acceptSelectors) {
      acceptButton = page.locator(selector).first();
      if (await acceptButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      acceptButton = null;
    }
    
    if (!acceptButton) {
      throw new Error('Could not find accept invitation button');
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `23-before-accept`, screenshotDir);
    }
    
    // Accept the invitation
    await acceptButton.click();
    
    // Wait for redemption to complete
    await page.waitForTimeout(3000);
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `24-invitation-redeemed`, screenshotDir);
    }
    
    console.log('✅ Invitation redeemed successfully');
    
    return {
      success: true,
      currentUrl: page.url()
    };
    
  } catch (error) {
    console.error(`❌ Invitation redemption failed: ${error.message}`);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-invitation-redemption`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Simulates the complete invitation flow for a new player
 * @param {Object} browser - Playwright browser object
 * @param {string} invitationUrl - Invitation redemption URL
 * @param {Object} playerData - Player registration data
 * @param {Object} options - Optional configuration
 * @returns {Object} Complete flow result
 */
async function completePlayerInvitationFlow(browser, invitationUrl, playerData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`👤 Starting player invitation flow for: ${playerData.email}`);
  
  // Create new browser context for this player
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    // Step 1: Try to redeem invitation
    const redemptionResult = await redeemInvitation(page, invitationUrl, options);
    
    if (redemptionResult.requiresLogin) {
      console.log('🔐 Player needs to register/login first');
      
      // Step 2: Register new account
      const { registerNewUser, loginWithCredentials } = require('./user-registration-helper');
      
      const registrationResult = await registerNewUser(page, playerData, options);
      
      if (!registrationResult.success) {
        throw new Error('Player registration failed');
      }
      
      // Step 3: Login with new credentials
      const loginResult = await loginWithCredentials(page, playerData.email, playerData.password, options);
      
      if (!loginResult.success) {
        throw new Error('Player login failed');
      }
      
      // Step 4: Retry invitation redemption after login
      const finalRedemptionResult = await redeemInvitation(page, invitationUrl, options);
      
      return {
        success: finalRedemptionResult.success,
        email: playerData.email,
        registered: true,
        loggedIn: true,
        invitationRedeemed: finalRedemptionResult.success,
        page,
        context
      };
    } else {
      return {
        success: redemptionResult.success,
        email: playerData.email,
        registered: false, // Already had account
        loggedIn: true,
        invitationRedeemed: redemptionResult.success,
        page,
        context
      };
    }
    
  } catch (error) {
    console.error(`❌ Player invitation flow failed for ${playerData.email}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-player-flow-${playerData.email.split('@')[0]}`, screenshotDir);
    }
    
    await context.close();
    throw error;
  }
}

module.exports = {
  sendInvitation,
  sendMultipleInvitations,
  getInvitationUrl,
  redeemInvitation,
  completePlayerInvitationFlow
};