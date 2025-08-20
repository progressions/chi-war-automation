// Shared login helper for Playwright tests
// Provides reusable login functionality for Chi War test automation

/**
 * Performs login to Chi War application
 * @param {Page} page - Playwright page object
 * @param {string} email - User email address
 * @param {string} password - User password
 * @param {Object} options - Optional configuration
 * @param {boolean} options.takeScreenshot - Whether to take login screenshots
 * @param {string} options.screenshotPath - Base path for screenshots
 */
async function loginToChiWar(page, email, password, options = {}) {
  const { takeScreenshot = false, screenshotPath = 'test-results' } = options;
  
  try {
    console.log(`🔐 Logging in as: ${email}`);
    
    // Navigate to application (use test port 3005)
    await page.goto('http://localhost:3005');
    
    // Wait for page to load and check for login form
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    if (takeScreenshot) {
      await page.screenshot({ 
        path: `${screenshotPath}/login-page.png`, 
        fullPage: true 
      });
      console.log(`📸 Login page screenshot taken: ${screenshotPath}/login-page.png`);
    }
    
    // Fill login form
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill(email);
    await passwordField.fill(password);
    
    // Submit login
    await page.getByText('SIGN IN').click();
    
    // Wait for successful login and redirect
    await page.waitForTimeout(3000);
    
    // Check if we've been redirected away from login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Still on login page, waiting for redirect...');
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    }
    
    if (takeScreenshot) {
      await page.screenshot({ 
        path: `${screenshotPath}/after-login.png`, 
        fullPage: true 
      });
      console.log(`📸 After login screenshot taken: ${screenshotPath}/after-login.png`);
    }
    
    console.log('✅ Login successful');
    return true;
    
  } catch (error) {
    console.error(`❌ Login failed for ${email}:`, error.message);
    
    if (takeScreenshot) {
      await page.screenshot({ 
        path: `${screenshotPath}/login-error.png`, 
        fullPage: true 
      });
      console.log(`📸 Login error screenshot taken: ${screenshotPath}/login-error.png`);
    }
    
    throw error;
  }
}

/**
 * Login as gamemaster user (progressions@gmail.com)
 * @param {Page} page - Playwright page object
 * @param {Object} options - Optional configuration
 */
async function loginAsGamemaster(page, options = {}) {
  return loginToChiWar(page, 'progressions@gmail.com', 'password', options);
}

/**
 * Login as player user (player@example.com)
 * @param {Page} page - Playwright page object
 * @param {Object} options - Optional configuration
 */
async function loginAsPlayer(page, options = {}) {
  return loginToChiWar(page, 'player@example.com', 'password', options);
}

module.exports = {
  loginToChiWar,
  loginAsGamemaster,
  loginAsPlayer
};