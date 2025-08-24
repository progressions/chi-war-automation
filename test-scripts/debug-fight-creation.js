const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testFightCreationWithDebugLogging() {
  console.log('🚀 Starting Debug Fight Creation Test');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true // Open dev tools to see console logs
  });
  
  const page = await browser.newPage();
  
  // Listen to console messages from the browser
  page.on('console', msg => {
    if (msg.text().includes('🔄')) {
      console.log('🎯 FRONTEND:', msg.text());
    }
  });
  
  try {
    console.log('🔐 Step 1: Login as gamemaster');
    await loginAsGamemaster(page, { takeScreenshot: false });
    
    console.log('🎮 Step 2: Navigate to fights page');
    await page.goto('http://localhost:3005/fights');
    await page.waitForLoadState('networkidle');
    
    // Wait a moment for WebSocket subscription to be set up
    await page.waitForTimeout(2000);
    
    console.log('✨ Step 3: Create a new fight');
    await page.click('button:has-text("Create Fight")');
    await page.waitForSelector('form');
    
    console.log('📝 Step 4: Fill fight form');
    await page.fill('input[name="name"]', 'Debug Test Fight');
    await page.fill('textarea[name="description"]', 'Testing WebSocket reload mechanism');
    
    console.log('💾 Step 5: Save fight (should trigger WebSocket broadcast)');
    await page.click('button[type="submit"]');
    
    // Wait for the save operation and potential WebSocket updates
    console.log('⏳ Step 6: Waiting for WebSocket updates...');
    await page.waitForTimeout(5000);
    
    console.log('✅ Debug test completed - check logs for WebSocket flow');
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    await page.screenshot({ path: 'test-results/debug-fight-creation-error.png' });
  } finally {
    console.log('🔚 Closing browser (manual review of dev tools)');
    // Don't auto-close so you can review dev tools
    // await browser.close();
  }
}

// Run the test
testFightCreationWithDebugLogging().catch(console.error);