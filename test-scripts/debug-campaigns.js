// Debug Campaigns Page Access
// This script tests if authenticated users can access the campaigns page

const { chromium } = require('playwright');

async function debugCampaigns() {
  console.log('📊 Starting Campaigns Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login first
    console.log('📍 Step 1: Logging in...');
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    await page.getByText('Sign In').click();
    
    await page.waitForTimeout(3000);
    console.log('Login URL after submit:', page.url());
    
    // Step 2: Try to access campaigns directly
    console.log('📍 Step 2: Accessing /campaigns directly...');
    await page.goto('http://localhost:3001/campaigns');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const campaignsUrl = page.url();
    console.log('Campaigns page URL:', campaignsUrl);
    
    if (campaignsUrl.includes('/campaigns') && !campaignsUrl.includes('/login')) {
      console.log('✅ Successfully accessed campaigns page');
      
      // Check for campaigns content
      const pageTitle = await page.textContent('h1').catch(() => null);
      console.log('Page title:', pageTitle);
      
    } else if (campaignsUrl.includes('/login')) {
      console.log('❌ Redirected to login page');
    } else {
      console.log('⚠️ Unexpected redirect:', campaignsUrl);
    }
    
    // Step 3: Try to access fights page to test redirect
    console.log('📍 Step 3: Accessing /fights to test redirect...');
    await page.goto('http://localhost:3001/fights');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const fightsUrl = page.url();
    console.log('Fights page URL after access:', fightsUrl);
    
    if (fightsUrl.includes('/campaigns')) {
      console.log('✅ Successfully redirected from /fights to /campaigns');
    } else if (fightsUrl.includes('/login')) {
      console.log('❌ Incorrectly redirected from /fights to /login');  
    } else if (fightsUrl.includes('/fights')) {
      console.log('✅ Access to /fights granted (has campaign)');
    } else {
      console.log('⚠️ Unexpected redirect from /fights:', fightsUrl);
    }
    
  } catch (error) {
    console.error('❌ Campaigns debug failed:', error);
    await page.screenshot({ path: 'test-results/campaigns-debug-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
if (require.main === module) {
  debugCampaigns()
    .then(() => {
      console.log('✅ Campaigns debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Campaigns debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugCampaigns };