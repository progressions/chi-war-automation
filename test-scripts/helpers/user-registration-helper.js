/**
 * User Registration Helper for Chi War End-to-End Tests
 * 
 * Provides reusable functions for user registration workflows including:
 * - New user registration
 * - Email confirmation (if implemented)  
 * - Login with new credentials
 * - Registration validation
 */

const TEST_CONFIG = require('../test-config');

/**
 * Generates a unique test email address
 * @param {string} prefix - Email prefix (e.g., 'gm', 'player1')
 * @returns {string} Unique email address
 */
function generateTestEmail(prefix) {
  const timestamp = Date.now();
  return `test_${prefix}_${timestamp}@example.com`;
}

/**
 * Takes a screenshot with proper directory structure
 * @param {Page} page - Playwright page object
 * @param {string} name - Screenshot name
 * @param {string} screenshotDir - Directory for screenshots
 */
async function takeScreenshot(page, name, screenshotDir) {
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: path.join(screenshotDir, `${timestamp}-${name}.png`),
    fullPage: true 
  });
  console.log(`📸 Screenshot: ${name}`);
}

/**
 * Waits for page to fully load
 * @param {Page} page - Playwright page object
 * @param {string|RegExp} expectedUrl - Expected URL pattern (optional)
 */
async function waitForPageLoad(page, expectedUrl = null) {
  await page.waitForLoadState('networkidle');
  
  if (expectedUrl) {
    await page.waitForURL(expectedUrl, { timeout: 10000 });
  }
  
  // Buffer for any remaining renders
  await page.waitForTimeout(1000);
}

/**
 * Registers a new user account
 * @param {Page} page - Playwright page object
 * @param {Object} userData - User data
 * @param {string} userData.email - Email address
 * @param {string} userData.password - Password
 * @param {string} userData.firstName - First name
 * @param {string} userData.lastName - Last name
 * @param {string} userData.role - User role (gamemaster/player)
 * @param {Object} options - Optional configuration
 * @returns {Object} Registration result with credentials
 */
async function registerNewUser(page, userData, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`👤 Registering new user: ${userData.email} (${userData.role})`);
  
  try {
    // Navigate to homepage first
    await page.goto(TEST_CONFIG.getFrontendUrl());
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `01-homepage-${userData.role}`, screenshotDir);
    }
    
    // Look for registration/signup link
    const signupSelectors = [
      'a:has-text("Sign Up")',
      'a:has-text("Register")', 
      'a:has-text("Get Started")',
      'a:has-text("Create Account")',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      '[data-testid="signup-link"]',
      '[data-testid="register-button"]'
    ];
    
    let signupLink = null;
    for (const selector of signupSelectors) {
      signupLink = page.locator(selector).first();
      if (await signupLink.isVisible({ timeout: 2000 }).catch(() => false)) {
        break;
      }
      signupLink = null;
    }
    
    if (!signupLink) {
      console.log('⚠️ No signup link found, trying direct navigation to registration page');
      await page.goto(TEST_CONFIG.getRegisterUrl());
    } else {
      await signupLink.click();
    }
    
    await waitForPageLoad(page, /.*\/(auth|register|signup).*/);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `02-registration-page-${userData.role}`, screenshotDir);
    }
    
    // Fill out registration form
    console.log('📝 Filling registration form...');
    
    // Use getByRole selectors which work reliably with Material-UI components
    await page.getByRole('textbox', { name: 'First Name', exact: true }).fill(userData.firstName);
    await page.getByRole('textbox', { name: 'Last Name', exact: true }).fill(userData.lastName);
    await page.getByRole('textbox', { name: 'Email Address', exact: true }).fill(userData.email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(userData.password);
    await page.getByRole('textbox', { name: 'Confirm Password', exact: true }).fill(userData.password);
    
    // Select role if available
    if (userData.role) {
      const roleSelectors = [
        'select[name="role"]',
        'input[name="role"]',
        '#role',
        `input[value="${userData.role}"]`,
        `button:has-text("${userData.role}")`,
        `label:has-text("${userData.role}") input`
      ];
      
      for (const selector of roleSelectors) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          
          if (tagName === 'select') {
            await element.selectOption({ value: userData.role });
          } else if (tagName === 'input' && await element.getAttribute('type') === 'radio') {
            await element.check();
          } else if (tagName === 'button') {
            await element.click();
          }
          break;
        }
      }
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `03-registration-form-filled-${userData.role}`, screenshotDir);
    }
    
    // Submit registration form
    await page.getByRole('button', { name: 'Create Account' }).click();
    
    // Wait for registration to complete
    await page.waitForTimeout(3000);
    
    // Check for success message or redirect
    const currentUrl = page.url();
    const hasSuccessMessage = await page.locator('text=Registration successful').isVisible().catch(() => false);
    const wasRedirected = !currentUrl.includes('/register') && !currentUrl.includes('/signup');
    const isSuccessful = hasSuccessMessage || wasRedirected;
    
    if (takeScreenshots) {
      await takeScreenshot(page, `04-after-registration-${userData.role}`, screenshotDir);
    }
    
    console.log(`✅ Registration completed for ${userData.email}`);
    
    return {
      success: isSuccessful,
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      currentUrl
    };
    
  } catch (error) {
    console.error(`❌ Registration failed for ${userData.email}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-registration-${userData.role}`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Logs in with provided credentials
 * @param {Page} page - Playwright page object  
 * @param {string} email - Email address
 * @param {string} password - Password
 * @param {Object} options - Optional configuration
 * @returns {Object} Login result
 */
async function loginWithCredentials(page, email, password, options = {}) {
  const { takeScreenshots = true, screenshotDir = 'test-results/user-journey' } = options;
  
  console.log(`🔐 Logging in as: ${email}`);
  
  try {
    // Check if already logged in
    const currentUrl = page.url();
    if (currentUrl.includes('/campaigns') || currentUrl.includes('/dashboard')) {
      console.log('✅ Already logged in');
      return { success: true, alreadyLoggedIn: true };
    }
    
    // Navigate to login page if not already there
    if (!currentUrl.includes('/login')) {
      await page.goto(TEST_CONFIG.getLoginUrl());
      await waitForPageLoad(page);
    }
    
    if (takeScreenshots) {
      await takeScreenshot(page, `05-login-page-${email.split('@')[0]}`, screenshotDir);
    }
    
    // Fill login form using reliable getByRole selectors
    await page.getByRole('textbox', { name: 'Email Address', exact: true }).fill(email);
    await page.getByRole('textbox', { name: 'Password', exact: true }).fill(password);
    
    // Submit login form
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    // Check for error messages first
    const hasErrorMessage = await page.locator('text=Unexpected token, text=not valid JSON, [role="alert"]').first().isVisible().catch(() => false);
    
    if (hasErrorMessage) {
      const errorText = await page.locator('text=Unexpected token, text=not valid JSON, [role="alert"]').first().textContent().catch(() => 'Unknown error');
      throw new Error(`Login failed with error: ${errorText}`);
    }
    
    // Wait for redirect away from login page
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `06-after-login-${email.split('@')[0]}`, screenshotDir);
    }
    
    // Validate onboarding system
    const onboardingValidation = await validateOnboardingSystem(page);
    
    console.log(`✅ Login successful for ${email}`);
    if (onboardingValidation.onboardingVisible) {
      console.log(`🎯 Onboarding system is active: ${onboardingValidation.onboardingType}`);
    } else {
      console.log(`⚠️ No onboarding system detected - this indicates an issue!`);
    }
    
    return {
      success: true,
      email,
      currentUrl: page.url(),
      onboarding: onboardingValidation
    };
    
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.message);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `error-login-${email.split('@')[0]}`, screenshotDir);
    }
    
    throw error;
  }
}

/**
 * Validates that the onboarding system is working after login
 * @param {Page} page - Playwright page object
 * @returns {Object} Onboarding validation result
 */
async function validateOnboardingSystem(page) {
  console.log('🎯 Validating onboarding system...');
  
  try {
    // Wait a moment for the page to fully render
    await page.waitForTimeout(2000);
    
    // Check for different onboarding states
    const onboardingSelectors = {
      campaignCta: '[data-testid="onboarding-module"] .MuiPaper-root:has-text("Ready to start")',
      carousel: '[data-testid="onboarding-module"] .MuiLinearProgress-root',
      congratulations: '[data-testid="onboarding-module"] .MuiPaper-root:has-text("Congratulations")',
      general: '[data-testid="onboarding-module"]'
    };
    
    const results = {};
    
    // Check for each type of onboarding
    for (const [type, selector] of Object.entries(onboardingSelectors)) {
      try {
        const isVisible = await page.locator(selector).isVisible({ timeout: 1000 });
        results[type] = isVisible;
        if (isVisible) {
          console.log(`✅ Found onboarding type: ${type}`);
        }
      } catch (error) {
        results[type] = false;
      }
    }
    
    // Determine the onboarding state
    let onboardingType = 'none';
    if (results.congratulations) {
      onboardingType = 'congratulations';
    } else if (results.carousel) {
      onboardingType = 'carousel';
    } else if (results.campaignCta) {
      onboardingType = 'campaign-cta';
    } else if (results.general) {
      onboardingType = 'unknown';
    }
    
    // Take a screenshot of the onboarding state
    await takeScreenshot(page, `onboarding-validation-${onboardingType}`, 'test-results/onboarding-validation');
    
    return {
      onboardingVisible: onboardingType !== 'none',
      onboardingType,
      details: results,
      pageUrl: page.url()
    };
    
  } catch (error) {
    console.error('❌ Onboarding validation failed:', error.message);
    await takeScreenshot(page, 'onboarding-validation-error', 'test-results/onboarding-validation');
    
    return {
      onboardingVisible: false,
      onboardingType: 'error',
      error: error.message,
      pageUrl: page.url()
    };
  }
}

/**
 * Confirms user email (if confirmation system is implemented)
 * @param {string} email - Email address to confirm
 * @param {Object} options - Optional configuration
 * @returns {Object} Confirmation result
 */
async function confirmUserEmail(email, options = {}) {
  console.log(`📧 Confirming email for: ${email}`);
  
  try {
    // First, get the user's confirmation token from the database
    const { spawn } = require('child_process');
    
    const confirmationToken = await new Promise((resolve, reject) => {
      const railsCommand = spawn('bash', ['-c', `
        cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && 
        source ~/.rvm/scripts/rvm && 
        rvm use 3.2.2 && 
        RAILS_ENV=test rails runner "
          user = User.find_by(email: '${email}')
          if user && user.confirmation_token
            puts user.confirmation_token
          else
            puts 'ERROR: User not found or no confirmation token'
            exit 1
          end
        "
      `]);
      
      let output = '';
      let errorOutput = '';
      
      railsCommand.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      railsCommand.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      railsCommand.on('close', (code) => {
        const lines = output.trim().split('\n');
        // Find the line that looks like a confirmation token (alphanumeric string)
        const token = lines.find(line => 
          line.trim().length > 10 && 
          /^[a-zA-Z0-9_-]+$/.test(line.trim()) &&
          !line.includes('Using') &&
          !line.includes('libsodium') &&
          !line.includes('WARN') &&
          !line.includes('ERROR')
        )?.trim();
        
        if (code === 0 && token) {
          resolve(token);
        } else {
          reject(new Error(`Failed to get confirmation token: ${errorOutput || output}`));
        }
      });
    });
    
    // Now visit the actual confirmation URL
    const { chromium } = require('playwright');
    const TEST_CONFIG = require('../test-config');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      const confirmationUrl = `${TEST_CONFIG.getBackendUrl()}/users/confirmation?confirmation_token=${confirmationToken}`;
      console.log(`🔗 Visiting confirmation URL: ${confirmationUrl}`);
      
      // Visit the confirmation URL
      const response = await page.goto(confirmationUrl);
      
      // Check if the response was successful
      if (response.status() === 200) {
        // Wait for the page to load and get the response
        await page.waitForLoadState('networkidle');
        
        // Check for success message in the JSON response
        const content = await page.textContent('body');
        const jsonResponse = JSON.parse(content);
        
        if (jsonResponse.message && jsonResponse.message.includes('confirmed successfully')) {
          console.log('✅ Email confirmation completed via confirmation URL');
          await browser.close();
          return {
            success: true,
            email,
            confirmed: true,
            method: 'confirmation-url',
            confirmationToken,
            response: jsonResponse
          };
        } else {
          throw new Error(`Unexpected confirmation response: ${content}`);
        }
      } else {
        throw new Error(`Confirmation URL returned status: ${response.status()}`);
      }
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error(`❌ Email confirmation error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  generateTestEmail,
  takeScreenshot,
  waitForPageLoad,
  registerNewUser,
  loginWithCredentials,
  confirmUserEmail,
  validateOnboardingSystem
};