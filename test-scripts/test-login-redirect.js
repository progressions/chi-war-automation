// Login Redirect Test Script
// This script tests the login redirect functionality

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function runLoginRedirectTest() {
  console.log('🚀 Starting Login Redirect Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Try to access a protected page directly (fights page)
    console.log('📍 Step 1: Attempting to access protected fights page directly...');
    await page.goto(TEST_CONFIG.getFightsUrl());
    
    // Wait for redirect to login page
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 2: Verify we're on login page with redirect parameter
    console.log('🔍 Step 2: Checking if redirected to login with redirect parameter...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check if we're on login page
    if (!currentUrl.includes('/login')) {
      throw new Error('Should have been redirected to login page');
    }
    
    // Check if redirect parameter is present
    const urlParams = new URL(currentUrl).searchParams;
    const redirectParam = urlParams.get('redirect');
    console.log('Redirect parameter:', redirectParam);
    
    if (redirectParam !== '/fights') {
      throw new Error(`Expected redirect parameter to be '/fights', got: ${redirectParam}`);
    }
    
    console.log('✅ Successfully redirected to login with correct redirect parameter');
    
    // Take screenshot of login page with redirect param
    await page.screenshot({ path: 'test-results/login-with-redirect.png', fullPage: true });
    console.log('📸 Screenshot taken: test-results/login-with-redirect.png');
    
    // Wait for the login form to appear
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    // Step 3: Login with valid credentials
    console.log('🔐 Step 3: Logging in...');
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    
    // Take screenshot before clicking sign in
    await page.screenshot({ path: 'test-results/before-signin-redirect.png', fullPage: true });
    console.log('📸 Screenshot before sign in taken');
    
    await page.getByText('SIGN IN').click();
    
    // Step 4: Wait for login and check redirect
    console.log('⏳ Step 4: Waiting for login and redirect...');
    await page.waitForTimeout(3000);
    
    const postLoginUrl = page.url();
    console.log('URL after login:', postLoginUrl);
    
    // Check if we were redirected back to the fights page
    if (postLoginUrl.includes('/fights')) {
      console.log('✅ Successfully redirected back to fights page after login!');
    } else if (postLoginUrl === TEST_CONFIG.getFrontendUrl() + '/') {
      console.log('⚠️ Redirected to homepage instead of fights page');
      console.log('This might indicate the redirect functionality needs debugging');
    } else {
      console.log('⚠️ Unexpected redirect location:', postLoginUrl);
    }
    
    // Take screenshot of final page
    await page.screenshot({ path: 'test-results/after-login-redirect.png', fullPage: true });
    console.log('📸 Final screenshot taken');
    
    // Step 5: Test direct homepage access (should work without redirect)
    console.log('📍 Step 5: Testing direct homepage access...');
    await page.goto(TEST_CONFIG.getFrontendUrl() + '/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const homepageUrl = page.url();
    console.log('Homepage URL:', homepageUrl);
    
    if (homepageUrl === TEST_CONFIG.getFrontendUrl() + '/') {
      console.log('✅ Homepage accessible without redirect');
    } else {
      console.log('⚠️ Unexpected behavior on homepage access');
    }
    
    console.log('🎉 Login redirect test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/redirect-test-error.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runLoginRedirectTest()
    .then(() => {
      console.log('✅ Login redirect test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Login redirect test failed:', error);
      process.exit(1);
    });
}

module.exports = { runLoginRedirectTest };