// Debug Authentication Flow
// This script helps debug the authentication and redirect issues

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function debugAuthFlow() {
  console.log('🔍 Starting Authentication Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login first
    console.log('📍 Step 1: Logging in...');
    await page.goto(TEST_CONFIG.getLoginUrl());
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    await page.getByText('Sign In').click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    console.log('URL after login:', page.url());
    
    // Step 2: Check cookies
    console.log('📍 Step 2: Checking cookies...');
    const cookies = await context.cookies();
    const jwtCookie = cookies.find(cookie => cookie.name === 'jwtToken');
    
    if (jwtCookie) {
      console.log('✅ JWT Cookie found:', jwtCookie.value.substring(0, 20) + '...');
    } else {
      console.log('❌ JWT Cookie not found');
      console.log('Available cookies:', cookies.map(c => c.name));
    }
    
    // Step 3: Try to access a protected page
    console.log('📍 Step 3: Accessing fights page...');
    await page.goto(TEST_CONFIG.getFightsUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const fightsUrl = page.url();
    console.log('URL after accessing fights:', fightsUrl);
    
    if (fightsUrl.includes('/login')) {
      console.log('❌ Still redirected to login - authentication issue');
    } else if (fightsUrl.includes('/campaigns')) {
      console.log('✅ Redirected to campaigns - authentication works, no current campaign');
    } else if (fightsUrl.includes('/fights')) {
      console.log('✅ Successfully accessed fights page');
    } else {
      console.log('⚠️ Unexpected redirect:', fightsUrl);
    }
    
    // Step 4: Check browser console for errors
    console.log('📍 Step 4: Checking browser console...');
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Reload to capture any console messages
    await page.reload();
    await page.waitForTimeout(2000);
    
    if (logs.length > 0) {
      console.log('Browser console messages:');
      logs.forEach(log => console.log('  ', log));
    } else {
      console.log('No browser console messages');
    }
    
    // Step 5: Test server-side authentication
    console.log('📍 Step 5: Testing server-side auth...');
    const response = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/test-auth');
        return {
          status: response.status,
          ok: response.ok,
          text: await response.text()
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('Server auth test response:', response);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ path: 'test-results/debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
if (require.main === module) {
  debugAuthFlow()
    .then(() => {
      console.log('✅ Debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugAuthFlow };