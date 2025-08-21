const { chromium } = require('playwright');
const { loginAsPlayer, loginAsGamemaster } = require('./login-helper');

async function testLoadingStatesE2E() {
  console.log('🧪 Testing Loading States - End-to-End...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // Slow down actions to better see loading states
  });
  
  const page = await browser.newPage();
  
  // Throttle network to see loading states
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: 500 * 1024, // 500 KB/s
    uploadThroughput: 500 * 1024,   // 500 KB/s
    latency: 100, // 100ms latency
  });
  
  try {
    console.log('🔐 Logging in as gamemaster...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results',
      port: 3005 
    });
    
    const testPages = [
      { path: '/campaigns', name: 'Campaigns', expectedSkeletons: ['ListPageSkeleton', 'SkeletonText'] },
      { path: '/characters', name: 'Characters', expectedSkeletons: ['ListPageSkeleton', 'SkeletonAvatar'] },
      { path: '/fights', name: 'Fights', expectedSkeletons: ['ListPageSkeleton', 'SkeletonCard'] },
    ];
    
    for (const testPage of testPages) {
      console.log(`\n📄 Testing ${testPage.name} loading states...`);
      
      // Navigate and capture initial loading state
      const navigationPromise = page.goto(`http://localhost:3005${testPage.path}`, {
        waitUntil: 'domcontentloaded'
      });
      
      // Immediately take screenshot to capture loading state
      await page.waitForTimeout(100);
      await page.screenshot({ 
        path: `test-results/loading-${testPage.name.toLowerCase()}-initial.png`,
        fullPage: true 
      });
      
      // Wait for navigation to complete
      await navigationPromise;
      
      // Check for skeleton elements during loading
      const skeletonSelectors = [
        '[class*="MuiSkeleton"]',
        '[data-testid*="skeleton"]',
        '.skeleton',
        '[class*="skeleton"]'
      ];
      
      let skeletonFound = false;
      for (const selector of skeletonSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          console.log(`📊 Found ${count} skeleton elements with selector: ${selector}`);
          skeletonFound = true;
          break;
        }
      }
      
      if (!skeletonFound) {
        console.log(`⚠️  No skeleton elements found on ${testPage.name} page`);
        
        // Check for our specific skeleton components in the page source
        const pageContent = await page.content();
        const hasListPageSkeleton = pageContent.includes('ListPageSkeleton');
        const hasSkeletonComponents = pageContent.includes('SkeletonText') || 
                                    pageContent.includes('SkeletonCard') ||
                                    pageContent.includes('SkeletonAvatar');
        
        console.log(`🔍 Page contains ListPageSkeleton: ${hasListPageSkeleton}`);
        console.log(`🔍 Page contains Skeleton components: ${hasSkeletonComponents}`);
      }
      
      // Wait for content to fully load
      await page.waitForLoadState('networkidle');
      
      // Take final screenshot
      await page.screenshot({ 
        path: `test-results/loading-${testPage.name.toLowerCase()}-final.png`,
        fullPage: true 
      });
      
      // Check for actual content
      const hasContent = await page.locator('table, [data-testid*="card"], .MuiCard-root').count() > 0;
      console.log(`✅ ${testPage.name} page loaded with content: ${hasContent}`);
      
      await page.waitForTimeout(2000);
    }
    
    console.log('\n🎉 End-to-end loading states test completed!');
    console.log('📸 Screenshots saved to test-results/ directory');
    console.log('\nResults Summary:');
    console.log('- Check initial screenshots for skeleton loading states');
    console.log('- Check final screenshots for loaded content');
    console.log('- Review browser console for any errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'test-results/loading-states-error.png',
      fullPage: true 
    });
    
  } finally {
    await browser.close();
  }
}

// Run the test
testLoadingStatesE2E().catch(console.error);