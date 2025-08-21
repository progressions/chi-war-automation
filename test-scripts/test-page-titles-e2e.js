const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

/**
 * Comprehensive E2E test for page titles across the application
 * Tests both static and dynamic page titles
 */
async function testPageTitlesE2E() {
  console.log('📄 Starting Page Titles E2E Test...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // ===== PHASE 1: Test Authentication Page Titles =====
    console.log('\n🔐 PHASE 1: Testing authentication page titles...');
    
    // Test Forgot Password page title
    await page.goto('http://localhost:3005/forgot-password');
    await page.waitForLoadState('networkidle');
    const forgotPasswordTitle = await page.title();
    console.log(`✓ Forgot Password: "${forgotPasswordTitle}"`);
    await page.screenshot({ path: 'test-results/titles-01-forgot-password.png', fullPage: true });
    
    if (forgotPasswordTitle !== 'Forgot Password - Chi War') {
      throw new Error(`Expected "Forgot Password - Chi War", got "${forgotPasswordTitle}"`);
    }
    
    // Test Reset Password page title (with mock token)
    await page.goto('http://localhost:3005/reset-password/mock-token');
    await page.waitForLoadState('networkidle');
    const resetPasswordTitle = await page.title();
    console.log(`✓ Reset Password: "${resetPasswordTitle}"`);
    await page.screenshot({ path: 'test-results/titles-02-reset-password.png', fullPage: true });
    
    if (resetPasswordTitle !== 'Reset Password - Chi War') {
      throw new Error(`Expected "Reset Password - Chi War", got "${resetPasswordTitle}"`);
    }

    // ===== PHASE 2: Login and Test Main App Pages =====
    console.log('\n👤 PHASE 2: Testing main application page titles...');
    
    // Login as gamemaster using helper (use test port 3005)
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/titles-03-login-success.png',
      port: 3005
    });
    
    // Test main page titles after login
    const mainPages = [
      { path: '/campaigns', expectedTitle: 'Campaigns - Chi War' },
      { path: '/characters', expectedTitle: 'Characters - Chi War' },
      { path: '/fights', expectedTitle: 'Fights - Chi War' },
      { path: '/vehicles', expectedTitle: 'Vehicles - Chi War' },
      { path: '/schticks', expectedTitle: 'Schticks - Chi War' },
      { path: '/weapons', expectedTitle: 'Weapons - Chi War' },
      { path: '/sites', expectedTitle: 'Sites - Chi War' },
      { path: '/parties', expectedTitle: 'Parties - Chi War' },
      { path: '/factions', expectedTitle: 'Factions - Chi War' },
      { path: '/junctures', expectedTitle: 'Junctures - Chi War' },
      { path: '/users', expectedTitle: 'Users - Chi War' }
    ];
    
    for (let i = 0; i < mainPages.length; i++) {
      const { path, expectedTitle } = mainPages[i];
      await page.goto(`http://localhost:3005${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Give time for any client-side updates
      
      const actualTitle = await page.title();
      console.log(`✓ ${path}: "${actualTitle}"`);
      
      if (actualTitle !== expectedTitle) {
        throw new Error(`Path ${path}: Expected "${expectedTitle}", got "${actualTitle}"`);
      }
      
      await page.screenshot({ 
        path: `test-results/titles-main-${i.toString().padStart(2, '0')}-${path.replace('/', '')}.png`, 
        fullPage: false 
      });
    }

    // ===== PHASE 3: Test Profile Page Title =====
    console.log('\n👤 PHASE 3: Testing profile page title...');
    
    await page.goto('http://localhost:3005/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Profile page might take time to load
    
    const profileTitle = await page.title();
    console.log(`✓ Profile: "${profileTitle}"`);
    await page.screenshot({ path: 'test-results/titles-04-profile.png', fullPage: true });
    
    if (profileTitle !== 'Profile - Chi War') {
      throw new Error(`Expected "Profile - Chi War", got "${profileTitle}"`);
    }

    // ===== PHASE 4: Test Dynamic Page Titles =====
    console.log('\n🎯 PHASE 4: Testing dynamic page titles...');
    
    // Test campaign detail page (dynamic title)
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForLoadState('networkidle');
    
    // Find and click on a campaign link
    const campaignLinks = page.locator('a[href*="/campaigns/"]:not([href$="/campaigns"])');
    const campaignCount = await campaignLinks.count();
    
    if (campaignCount > 0) {
      await campaignLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const campaignTitle = await page.title();
      console.log(`✓ Campaign Detail: "${campaignTitle}"`);
      await page.screenshot({ path: 'test-results/titles-05-campaign-detail.png', fullPage: true });
      
      // Should end with " - Chi War" and not be just "Campaign - Chi War"
      if (!campaignTitle.endsWith(' - Chi War') || campaignTitle === 'Campaign - Chi War') {
        console.log('⚠️ Warning: Campaign title might not be dynamic');
      } else {
        console.log('✓ Dynamic campaign title working');
      }
    } else {
      console.log('⚠️ No campaigns found to test dynamic titles');
    }
    
    // Test fight detail page if fights exist
    await page.goto('http://localhost:3005/fights');
    await page.waitForLoadState('networkidle');
    
    const fightLinks = page.locator('a[href*="/fights/"]:not([href$="/fights"])');
    const fightCount = await fightLinks.count();
    
    if (fightCount > 0) {
      await fightLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const fightTitle = await page.title();
      console.log(`✓ Fight Detail: "${fightTitle}"`);
      await page.screenshot({ path: 'test-results/titles-06-fight-detail.png', fullPage: true });
      
      if (!fightTitle.endsWith(' - Chi War')) {
        console.log('⚠️ Warning: Fight title might not be dynamic');
      } else {
        console.log('✓ Dynamic fight title working');
      }
    } else {
      console.log('⚠️ No fights found to test dynamic titles');
    }

    // ===== PHASE 5: Final Summary =====
    console.log('\n📊 PHASE 5: Test Summary...');
    console.log('✅ Authentication page titles verified');
    console.log('✅ Main application page titles verified'); 
    console.log('✅ Profile page title verified');
    console.log('✅ Dynamic page titles tested');
    console.log('\n🎉 Page Titles E2E Test Completed Successfully!');
    console.log('\n📁 Screenshots saved in test-results/ directory');

  } catch (error) {
    console.error('\n❌ Page Titles E2E Test Failed:', error.message);
    await page.screenshot({ 
      path: 'test-results/titles-ERROR.png', 
      fullPage: true 
    });
    throw error;
    
  } finally {
    await browser.close();
  }
}

// Run the test if called directly
if (require.main === module) {
  testPageTitlesE2E()
    .then(() => {
      console.log('\n🏁 Test execution completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testPageTitlesE2E };