/**
 * Test script for authentication conflict resolution
 * This tests the scenario where localStorage has one user but backend has another
 */

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  try {
    console.log('🧪 Testing Authentication Conflict Resolution');
    console.log('=============================================');
    
    // Create two pages to simulate different sessions
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    console.log('\n1️⃣ Setting up first session with user1...');
    await page1.goto('http://localhost:3001/login');
    
    // Login as first user (assuming test users exist)
    await page1.fill('input[name="email"]', 'progressions@gmail.com');
    await page1.fill('input[name="password"]', 'password');
    await page1.click('button[type="submit"]');
    
    // Wait for login to complete
    await page1.waitForURL('**/campaigns', { timeout: 10000 });
    console.log('   ✓ User 1 logged in successfully');
    
    // Get the JWT token from localStorage
    const jwt1 = await page1.evaluate(() => localStorage.getItem('jwtToken'));
    const user1Data = await page1.evaluate(() => {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('currentUser-')) {
          return { key, value: localStorage.getItem(key) };
        }
      }
      return null;
    });
    
    console.log('   ✓ User 1 data stored in localStorage');
    
    console.log('\n2️⃣ Simulating conflict by injecting different user data...');
    
    // Navigate to page2 and inject conflicting localStorage data
    await page2.goto('http://localhost:3001/login');
    
    // Inject user1's token but different user data to simulate conflict
    await page2.evaluate((jwt) => {
      localStorage.setItem('jwtToken', jwt);
      localStorage.setItem(`currentUser-${jwt}`, JSON.stringify({
        id: 'fake-user-id',
        email: 'fake@example.com',
        name: 'Fake User'
      }));
    }, jwt1);
    
    console.log('   ✓ Injected conflicting user data');
    
    console.log('\n3️⃣ Navigating to trigger conflict detection...');
    
    // Navigate to a protected route to trigger AppContext initialization
    await page2.goto('http://localhost:3001/campaigns');
    
    // Wait a moment for conflict detection to occur
    await page2.waitForTimeout(2000);
    
    // Check if we were redirected to login
    const currentUrl = page2.url();
    if (currentUrl.includes('/login')) {
      console.log('   ✅ Successfully redirected to /login after conflict detection!');
      
      // Verify localStorage was cleared
      const remainingData = await page2.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('currentUser') || key.includes('currentCampaign'))) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });
      
      if (Object.keys(remainingData).length === 0) {
        console.log('   ✅ localStorage successfully cleared!');
      } else {
        console.log('   ⚠️ Some localStorage data remains:', remainingData);
      }
      
      console.log('\n✨ Authentication conflict resolution test PASSED!');
    } else {
      console.log('   ❌ Not redirected to login. Current URL:', currentUrl);
      console.log('\n❌ Authentication conflict resolution test FAILED');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
})();