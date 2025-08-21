// Simple test to verify skeleton components are rendering correctly
const { chromium } = require('playwright');

async function testSkeletonComponents() {
  console.log('🧪 Testing Skeleton Components Implementation...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Test the login page first (doesn't require auth)
    console.log('\n📄 Testing login page (public)...');
    await page.goto('http://localhost:3005/login');
    await page.screenshot({ 
      path: 'test-results/login-page-test.png',
      fullPage: true 
    });
    console.log('✅ Login page loaded successfully');
    
    // Check browser console for any errors
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Try to access a protected page to see if we get skeletons or error handling
    console.log('\n📄 Testing protected page access (should show error or redirect)...');
    await page.goto('http://localhost:3005/campaigns');
    
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/protected-page-test.png',
      fullPage: true 
    });
    
    // Check if we're redirected to login
    const currentUrl = page.url();
    console.log(`Current URL after accessing protected page: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('✅ Correctly redirected to login page');
    } else {
      console.log('⚠️  No redirect - may be showing error page or loading state');
      
      // Check for skeleton elements
      const skeletonElements = await page.locator('[class*="MuiSkeleton"]').count();
      console.log(`📊 Found ${skeletonElements} MUI skeleton elements`);
      
      // Check page content for our skeleton components
      const pageContent = await page.content();
      const hasListPageSkeleton = pageContent.includes('data-testid') && 
                                 (pageContent.includes('skeleton') || pageContent.includes('loading'));
      console.log(`🔍 Page appears to have loading/skeleton content: ${hasListPageSkeleton}`);
    }
    
    // Print any console logs from the browser
    if (logs.length > 0) {
      console.log('\n📋 Browser console logs:');
      logs.forEach(log => console.log(`   ${log}`));
    }
    
    console.log('\n🎉 Skeleton components test completed!');
    console.log('📸 Screenshots saved to test-results/ directory');
    
    console.log('\n📝 Manual verification checklist:');
    console.log('1. Check login-page-test.png - should show clean login form');
    console.log('2. Check protected-page-test.png - should show either:');
    console.log('   - Redirect to login page, OR');
    console.log('   - Loading skeleton components, OR'); 
    console.log('   - Error page with proper styling');
    console.log('3. No console errors should be present');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    await page.screenshot({ 
      path: 'test-results/skeleton-test-error.png',
      fullPage: true 
    });
    
  } finally {
    await browser.close();
  }
}

// Run the test
testSkeletonComponents().catch(console.error);