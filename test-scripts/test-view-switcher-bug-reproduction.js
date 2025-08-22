const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')
const TEST_CONFIG = require('./test-config')
async function testViewSwitcherBug() {
  console.log('🐛 Testing View Switcher Bug Reproduction')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down for visibility
  })
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    })
    const page = await context.newPage()

    // Step 1: Login as gamemaster
    console.log('📝 Step 1: Logging in as gamemaster...')
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results',
      screenshotName: 'view-switcher-01-login'
    })

    // Step 2: Navigate to Characters page
    console.log('📝 Step 2: Navigating to Characters page...')
    await page.goto('TEST_CONFIG.getCharactersUrl()')
    await page.waitForSelector('[data-testid="characters-list"], .MuiDataGrid-root, [role="grid"]', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/view-switcher-02-characters-page.png' })

    // Step 3: Apply PC filter
    console.log('📝 Step 3: Applying PC filter...')
    
    // Look for the Type filter dropdown
    const typeFilter = await page.locator('text=Type').first()
    if (await typeFilter.isVisible()) {
      await typeFilter.click()
      await page.waitForTimeout(500)
      
      // Try to select PC option
      const pcOption = await page.locator('text=PC').first()
      if (await pcOption.isVisible()) {
        await pcOption.click()
        await page.waitForTimeout(2000) // Wait for filter to apply
        console.log('✅ PC filter applied')
      } else {
        console.log('⚠️ PC option not found, checking available options...')
        // Take screenshot to see what's available
        await page.screenshot({ path: 'test-results/view-switcher-03-filter-options.png' })
      }
    } else {
      console.log('⚠️ Type filter not found, taking screenshot...')
      await page.screenshot({ path: 'test-results/view-switcher-03-no-type-filter.png' })
    }

    // Step 4: Verify characters are displayed
    console.log('📝 Step 4: Verifying filtered characters display...')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/view-switcher-04-filtered-characters.png' })

    // Step 5: Find and click SpeedDial to switch to Mobile View
    console.log('📝 Step 5: Switching to Mobile View...')
    
    // Look for SpeedDial button (usually a floating action button)
    const speedDialSelectors = [
      '[data-testid="speed-dial"]',
      '.MuiSpeedDial-fab',
      '[aria-label*="Speed dial"]',
      'button[aria-label*="actions"]'
    ]
    
    let speedDialFound = false
    for (const selector of speedDialSelectors) {
      const speedDial = page.locator(selector).first()
      if (await speedDial.isVisible()) {
        await speedDial.click()
        await page.waitForTimeout(500)
        speedDialFound = true
        break
      }
    }
    
    if (!speedDialFound) {
      console.log('⚠️ SpeedDial not found with standard selectors, looking for any FAB...')
      const fabButton = page.locator('button').filter({ hasText: /add|menu|actions/i }).first()
      if (await fabButton.isVisible()) {
        await fabButton.click()
        await page.waitForTimeout(500)
        speedDialFound = true
      }
    }

    if (speedDialFound) {
      // Look for "Switch to Mobile View" option
      const mobileViewOption = page.locator('text=Switch to Mobile View, text=Mobile View, text=Grid View').first()
      if (await mobileViewOption.isVisible()) {
        await mobileViewOption.click()
        await page.waitForTimeout(2000)
        console.log('✅ Switched to Mobile View')
        await page.screenshot({ path: 'test-results/view-switcher-05-mobile-view.png' })
      } else {
        console.log('⚠️ Mobile View option not found')
        await page.screenshot({ path: 'test-results/view-switcher-05-speeddial-options.png' })
      }
    } else {
      console.log('❌ Could not find SpeedDial button')
      await page.screenshot({ path: 'test-results/view-switcher-05-no-speeddial.png' })
    }

    // Step 6: Verify Mobile View shows filtered characters
    console.log('📝 Step 6: Verifying Mobile View shows filtered characters...')
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/view-switcher-06-mobile-view-with-filter.png' })

    // Step 7: Switch back to Table View to reproduce the bug
    console.log('📝 Step 7: Switching back to Table View (this should trigger the bug)...')
    
    // Click SpeedDial again
    if (speedDialFound) {
      const speedDial = page.locator('[data-testid="speed-dial"], .MuiSpeedDial-fab').first()
      if (await speedDial.isVisible()) {
        await speedDial.click()
        await page.waitForTimeout(500)
        
        // Look for "Switch to Table View" option
        const tableViewOption = page.locator('text=Switch to Table View, text=Table View, text=List View').first()
        if (await tableViewOption.isVisible()) {
          await tableViewOption.click()
          await page.waitForTimeout(3000) // Wait longer to see if skeletons persist
          console.log('🔄 Switched back to Table View')
        }
      }
    }

    // Step 8: Document the bug - check for loading skeletons
    console.log('📝 Step 8: Checking for bug - persistent loading skeletons...')
    
    const skeletonSelectors = [
      '.MuiSkeleton-root',
      '[data-testid="skeleton"]',
      '.loading-skeleton'
    ]
    
    let hasSkeletons = false
    for (const selector of skeletonSelectors) {
      const skeletons = page.locator(selector)
      const count = await skeletons.count()
      if (count > 0) {
        hasSkeletons = true
        console.log(`🐛 BUG CONFIRMED: Found ${count} loading skeletons persisting after view switch`)
        break
      }
    }
    
    // Final screenshot to document the bug
    await page.screenshot({ path: 'test-results/view-switcher-07-bug-reproduction.png' })
    
    if (hasSkeletons) {
      console.log('🐛 BUG REPRODUCED: Loading skeletons are persisting instead of showing filtered character data')
    } else {
      console.log('🤔 Bug not reproduced - either fixed or different behavior')
      
      // Check if we have actual data showing
      const dataGrid = page.locator('.MuiDataGrid-root, [role="grid"]')
      if (await dataGrid.isVisible()) {
        const rows = await page.locator('.MuiDataGrid-row, [role="row"]').count()
        console.log(`📊 Table shows ${rows} rows`)
      }
    }

    console.log('✅ Bug reproduction test completed')
    console.log('📸 Screenshots saved in test-results/')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'test-results/view-switcher-error.png' })
  } finally {
    await browser.close()
  }
}

// Run the test
testViewSwitcherBug().catch(console.error)