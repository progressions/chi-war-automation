const { chromium } = require('playwright');

async function debugWebSocketDev() {
  console.log('🐛 DEBUG: Testing WebSocket campaign reload in DEVELOPMENT mode...');
  console.log('🌐 Frontend: http://localhost:3001');
  console.log('🌐 Backend: http://localhost:3000');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    devtools: true 
  });
  const page = await browser.newPage();
  
  try {
    // Login as existing gamemaster in development
    console.log('🔐 Logging in as development gamemaster...');
    await page.goto('http://localhost:3001/login');
    await page.fill('input[name="email"]', 'progressions@gmail.com');
    await page.fill('input[name="password"]', 'password'); // Development password
    await page.click('button[type="submit"]');
    
    // Wait for redirect to campaigns page
    await page.waitForURL(/.*campaigns.*/);
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in successfully');
    
    // Open DevTools console for WebSocket monitoring
    console.log('📊 Open browser DevTools -> Network tab -> WS filter to monitor WebSocket messages');
    console.log('📊 Watch for UserChannel and CampaignChannel connections');
    
    // Count existing campaigns
    const beforeCount = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`📊 Campaigns before creation: ${beforeCount}`);
    
    // Create new campaign
    console.log('🆕 Creating new campaign...');
    await page.click('button:has-text("Create Campaign")');
    await page.waitForTimeout(1000);
    
    const campaignName = `WebSocket Test ${Date.now()}`;
    await page.fill('input[name="name"]', campaignName);
    console.log(`📝 Campaign name: ${campaignName}`);
    
    await page.click('button[type="submit"]');
    
    console.log('✅ Campaign creation submitted');
    console.log('⏳ Waiting 8 seconds for WebSocket broadcast...');
    console.log('🔍 Watch DevTools for:');
    console.log('   - WebSocket messages to UserChannel');
    console.log('   - campaigns: "reload" message');
    console.log('   - Automatic table refresh');
    
    // Wait and check if table reloads automatically
    await page.waitForTimeout(8000);
    
    const afterCount = await page.$$eval('tbody tr', rows => rows.length);
    console.log(`📊 Campaigns after WebSocket wait: ${afterCount}`);
    
    if (afterCount > beforeCount) {
      console.log('🎉 SUCCESS: Table reloaded automatically via WebSocket!');
    } else {
      console.log('❌ FAILED: Table did not reload automatically');
      
      // Check if campaign exists with manual refresh
      console.log('🔄 Manual refresh to verify campaign was created...');
      await page.reload();
      await page.waitForTimeout(2000);
      const afterRefreshCount = await page.$$eval('tbody tr', rows => rows.length);
      console.log(`📊 Campaigns after manual refresh: ${afterRefreshCount}`);
      
      if (afterRefreshCount > beforeCount) {
        console.log('✅ Campaign was created successfully (WebSocket reload failed)');
      } else {
        console.log('❌ Campaign creation failed entirely');
      }
    }
    
    // Keep browser open for manual inspection
    console.log('');
    console.log('🔍 Browser kept open for manual WebSocket inspection');
    console.log('📋 In DevTools -> Network -> WS tab, you should see:');
    console.log('   1. Connection to CampaignChannel');
    console.log('   2. Connection to UserChannel');
    console.log('   3. campaigns: "reload" message after creation');
    console.log('');
    console.log('Press Ctrl+C to close when done inspecting...');
    
    await page.waitForTimeout(300000); // Wait 5 minutes for inspection
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await browser.close();
}

debugWebSocketDev().catch(console.error);