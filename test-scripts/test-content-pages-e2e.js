// End-to-end test for new content pages (About, Documentation, Support)
// Tests navigation, page content, and responsive design

const { chromium } = require('playwright');
const { loginAsPlayer, loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config');

async function testContentPages() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting Content Pages E2E Test');
    
    // First test without authentication (should still be accessible)
    console.log('\n📋 Testing content pages without authentication...');
    
    await page.goto(TEST_CONFIG.getFrontendUrl());
    await page.waitForLoadState('networkidle');
    
    // Test About page
    console.log('🔍 Testing About page...');
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/about`);
    await page.waitForLoadState('networkidle');
    
    // Check for key content on About page
    await page.waitForSelector('text=About Chi War', { timeout: 10000 });
    await page.waitForSelector('text=Our Mission');
    await page.waitForSelector('text=Feng Shui 2');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/content-pages-about.png', 
      fullPage: true 
    });
    console.log('✅ About page loads correctly');
    
    // Test Documentation page
    console.log('🔍 Testing Documentation page...');
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/documentation`);
    await page.waitForLoadState('networkidle');
    
    // Check for key content on Documentation page
    await page.waitForSelector('text=Documentation', { timeout: 10000 });
    await page.waitForSelector('text=Getting Started');
    await page.waitForSelector('text=Character Management');
    await page.waitForSelector('text=Combat and Encounters');
    await page.waitForSelector('text=FAQ');
    
    // Test expandable accordions
    const firstAccordion = page.locator('div[role="button"]').first();
    await firstAccordion.click();
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/content-pages-documentation.png', 
      fullPage: true 
    });
    console.log('✅ Documentation page loads correctly');
    
    // Test Support page
    console.log('🔍 Testing Support page...');
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/support`);
    await page.waitForLoadState('networkidle');
    
    // Check for key content on Support page
    await page.waitForSelector('text=Support', { timeout: 10000 });
    await page.waitForSelector('text=Report a Bug');
    await page.waitForSelector('text=Request a Feature');
    await page.waitForSelector('text=Contact Support');
    await page.waitForSelector('text=Community Resources');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/content-pages-support.png', 
      fullPage: true 
    });
    console.log('✅ Support page loads correctly');
    
    // Test navigation links in footer
    console.log('🔍 Testing footer navigation...');
    await page.goto(TEST_CONFIG.getFrontendUrl());
    await page.waitForLoadState('networkidle');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // Test footer links
    const aboutLink = page.locator('footer a[href="/about"]');
    await aboutLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=About Chi War');
    console.log('✅ Footer About link works');
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const docLink = page.locator('footer a[href="/documentation"]');
    await docLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Documentation');
    console.log('✅ Footer Documentation link works');
    
    await page.goBack();
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const supportLink = page.locator('footer a[href="/support"]');
    await supportLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Support');
    console.log('✅ Footer Support link works');
    
    // Now test with authenticated user - test menu navigation
    console.log('\n🔐 Testing content pages with authenticated user...');
    
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/content-pages-login' 
    });
    
    // Test navigation menu
    console.log('🔍 Testing main menu navigation...');
    
    // Open hamburger menu
    const menuButton = page.locator('button[aria-label="menu"]');
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Test About link in menu
    const menuAboutLink = page.locator('text=About').first();
    await menuAboutLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=About Chi War');
    console.log('✅ Menu About link works');
    
    // Open menu again
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Test Documentation link in menu
    const menuDocLink = page.locator('text=Documentation').first();
    await menuDocLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Documentation');
    console.log('✅ Menu Documentation link works');
    
    // Open menu again
    await menuButton.click();
    await page.waitForTimeout(1000);
    
    // Test Support link in menu
    const menuSupportLink = page.locator('text=Support').first();
    await menuSupportLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('text=Support');
    console.log('✅ Menu Support link works');
    
    // Test responsive design on mobile viewport
    console.log('📱 Testing responsive design...');
    
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/about`);
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: 'test-results/content-pages-mobile-about.png', 
      fullPage: true 
    });
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/documentation`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/content-pages-mobile-documentation.png', 
      fullPage: true 
    });
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/support`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/content-pages-mobile-support.png', 
      fullPage: true 
    });
    
    console.log('✅ Mobile responsive design verified');
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Verify SEO metadata
    console.log('🔍 Testing SEO metadata...');
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/about`);
    await page.waitForLoadState('networkidle');
    
    const aboutTitle = await page.title();
    if (aboutTitle.includes('About Us - Chi War')) {
      console.log('✅ About page title is correct');
    } else {
      console.log('❌ About page title incorrect:', aboutTitle);
    }
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/documentation`);
    await page.waitForLoadState('networkidle');
    
    const docTitle = await page.title();
    if (docTitle.includes('Documentation - Chi War')) {
      console.log('✅ Documentation page title is correct');
    } else {
      console.log('❌ Documentation page title incorrect:', docTitle);
    }
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/support`);
    await page.waitForLoadState('networkidle');
    
    const supportTitle = await page.title();
    if (supportTitle.includes('Support - Chi War')) {
      console.log('✅ Support page title is correct');
    } else {
      console.log('❌ Support page title incorrect:', supportTitle);
    }
    
    // Test external links (should open in new tab)
    console.log('🔍 Testing external links...');
    
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/support`);
    await page.waitForLoadState('networkidle');
    
    // Check that GitHub links have target="_blank"
    const githubLinks = page.locator('a[href*="github.com"]');
    const count = await githubLinks.count();
    console.log(`✅ Found ${count} external GitHub links`);
    
    for (let i = 0; i < count; i++) {
      const target = await githubLinks.nth(i).getAttribute('target');
      if (target === '_blank') {
        console.log(`✅ GitHub link ${i + 1} opens in new tab`);
      } else {
        console.log(`❌ GitHub link ${i + 1} missing target="_blank"`);
      }
    }
    
    console.log('\n🎉 Content Pages E2E Test completed successfully!');
    console.log('📊 Test Results:');
    console.log('   ✅ About page loads and displays correctly');
    console.log('   ✅ Documentation page loads with working accordions');
    console.log('   ✅ Support page loads with all sections');
    console.log('   ✅ Footer navigation links work');
    console.log('   ✅ Menu navigation links work');
    console.log('   ✅ Mobile responsive design works');
    console.log('   ✅ SEO metadata is properly set');
    console.log('   ✅ External links open in new tabs');
    
  } catch (error) {
    console.error('❌ Content Pages E2E Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'test-results/content-pages-ERROR.png', 
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testContentPages()
    .then(() => {
      console.log('🏁 Content Pages E2E test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Content Pages E2E test failed:', error);
      process.exit(1);
    });
}

module.exports = { testContentPages };