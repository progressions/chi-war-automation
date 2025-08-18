// Debug Login Process
// This script focuses specifically on the login form interaction

const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🔍 Starting Login Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Collect console messages
    const consoleLogs = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleLogs.push(`${type}: ${text}`);
      console.log(`Browser ${type}: ${text}`);
    });

    // Listen for network requests
    page.on('request', request => {
      if (request.url().includes('sign_in')) {
        console.log('📡 Login request:', request.method(), request.url());
        console.log('📦 Login payload:', request.postData());
      }
    });

    page.on('response', response => {
      if (response.url().includes('sign_in')) {
        console.log('📨 Login response:', response.status(), response.statusText());
        response.headers().then?.(headers => {
          console.log('📋 Response headers:', headers);
        }) || console.log('📋 Response headers:', response.headers());
      }
    });

    console.log('📍 Step 1: Navigate to login page...');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    console.log('📍 Step 2: Fill and submit login form...');
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    
    console.log('🔄 Submitting form...');
    await page.getByText('Sign In').click();
    
    console.log('⏳ Waiting for login response...');
    await page.waitForTimeout(5000); // Give time for login to complete
    
    const currentUrl = page.url();
    console.log('🌐 Final URL:', currentUrl);
    
    // Check cookies after login attempt
    const cookies = await context.cookies();
    const jwtCookie = cookies.find(cookie => cookie.name === 'jwtToken');
    
    if (jwtCookie) {
      console.log('✅ JWT Cookie found:', jwtCookie.value.substring(0, 20) + '...');
    } else {
      console.log('❌ JWT Cookie not found');
      console.log('📄 All cookies:', cookies.map(c => ({name: c.name, domain: c.domain})));
    }
    
    // Look for any error messages on page
    const errorElements = await page.locator('[role="alert"], .error, .alert').all();
    if (errorElements.length > 0) {
      console.log('🚨 Error messages found:');
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log('   ', text);
      }
    }
    
    console.log('📊 Total console messages:', consoleLogs.length);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'test-results/login-debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
if (require.main === module) {
  debugLogin()
    .then(() => {
      console.log('✅ Login debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Login debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugLogin };