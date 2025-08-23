/**
 * Seeded User Journey Test
 * 
 * Tests the user journey using existing seeded users instead of registration
 * This avoids creating duplicate accounts and tests with clean seed data
 */

const { chromium } = require('playwright');
const path = require('path');
const TEST_CONFIG = require('./test-config');

// Helper imports
const { takeScreenshot, waitForPageLoad } = require('./helpers/user-registration-helper');
const { loginToChiWar } = require('./login-helper');

async function testSeededUserJourney() {
  console.log('🚀 Starting Seeded User Journey Test');
  console.log(`📧 GM: ${TEST_CONFIG.SEEDED_USERS.gamemaster.email}`);
  console.log(`👤 Player: ${TEST_CONFIG.SEEDED_USERS.player.email}`);
  console.log(`🎯 Frontend: ${TEST_CONFIG.getFrontendUrl()}`);
  console.log(`🔗 Backend: ${TEST_CONFIG.getBackendUrl()}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n🔐 Step 1: Login as Gamemaster');
    
    // Login as seeded gamemaster
    await loginToChiWar(
      page, 
      TEST_CONFIG.SEEDED_USERS.gamemaster.email, 
      TEST_CONFIG.SEEDED_USERS.gamemaster.password,
      { 
        takeScreenshot: true, 
        screenshotPath: 'test-results/seeded-user-journey'
      }
    );
    
    console.log('✅ Gamemaster login successful');
    
    console.log('\n📋 Step 2: Navigate to Campaigns');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '02-campaigns-page', 'test-results/seeded-user-journey');
    
    console.log('\n👥 Step 3: Navigate to Characters');
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '03-characters-page', 'test-results/seeded-user-journey');
    
    console.log('\n⚔️ Step 4: Navigate to Fights');
    await page.goto(TEST_CONFIG.getFightsUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '04-fights-page', 'test-results/seeded-user-journey');
    
    console.log('\n👤 Step 5: Navigate to Profile');
    await page.goto(TEST_CONFIG.getProfileUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '05-profile-page', 'test-results/seeded-user-journey');
    
    console.log('\n🎉 Seeded User Journey Test Completed Successfully!');
    console.log('📸 Screenshots saved to: test-results/seeded-user-journey');
    
    return {
      success: true,
      message: 'All navigation tests passed with seeded gamemaster user'
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await takeScreenshot(page, 'error-state', 'test-results/seeded-user-journey');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testSeededUserJourney().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testSeededUserJourney
};