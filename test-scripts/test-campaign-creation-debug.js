const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Starting Campaign Creation Debug Test');
  
  // Generate unique email
  const timestamp = Date.now();
  const email = `test_${timestamp}@example.com`;
  const password = 'TestPass123!';
  
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const page = await browser.newPage();
  
  try {
    // 1. Register new user
    console.log('📝 Registering new user:', email);
    await page.goto('http://localhost:3005/register');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="passwordConfirmation"]', password);
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.check('input[name="gamemaster"]');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/confirmation-pending', { timeout: 5000 });
    
    // 2. Confirm email
    console.log('📧 Confirming email...');
    const response = await fetch('http://localhost:3004/api/v2/users/confirm_test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    const confirmationUrl = `http://localhost:3004/users/confirmation?confirmation_token=${data.confirmation_token}`;
    await page.goto(confirmationUrl);
    
    // 3. Login
    console.log('🔐 Logging in...');
    await page.goto('http://localhost:3005/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/campaigns*', { timeout: 10000 });
    
    // 4. Create campaign
    console.log('🎮 Creating campaign...');
    await page.click('button:has-text("Create Your First Campaign")');
    await page.waitForSelector('form', { timeout: 5000 });
    await page.fill('input[name="name"]', 'Debug Test Campaign');
    await page.click('button[type="submit"]');
    
    // Wait a moment for the form to close
    await page.waitForTimeout(2000);
    
    // 5. Check if campaign appears
    console.log('🔍 Checking if campaign appears in table...');
    
    // Log what we see on the page
    const tableContent = await page.locator('table').textContent().catch(() => 'No table found');
    console.log('Table content:', tableContent);
    
    const gridContent = await page.locator('[role="grid"]').textContent().catch(() => 'No grid found');
    console.log('Grid content:', gridContent);
    
    // Check for "No rows" text
    const noRowsText = await page.locator('text="No rows"').isVisible().catch(() => false);
    console.log('Shows "No rows":', noRowsText);
    
    // Try to find the campaign name anywhere on the page
    const campaignVisible = await page.locator('text="Debug Test Campaign"').isVisible().catch(() => false);
    console.log('Campaign visible on page:', campaignVisible);
    
    // Check localStorage for JWT token
    const token = await page.evaluate(() => {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        if (cookie.trim().startsWith('jwt=')) {
          return cookie.trim().substring(4);
        }
      }
      return localStorage.getItem('jwt');
    });
    console.log('JWT token found:', !!token);
    
    if (token) {
      // Make direct API call from the browser
      const apiResponse = await page.evaluate(async (token) => {
        const response = await fetch('http://localhost:3004/api/v2/campaigns', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        return await response.json();
      }, token);
      console.log('Direct API response:', JSON.stringify(apiResponse, null, 2));
    }
    
    // Wait to see what happens
    console.log('⏳ Waiting 10 seconds to observe...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
})();