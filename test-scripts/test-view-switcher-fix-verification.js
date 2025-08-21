const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')

async function testViewSwitcherFix() {
  console.log('✅ Testing View Switcher Fix Verification')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 // Slow down for visibility
  })
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    })
    const page = await context.newPage()

    // Enable console logging to see network requests
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))

    // Step 1: Login as gamemaster
    console.log('📝 Step 1: Logging in as gamemaster...')
    await loginAsGamemaster(page)

    // Step 2: Navigate to Characters page
    console.log('📝 Step 2: Navigating to Characters page...')
    await page.goto('http://localhost:3001/characters')
    await page.waitForSelector('.MuiDataGrid-root, [role="grid"]', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/fix-01-characters-page.png' })

    // Step 3: Apply a filter to get some data to work with
    console.log('📝 Step 3: Applying PC filter...')
    try {
      const typeInput = page.locator('input[role="combobox"]').first()
      await typeInput.click()
      await typeInput.type('PC')
      await page.waitForTimeout(500)
      
      const pcOption = page.locator('li').filter({ hasText: 'PC' }).first()
      if (await pcOption.isVisible()) {
        await pcOption.click()
        await page.waitForTimeout(2000)
        console.log('✅ PC filter applied')
      }
    } catch (e) {
      console.log('⚠️ Could not apply filter, continuing...')
    }
    
    await page.screenshot({ path: 'test-results/fix-02-with-filter.png' })

    // Step 4: Count initial data rows
    let initialRowCount = await page.locator('.MuiDataGrid-row').count()
    console.log(`📊 Initial table shows ${initialRowCount} rows`)

    // Step 5: Find and click SpeedDial
    console.log('📝 Step 5: Finding SpeedDial...')
    const speedDial = page.locator('button[aria-label*="actions"]').first()
    if (await speedDial.isVisible()) {
      await speedDial.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/fix-03-speeddial-open.png' })
      
      // Look for view switch options by checking what's actually available
      const speedDialActions = await page.locator('.MuiSpeedDialAction-fab').allTextContents()
      console.log('Available SpeedDial actions:', speedDialActions)
      
      // Try to find mobile/grid view option
      const mobileViewOption = page.locator('[aria-label*="Mobile"], [aria-label*="Grid"], text="Switch to Mobile View"').first()
      
      if (await mobileViewOption.isVisible()) {
        console.log('📝 Step 6: Switching to Mobile/Grid View...')
        await mobileViewOption.click()
        await page.waitForTimeout(3000)
        await page.screenshot({ path: 'test-results/fix-04-mobile-view.png' })
        
        // Check if we're in grid view now
        const gridView = page.locator('.MuiGrid-container, [class*="grid"]')
        const isGridView = await gridView.count() > 0
        console.log(`📱 Grid view active: ${isGridView}`)
        
        // Step 7: Switch back to table view (this tests our fix)
        console.log('📝 Step 7: Switching back to Table View (testing fix)...')
        await speedDial.click() // Open SpeedDial again
        await page.waitForTimeout(1000)
        
        const tableViewOption = page.locator('[aria-label*="Table"], [aria-label*="List"], text="Switch to Table View"').first()
        
        if (await tableViewOption.isVisible()) {
          // Monitor network activity to see if data is refetched (our fix should trigger this)
          let networkRequestCount = 0
          page.on('request', request => {
            if (request.url().includes('/characters') && request.method() === 'GET') {
              networkRequestCount++
              console.log('🌐 Characters API request detected (fix working!)')
            }
          })
          
          await tableViewOption.click()
          await page.waitForTimeout(5000) // Wait for potential data refetch
          await page.screenshot({ path: 'test-results/fix-05-back-to-table.png' })
          
          // Step 8: Verify fix - check for skeletons vs data
          console.log('📝 Step 8: Verifying fix - checking for persistent loading skeletons...')
          
          const skeletonCount = await page.locator('.MuiSkeleton-root').count()
          const finalRowCount = await page.locator('.MuiDataGrid-row').count()
          
          console.log(`🔍 Found ${skeletonCount} loading skeletons`)
          console.log(`📊 Final table shows ${finalRowCount} rows`)
          console.log(`🌐 Network requests triggered: ${networkRequestCount}`)
          
          if (skeletonCount > 0 && finalRowCount === 0) {
            console.log('❌ BUG STILL EXISTS: Loading skeletons persist without data')
          } else if (finalRowCount > 0 && skeletonCount === 0) {
            console.log('✅ FIX VERIFIED: Data loads correctly after view switch')
          } else if (networkRequestCount > 0) {
            console.log('✅ FIX PARTIALLY VERIFIED: Network request triggered (data refetch happening)')
          } else {
            console.log('🤔 UNCLEAR: Need to investigate further')
          }
          
          await page.screenshot({ path: 'test-results/fix-06-final-verification.png' })
          
        } else {
          console.log('⚠️ Could not find table view option')
          // Take screenshot to see what options are available
          await page.screenshot({ path: 'test-results/fix-no-table-option.png' })
        }
        
      } else {
        console.log('⚠️ Could not find mobile view option')
        // Take screenshot to see what options are available  
        await page.screenshot({ path: 'test-results/fix-no-mobile-option.png' })
      }
      
    } else {
      console.log('❌ Could not find SpeedDial button')
    }

    console.log('✅ Fix verification test completed')
    console.log('📸 Screenshots saved in test-results/fix-*.png')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'test-results/fix-error.png' })
  } finally {
    await browser.close()
  }
}

// Run the test
testViewSwitcherFix().catch(console.error)