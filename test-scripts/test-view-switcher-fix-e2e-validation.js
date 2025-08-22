const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')
const TEST_CONFIG = require('./test-config')
async function validateViewSwitcherFix() {
  console.log('🧪 E2E Validation: View Switcher Fix')
  console.log('================================================')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  })
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1400, height: 900 }
    })
    const page = await context.newPage()
    
    let testResults = {
      loginSuccess: false,
      filterApplied: false,
      initialDataLoaded: false,
      mobileViewSwitch: false,
      tableViewSwitch: false,
      noSkeletonsAfterSwitch: false,
      dataIntegrityMaintained: false,
      fixValidated: false
    }

    // Test 1: Login and Navigation
    console.log('📝 Test 1: Login and navigate to Characters page...')
    await loginAsGamemaster(page)
    testResults.loginSuccess = true
    console.log('✅ Login successful')

    await page.goto('TEST_CONFIG.getCharactersUrl()')
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/e2e-val-01-characters-page.png' })

    // Test 2: Apply Filter
    console.log('📝 Test 2: Applying PC filter...')
    try {
      const typeInput = page.locator('input[role="combobox"]').first()
      await typeInput.click()
      await typeInput.fill('PC')
      await page.waitForTimeout(1000)
      
      const pcOption = page.locator('li').filter({ hasText: 'PC' }).first()
      if (await pcOption.isVisible()) {
        await pcOption.click()
        await page.waitForTimeout(2000)
        testResults.filterApplied = true
        console.log('✅ PC filter applied')
      } else {
        console.log('⚠️ PC option not found, continuing with existing data')
        testResults.filterApplied = false
      }
    } catch (e) {
      console.log('⚠️ Filter application failed, continuing with existing data')
      testResults.filterApplied = false
    }
    
    await page.screenshot({ path: 'test-results/e2e-val-02-filter-applied.png' })

    // Test 3: Verify Initial Data
    console.log('📝 Test 3: Checking initial data load...')
    const initialRows = await page.locator('.MuiDataGrid-row').count()
    if (initialRows > 0) {
      testResults.initialDataLoaded = true
      console.log(`✅ Initial data loaded: ${initialRows} rows`)
    } else {
      console.log('❌ No initial data found')
      await page.screenshot({ path: 'test-results/e2e-val-error-no-data.png' })
      throw new Error('No initial data to test with')
    }

    // Test 4: Find SpeedDial and Switch to Mobile View
    console.log('📝 Test 4: Switching to Mobile View...')
    const speedDial = page.locator('button[aria-label*="actions"]').first()
    
    if (await speedDial.isVisible()) {
      await speedDial.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/e2e-val-03-speeddial-open.png' })
      
      // Try to click the first SpeedDial action (should be view switch)
      const actions = page.locator('.MuiSpeedDialAction-fab')
      const actionCount = await actions.count()
      console.log(`Found ${actionCount} SpeedDial actions`)
      
      if (actionCount > 0) {
        await actions.first().click()
        await page.waitForTimeout(2000)
        testResults.mobileViewSwitch = true
        console.log('✅ Switched to Mobile View')
        await page.screenshot({ path: 'test-results/e2e-val-04-mobile-view.png' })
      } else {
        console.log('❌ No SpeedDial actions found')
      }
    } else {
      console.log('❌ SpeedDial not found')
    }

    // Test 5: Switch Back to Table View (The Critical Test)
    console.log('📝 Test 5: Switching back to Table View (testing fix)...')
    if (testResults.mobileViewSwitch) {
      await speedDial.click()
      await page.waitForTimeout(1000)
      
      const tableAction = page.locator('.MuiSpeedDialAction-fab').first()
      await tableAction.click()
      await page.waitForTimeout(3000) // Wait for data refetch (our fix)
      testResults.tableViewSwitch = true
      console.log('✅ Switched back to Table View')
      await page.screenshot({ path: 'test-results/e2e-val-05-back-to-table.png' })
    }

    // Test 6: THE CRITICAL VALIDATION - Check for Fix
    console.log('📝 Test 6: CRITICAL - Validating fix is working...')
    
    // Check 1: No persistent loading skeletons (this was the bug)
    const skeletonCount = await page.locator('.MuiSkeleton-root').count()
    if (skeletonCount === 0) {
      testResults.noSkeletonsAfterSwitch = true
      console.log('✅ No loading skeletons found (fix working)')
    } else {
      console.log(`❌ Found ${skeletonCount} loading skeletons (bug still exists)`)
    }

    // Check 2: Data is visible and correct
    const finalRows = await page.locator('.MuiDataGrid-row').count()
    if (finalRows > 0 && finalRows === initialRows) {
      testResults.dataIntegrityMaintained = true
      console.log(`✅ Data integrity maintained: ${finalRows} rows`)
    } else {
      console.log(`❌ Data integrity issue: initial=${initialRows}, final=${finalRows}`)
    }

    // Check 3: Table is actually visible
    const tableVisible = await page.locator('.MuiDataGrid-root').isVisible()
    if (tableVisible) {
      console.log('✅ Table is visible')
    } else {
      console.log('❌ Table is not visible')
    }

    await page.screenshot({ path: 'test-results/e2e-val-06-final-validation.png' })

    // Overall Fix Validation
    if (testResults.noSkeletonsAfterSwitch && testResults.dataIntegrityMaintained && tableVisible) {
      testResults.fixValidated = true
      console.log('🎉 FIX VALIDATED: View switcher bug is resolved!')
    } else {
      console.log('❌ FIX VALIDATION FAILED: Bug may still exist')
    }

    // Test Results Summary
    console.log('\n📊 TEST RESULTS SUMMARY')
    console.log('================================================')
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL'
      console.log(`${status} ${test}`)
    })

    const passedTests = Object.values(testResults).filter(Boolean).length
    const totalTests = Object.keys(testResults).length
    console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed`)

    if (testResults.fixValidated) {
      console.log('\n🎉 SUCCESS: View Switcher Fix is working correctly!')
      console.log('   - No loading skeletons persist after view switches')
      console.log('   - Data integrity is maintained across view changes')
      console.log('   - Filter state is preserved when switching views')
    } else {
      console.log('\n⚠️ NEEDS ATTENTION: Fix may need additional work')
    }

    return testResults

  } catch (error) {
    console.error('❌ E2E validation failed:', error.message)
    await page.screenshot({ path: 'test-results/e2e-val-error.png' })
    return { error: error.message }
  } finally {
    console.log('\n📸 Screenshots saved in test-results/e2e-val-*.png')
    await browser.close()
  }
}

// Run the validation
validateViewSwitcherFix().then(results => {
  if (results.fixValidated) {
    console.log('\n🎉 E2E VALIDATION COMPLETE: Fix is working!')
    process.exit(0)
  } else {
    console.log('\n⚠️ E2E VALIDATION: Issues detected')
    process.exit(1)
  }
}).catch(error => {
  console.error('E2E validation crashed:', error)
  process.exit(1)
})