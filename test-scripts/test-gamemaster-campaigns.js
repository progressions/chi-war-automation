const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Testing Gamemaster Campaigns View');
  
  const browser = await chromium.launch({ headless: false }); // Show browser for debugging
  const page = await browser.newPage();
  
  try {
    // 1. Login as seeded gamemaster
    console.log('🔐 Logging in as progressions@gmail.com...');
    await page.goto('http://localhost:3005/login');
    await page.fill('input[name="email"]', 'progressions@gmail.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForLoadState('networkidle');
    console.log('✅ Logged in, current URL:', page.url());
    
    // Navigate to campaigns page if not already there
    if (!page.url().includes('/campaigns')) {
      console.log('📍 Navigating to campaigns page...');
      await page.goto('http://localhost:3005/campaigns');
      await page.waitForLoadState('networkidle');
    }
    
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // 2. Check what's on the campaigns page
    console.log('\n📊 Checking campaigns page content...');
    
    // Check for table/grid
    const hasTable = await page.locator('table').count() > 0;
    const hasGrid = await page.locator('[role="grid"]').count() > 0;
    console.log('Has table:', hasTable);
    console.log('Has grid:', hasGrid);
    
    // Check for "No rows" text
    const noRowsVisible = await page.locator('text="No rows"').isVisible().catch(() => false);
    console.log('Shows "No rows":', noRowsVisible);
    
    // Check for specific campaigns
    const testCampaignVisible = await page.locator('text="Test Campaign"').isVisible().catch(() => false);
    const secondaryCampaignVisible = await page.locator('text="Secondary Campaign"').isVisible().catch(() => false);
    const thirdCampaignVisible = await page.locator('text="Third Campaign"').isVisible().catch(() => false);
    
    console.log('\n🎮 Campaign visibility:');
    console.log('  Test Campaign:', testCampaignVisible);
    console.log('  Secondary Campaign:', secondaryCampaignVisible);
    console.log('  Third Campaign:', thirdCampaignVisible);
    
    // Get all text content from the grid/table
    if (hasGrid) {
      const gridContent = await page.locator('[role="grid"]').textContent();
      console.log('\nGrid content:', gridContent);
    }
    
    // 3. Check JWT token and make direct API call
    console.log('\n🔑 Checking authentication...');
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
      console.log('\n📡 Making direct API call from browser...');
      const apiResponse = await page.evaluate(async (token) => {
        try {
          const response = await fetch('http://localhost:3004/api/v2/campaigns', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return { 
            status: response.status, 
            data: data,
            campaignCount: data.campaigns ? data.campaigns.length : 0
          };
        } catch (error) {
          return { error: error.message };
        }
      }, token);
      
      console.log('API Response status:', apiResponse.status);
      console.log('Number of campaigns from API:', apiResponse.campaignCount);
      if (apiResponse.data && apiResponse.data.campaigns) {
        console.log('Campaign names from API:');
        apiResponse.data.campaigns.forEach(c => {
          console.log(`  - ${c.name} (active: ${c.active})`);
        });
      }
    }
    
    // 4. Check console errors
    console.log('\n🔍 Checking for console errors...');
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // 5. Take screenshot
    await page.screenshot({ path: 'test-results/gamemaster-campaigns-view.png', fullPage: true });
    console.log('\n📸 Screenshot saved to test-results/gamemaster-campaigns-view.png');
    
    // Wait to observe
    console.log('\n⏳ Waiting 10 seconds to observe...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/gamemaster-campaigns-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\n✅ Test completed');
  }
})();