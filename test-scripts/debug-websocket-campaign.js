const { chromium } = require('playwright');

async function debugWebSocketCampaign() {
  console.log('🐛 DEBUG: Testing WebSocket campaign reload...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000,
    devtools: true 
  });
  const page = await browser.newPage();
  
  try {
    // Login as existing gamemaster
    await page.goto('http://localhost:3005/login');
    await page.fill('input[name="email"]', 'progressions@gmail.com');
    await page.fill('input[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to campaigns page
    await page.waitForURL(/.*campaigns.*/);
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in successfully');
    
    // Open browser console to monitor WebSocket messages
    console.log('📊 Open browser DevTools and watch Network/WS tab for WebSocket messages');
    
    // Count existing campaigns
    const beforeCount = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`📊 Campaigns before: ${beforeCount}`);
    
    // Create new campaign
    await page.click('button:has-text("Create Campaign")');
    await page.fill('input[name="name"]', `Debug Test Campaign ${Date.now()}`);
    await page.click('button[type="submit"]');
    
    console.log('✅ Campaign creation submitted');
    
    // Wait and check if table reloads automatically
    console.log('⏳ Waiting 10 seconds for WebSocket reload...');
    await page.waitForTimeout(10000);
    
    const afterCount = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`📊 Campaigns after WebSocket wait: ${afterCount}`);
    
    if (afterCount > beforeCount) {
      console.log('🎉 SUCCESS: Table reloaded automatically via WebSocket!');
    } else {
      console.log('❌ FAILED: Table did not reload automatically');
      
      // Manual refresh to confirm campaign was created
      await page.reload();
      await page.waitForTimeout(2000);
      const afterRefreshCount = await page.$$eval('tbody tr', rows => rows.length);
      console.log(`📊 Campaigns after manual refresh: ${afterRefreshCount}`);
      
      if (afterRefreshCount > beforeCount) {
        console.log('✅ Campaign was created successfully (but WebSocket reload failed)');
      }
    }
    
    // Keep browser open for manual inspection
    console.log('🔍 Keeping browser open for manual inspection. Press Ctrl+C to close.');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await browser.close();
}

debugWebSocketCampaign().catch(console.error);