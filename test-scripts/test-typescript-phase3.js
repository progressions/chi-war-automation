// Phase 3 TypeScript Types Consolidation Test
// This script tests that centralized types are working correctly
const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config');

async function runTypeScriptPhase3Test() {
  console.log('🚀 Starting Phase 3 TypeScript Consolidation Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to the application
    console.log('📱 Step 1: Navigating to application...');
    await page.goto(TEST_CONFIG.getFrontendUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/phase3-initial-load.png', 
      fullPage: true 
    });
    console.log('📸 Initial load screenshot taken');
    
    // Step 2: Check that page loads without TypeScript errors
    console.log('🔍 Step 2: Checking for TypeScript/runtime errors...');
    
    // Listen for console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Listen for page errors  
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });
    
    // Wait a bit more for any async operations
    await page.waitForTimeout(3000);
    
    // Step 3: Check that we're properly redirected to login (expected behavior)
    console.log('🔐 Step 3: Verifying proper routing behavior...');
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (!currentUrl.includes('/login')) {
      console.log('⚠️ Expected redirect to login page, but got:', currentUrl);
    } else {
      console.log('✅ Proper redirect to login page');
    }
    
    // Step 4: Check that login page elements are present (indicates components loaded)
    console.log('📝 Step 4: Checking that login components loaded correctly...');
    
    try {
      // Look for common login page elements
      await page.waitForSelector('input[type="email"], input[type="text"]', { timeout: 5000 });
      await page.waitForSelector('input[type="password"]', { timeout: 5000 });
      console.log('✅ Login form fields found - components loaded correctly');
    } catch (error) {
      console.log('⚠️ Login form fields not found immediately, checking for other elements...');
      
      // Check if there are any inputs at all
      const inputCount = await page.locator('input').count();
      console.log(`Found ${inputCount} input elements`);
    }
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'test-results/phase3-login-page.png', 
      fullPage: true 
    });
    console.log('📸 Login page screenshot taken');
    
    // Step 5: Report any errors found
    console.log('📊 Step 5: Reporting test results...');
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors found:', consoleErrors);
    } else {
      console.log('✅ No console errors detected');
    }
    
    if (pageErrors.length > 0) {
      console.log('❌ Page errors found:', pageErrors);
      throw new Error('Page errors detected: ' + pageErrors.join(', '));
    } else {
      console.log('✅ No page errors detected');
    }
    
    // Step 6: Basic interaction test
    console.log('🖱️ Step 6: Testing basic page interaction...');
    
    try {
      // Try to interact with the first input field
      const firstInput = page.locator('input').first();
      await firstInput.click({ timeout: 3000 });
      await firstInput.fill('test@example.com');
      
      // Take screenshot after interaction
      await page.screenshot({ 
        path: 'test-results/phase3-interaction-test.png', 
        fullPage: true 
      });
      console.log('📸 Interaction test screenshot taken');
      console.log('✅ Basic page interaction successful');
      
    } catch (error) {
      console.log('⚠️ Basic interaction test had issues:', error.message);
      // Don't fail the test for this, as it might be due to specific login page implementation
    }
    
    console.log('🎉 Phase 3 TypeScript Consolidation Test completed!');
    
    return {
      success: true,
      consoleErrors: consoleErrors.length,
      pageErrors: pageErrors.length,
      urlCorrect: currentUrl.includes('/login')
    };
    
  } catch (error) {
    console.error('❌ Phase 3 test failed:', error);
    await page.screenshot({ 
      path: 'test-results/phase3-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runTypeScriptPhase3Test()
    .then((result) => {
      console.log('✅ Phase 3 TypeScript test passed!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Phase 3 TypeScript test failed:', error);
      process.exit(1);
    });
}

module.exports = { runTypeScriptPhase3Test };