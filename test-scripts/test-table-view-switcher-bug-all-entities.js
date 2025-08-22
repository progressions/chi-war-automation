const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

/**
 * Comprehensive E2E test for table view switcher bug across all entity pages
 * 
 * This test validates that switching from Table View -> Mobile View -> Table View
 * does not result in skeleton loading states but shows actual table content.
 * 
 * Tests all 11 entity types:
 * - /campaigns
 * - /characters  
 * - /fights
 * - /vehicles
 * - /users
 * - /parties
 * - /factions
 * - /junctures
 * - /sites
 * - /weapons
 * - /schticks
 */

async function testTableViewSwitcherBug() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visibility during testing
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting table view switcher bug test for all entities...');
    
    // Login as gamemaster
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results'
    });
    
    // Define all entity pages to test
    const entityPages = [
      { name: 'campaigns', path: '/campaigns' },
      { name: 'characters', path: '/characters' },
      { name: 'fights', path: '/fights' },
      { name: 'vehicles', path: '/vehicles' },
      { name: 'users', path: '/users' },
      { name: 'parties', path: '/parties' },
      { name: 'factions', path: '/factions' },
      { name: 'junctures', path: '/junctures' },
      { name: 'sites', path: '/sites' },
      { name: 'weapons', path: '/weapons' },
      { name: 'schticks', path: '/schticks' }
    ];
    
    const results = [];
    
    for (const entity of entityPages) {
      console.log(`\n📋 Testing ${entity.name} page...`);
      
      try {
        // Navigate to entity index page
        await page.goto(`http://localhost:3005${entity.path}`, { 
          waitUntil: 'networkidle',
          timeout: 30000
        });
        
        console.log(`  ✅ Navigated to ${entity.path}`);
        
        // Wait for initial page load and ensure we start in table view
        await page.waitForSelector('[data-testid="speed-dial"]', { timeout: 10000 });
        
        // Check if we're already in table view or need to switch
        const isInTableView = await page.locator('[data-testid="table-view"], .MuiDataGrid-root').count() > 0;
        
        if (!isInTableView) {
          console.log(`  🔄 Switching to table view first...`);
          await page.locator('[data-testid="speed-dial"]').click();
          await page.locator('text="Table View"').click();
          await page.waitForTimeout(2000);
        }
        
        // Step 1: Verify we're in table view with actual data (not skeletons)
        console.log(`  🔍 Verifying initial table view has data...`);
        
        // Wait for table to load with actual data
        await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 });
        
        // Check for skeleton loaders vs actual content
        const hasSkeletons = await page.locator('.MuiSkeleton-root').count() > 0;
        const hasDataRows = await page.locator('.MuiDataGrid-row').count() > 0;
        
        if (hasSkeletons && !hasDataRows) {
          throw new Error(`${entity.name}: Table view is showing skeleton loaders instead of data`);
        }
        
        console.log(`  ✅ Initial table view has data (${hasDataRows ? 'data rows present' : 'no data rows but no skeletons'})`);
        
        // Step 2: Switch to Mobile View
        console.log(`  📱 Switching to Mobile View...`);
        await page.locator('[data-testid="speed-dial"]').click();
        await page.locator('text="Mobile View"').click();
        
        // Wait for mobile view to load
        await page.waitForTimeout(3000);
        
        // Verify we're in mobile view
        const isInMobileView = await page.locator('[data-testid="mobile-view"], .mobile-card').count() > 0;
        console.log(`  ✅ Switched to mobile view (${isInMobileView ? 'mobile elements present' : 'mobile view detected'})`);
        
        // Step 3: Switch back to Table View
        console.log(`  📊 Switching back to Table View...`);
        await page.locator('[data-testid="speed-dial"]').click();
        await page.locator('text="Table View"').click();
        
        // Wait for table view to load
        await page.waitForTimeout(3000);
        
        // Step 4: Verify table view shows data, not skeletons
        console.log(`  🔍 Verifying table view after switch back...`);
        
        // Check for skeleton loaders vs actual content after switch
        const hasSkeletonsAfter = await page.locator('.MuiSkeleton-root').count() > 0;
        const hasDataRowsAfter = await page.locator('.MuiDataGrid-row').count() > 0;
        const hasTableAfter = await page.locator('.MuiDataGrid-root').count() > 0;
        
        // Determine test result
        let testResult = 'PASS';
        let errorMessage = null;
        
        if (hasSkeletonsAfter && !hasDataRowsAfter) {
          testResult = 'FAIL';
          errorMessage = 'Table shows skeleton loaders instead of data after view switch';
        } else if (!hasTableAfter) {
          testResult = 'FAIL'; 
          errorMessage = 'Table component not found after view switch';
        }
        
        // Take screenshot for documentation
        await page.screenshot({ 
          path: `test-results/table-switcher-${entity.name}-${testResult.toLowerCase()}.png`,
          fullPage: true
        });
        
        results.push({
          entity: entity.name,
          path: entity.path,
          result: testResult,
          error: errorMessage,
          hasSkeletonsAfter,
          hasDataRowsAfter,
          hasTableAfter
        });
        
        console.log(`  ${testResult === 'PASS' ? '✅ PASS' : '❌ FAIL'}: ${entity.name} ${errorMessage || 'works correctly'}`);
        
      } catch (error) {
        console.log(`  ❌ ERROR testing ${entity.name}: ${error.message}`);
        
        // Take error screenshot
        await page.screenshot({ 
          path: `test-results/table-switcher-${entity.name}-error.png`,
          fullPage: true
        });
        
        results.push({
          entity: entity.name,
          path: entity.path,
          result: 'ERROR',
          error: error.message,
          hasSkeletonsAfter: null,
          hasDataRowsAfter: null,
          hasTableAfter: null
        });
      }
    }
    
    // Print comprehensive test results
    console.log('\n📊 TABLE VIEW SWITCHER TEST RESULTS:');
    console.log('=' .repeat(60));
    
    const passCount = results.filter(r => r.result === 'PASS').length;
    const failCount = results.filter(r => r.result === 'FAIL').length;
    const errorCount = results.filter(r => r.result === 'ERROR').length;
    
    console.log(`✅ PASSED: ${passCount}/${results.length}`);
    console.log(`❌ FAILED: ${failCount}/${results.length}`);
    console.log(`⚠️  ERRORS: ${errorCount}/${results.length}`);
    
    console.log('\nDetailed Results:');
    results.forEach(result => {
      const icon = result.result === 'PASS' ? '✅' : result.result === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${icon} ${result.entity.padEnd(12)} ${result.path.padEnd(15)} ${result.result}`);
      if (result.error) {
        console.log(`    └─ ${result.error}`);
      }
    });
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultData = {
      timestamp,
      summary: { total: results.length, passed: passCount, failed: failCount, errors: errorCount },
      results
    };
    
    require('fs').writeFileSync(
      `test-results/table-switcher-test-results-${timestamp}.json`,
      JSON.stringify(resultData, null, 2)
    );
    
    if (failCount > 0 || errorCount > 0) {
      console.log('\n🚨 Some entities failed the table view switcher test!');
      console.log('   These components need to be fixed to prevent skeleton loading after view switches.');
      process.exit(1);
    } else {
      console.log('\n🎉 All entities passed the table view switcher test!');
    }
    
  } catch (error) {
    console.error('❌ Test suite error:', error);
    await page.screenshot({ path: 'test-results/table-switcher-suite-error.png' });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testTableViewSwitcherBug()
    .then(() => {
      console.log('✅ Table view switcher test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Table view switcher test failed:', error);
      process.exit(1);
    });
}

module.exports = { testTableViewSwitcherBug };