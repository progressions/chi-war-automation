// Debug Cookie Storage
// This script checks if cookies are being properly stored in the browser

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function debugCookies() {
  console.log('🍪 Starting Cookie Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Step 1: Navigate to login page...');
    await page.goto(TEST_CONFIG.getLoginUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    console.log('📍 Step 2: Check initial cookies...');
    let cookies = await context.cookies(TEST_CONFIG.getFrontendUrl());
    console.log('Initial cookies:', cookies.map(c => ({name: c.name, value: c.value.substring(0, 20) + '...'})));
    
    console.log('📍 Step 3: Fill and submit login form...');
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    await page.getByText('Sign In').click();
    
    console.log('⏳ Waiting for login to complete...');
    await page.waitForTimeout(3000);
    
    console.log('📍 Step 4: Check cookies after login...');
    cookies = await context.cookies(TEST_CONFIG.getFrontendUrl());
    console.log('Post-login cookies:', cookies.map(c => ({name: c.name, value: c.value.substring(0, 20) + '...', domain: c.domain, path: c.path})));
    
    const jwtCookie = cookies.find(c => c.name === 'jwtToken');
    if (jwtCookie) {
      console.log('✅ JWT Cookie details:');
      console.log('   Value:', jwtCookie.value.substring(0, 50) + '...');
      console.log('   Domain:', jwtCookie.domain);
      console.log('   Path:', jwtCookie.path);
      console.log('   SameSite:', jwtCookie.sameSite);
      console.log('   Secure:', jwtCookie.secure);
      console.log('   HttpOnly:', jwtCookie.httpOnly);
      console.log('   Expires:', jwtCookie.expires);
    } else {
      console.log('❌ JWT Cookie not found');
    }
    
    console.log('📍 Step 5: Test cookie with direct JavaScript...');
    const cookieFromJS = await page.evaluate(() => {
      return document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwtToken='));
    });
    
    if (cookieFromJS) {
      console.log('✅ Cookie accessible via document.cookie:', cookieFromJS.substring(0, 50) + '...');
    } else {
      console.log('❌ Cookie not accessible via document.cookie');
    }
    
    console.log('📍 Step 6: Test cookie with js-cookie library...');
    const cookieFromJSCookie = await page.evaluate(() => {
      // Assuming js-cookie is available
      if (typeof window !== 'undefined' && window.Cookies) {
        return window.Cookies.get('jwtToken');
      }
      return null;
    });
    
    if (cookieFromJSCookie) {
      console.log('✅ Cookie accessible via js-cookie:', cookieFromJSCookie.substring(0, 50) + '...');
    } else {
      console.log('❌ Cookie not accessible via js-cookie or js-cookie not available');
    }
    
    console.log('📍 Step 7: Navigate to another page and check cookies...');
    await page.goto(TEST_CONFIG.getFrontendUrl() + '/');
    await page.waitForTimeout(2000);
    
    cookies = await context.cookies(TEST_CONFIG.getFrontendUrl());
    const jwtAfterNav = cookies.find(c => c.name === 'jwtToken');
    
    if (jwtAfterNav) {
      console.log('✅ JWT Cookie persists after navigation');
    } else {
      console.log('❌ JWT Cookie lost after navigation');
    }
    
  } catch (error) {
    console.error('❌ Cookie debug failed:', error);
    await page.screenshot({ path: 'test-results/cookie-debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
if (require.main === module) {
  debugCookies()
    .then(() => {
      console.log('✅ Cookie debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cookie debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugCookies };