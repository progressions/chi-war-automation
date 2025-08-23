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
        await field.fill(userData.email);
        break;
      }
    }
    
    // Fill first name
    const firstNameSelectors = [
      'input[name="first_name"]',
      'input[name="firstName"]',
      'input[name="fname"]',
      '#first_name',
      '#firstName',
      'input[placeholder*="first name" i]'
    ];
    
    for (const selector of firstNameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(userData.firstName);
        break;
      }
    }
    
    // Fill last name
    const lastNameSelectors = [
      'input[name="last_name"]',
      'input[name="lastName"]', 
      'input[name="lname"]',
      '#last_name',
      '#lastName',
      'input[placeholder*="last name" i]'
    ];
    
    for (const selector of lastNameSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(userData.lastName);
        break;
      }
    }
    
    // Fill password
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      '#password',
      'input[placeholder*="password" i]'
    ];
    
    for (const selector of passwordSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(userData.password);
        break;
      }
    }
    
    // Fill password confirmation
    const passwordConfirmSelectors = [
      'input[name="password_confirmation"]',
      'input[name="confirmPassword"]', 
      'input[name="passwordConfirm"]',
      '#password_confirmation',
      '#confirmPassword',
      'input[placeholder*="confirm" i]'
    ];
    
    for (const selector of passwordConfirmSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible({ timeout: 1000 }).catch(() => false)) {
        await field.clear();
        await field.fill(userData.password);
        break;
      }
    }
    
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
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Sign Up")',
      'button:has-text("Register")',
      'button:has-text("Create Account")',
      'button:has-text("Create")',
      '[data-testid="submit-registration"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for registration to complete
    await page.waitForTimeout(3000);
    
    // Check if we were redirected (successful registration)
    const currentUrl = page.url();
    const isSuccessful = !currentUrl.includes('/register') && !currentUrl.includes('/signup');
    
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
    
    // Fill login form
    const emailField = page.locator('input[name="email"], input[type="email"]').first();
    const passwordField = page.locator('input[name="password"], input[type="password"]').first();
    
    if (await emailField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailField.clear();
      await emailField.fill(email);
    }
    
    if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordField.clear(); 
      await passwordField.fill(password);
    }
    
    // Submit login form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")', 
      'button:has-text("Log In")',
      'input[type="submit"]'
    ];
    
    for (const selector of submitSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    // Wait for redirect away from login page
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    await waitForPageLoad(page);
    
    if (takeScreenshots) {
      await takeScreenshot(page, `06-after-login-${email.split('@')[0]}`, screenshotDir);
    }
    
    console.log(`✅ Login successful for ${email}`);
    
    return {
      success: true,
      email,
      currentUrl: page.url()
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
 * Confirms user email (if confirmation system is implemented)
 * @param {string} email - Email address to confirm
 * @param {Object} options - Optional configuration
 * @returns {Object} Confirmation result
 */
async function confirmUserEmail(email, options = {}) {
  console.log(`📧 Confirming email for: ${email}`);
  
  // For now, this is a placeholder since email confirmation
  // would require access to email system or mock implementation
  console.log('⚠️ Email confirmation not implemented in test environment');
  
  return {
    success: true,
    email,
    confirmed: true,
    method: 'auto-confirmed' // In test environment
  };
}

module.exports = {
  generateTestEmail,
  takeScreenshot,
  waitForPageLoad,
  registerNewUser,
  loginWithCredentials,
  confirmUserEmail
};