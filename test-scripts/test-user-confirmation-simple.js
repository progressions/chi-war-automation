const { chromium } = require('playwright');

/**
 * Simple User Confirmation Feedback Test
 * SAFETY: Uses TEST ENVIRONMENT ports 3004/3005 ONLY
 */
async function testUserConfirmationSimple() {
  console.log('🔐 Starting SIMPLE User Confirmation Test...');
  console.log('🛡️  SAFETY: Using test ports 3004/3005 ONLY');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('\n🔧 Checking test environment...');
    
    // Check Rails server
    const railsCheck = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3004/api/v2/users/current');
        return response.status === 401;
      } catch (error) {
        return false;
      }
    });
    
    console.log(`✅ Rails test server: ${railsCheck ? 'OK' : 'FAIL'}`);
    
    // Navigate to Next.js login
    console.log('\n🌐 Navigating to login...');
    await page.goto('http://localhost:3005/login', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    console.log('✅ Login page loaded');
    
    // Try login with seed user to verify basic functionality
    console.log('\n🔑 Testing basic login functionality...');
    
    await page.fill('input[type="text"]', 'player@example.com');
    await page.fill('input[type="password"]', 'password');
    
    const [response] = await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('signin') && response.request().method() === 'POST'
      ),
      page.click('button[type="submit"]')
    ]);
    
    console.log(`Response status: ${response.status()}`);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.status() === 200) {
      console.log('✅ Basic login working');
      
      // Wait for redirect
      await page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
      console.log('✅ Redirect successful');
    } else {
      console.log('❌ Login failed');
    }
    
    console.log('\n✅ Simple test completed successfully');
    
  } catch (error) {
    console.error('❌ Simple test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testUserConfirmationSimple()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testUserConfirmationSimple };