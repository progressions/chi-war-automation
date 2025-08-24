const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testWebSocketFightReload() {
  console.log('🚀 Starting WebSocket Fight Reload Test');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  // Listen to console messages from the browser
  page.on('console', msg => {
    if (msg.text().includes('🔄')) {
      console.log('🎯 FRONTEND WEBSOCKET:', msg.text());
    }
  });
  
  try {
    console.log('🔐 Step 1: Login as gamemaster');
    await loginAsGamemaster(page, { takeScreenshot: false });
    
    console.log('🎮 Step 2: Navigate to fights page and establish WebSocket connection');
    await page.goto('http://localhost:3005/fights');
    await page.waitForLoadState('networkidle');
    
    // Wait for WebSocket subscription to be established
    console.log('⏳ Waiting for WebSocket subscription to be established...');
    await page.waitForTimeout(3000);
    
    console.log('📡 Step 3: Create fight via backend API to trigger WebSocket broadcast');
    
    // Now create a fight via backend while browser is connected
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    const createFightCommand = `
      source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails runner "
      puts '🎮 Creating fight via backend to test WebSocket...'
      user = User.find_by(email: 'progressions@gmail.com')
      fight = user.current_campaign.fights.create!(
        name: 'WebSocket Test Fight #{Time.current.to_i}',
        description: 'Testing WebSocket reload with connected client'
      )
      puts \\\"✅ Fight created: #{fight.name} (ID: #{fight.id})\\\"
      puts '📡 WebSocket broadcast should have been sent...'
      "
    `;
    
    console.log('💾 Creating fight via Rails backend...');
    const { stdout, stderr } = await execPromise(createFightCommand, { 
      cwd: '/Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server',
      timeout: 10000 
    });
    
    console.log('📤 Backend output:', stdout);
    if (stderr) console.log('⚠️ Backend stderr:', stderr);
    
    console.log('⏳ Step 4: Waiting for WebSocket message and automatic reload...');
    await page.waitForTimeout(5000);
    
    console.log('✅ WebSocket test completed - check console logs for frontend reactions');
    await page.screenshot({ path: 'test-results/websocket-test-after-fight-creation.png' });
    
  } catch (error) {
    console.error('❌ WebSocket test failed:', error);
    await page.screenshot({ path: 'test-results/websocket-test-error.png' });
  } finally {
    console.log('🔚 Test completed - browser left open for manual inspection');
    // Leave browser open for manual inspection
  }
}

// Run the test
testWebSocketFightReload().catch(console.error);