const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')

async function testViewSwitcherSimple() {
  console.log('🐛 Testing View Switcher Bug - Simple Version')
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 // Slow down for visibility
  })
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 }
    })
    const page = await context.newPage()

    // Step 1: Login as gamemaster
    console.log('📝 Step 1: Logging in as gamemaster...')
    await loginAsGamemaster(page)

    // Step 2: Navigate to Characters page
    console.log('📝 Step 2: Navigating to Characters page...')
    await page.goto('http://localhost:3001/characters')
    await page.waitForSelector('[data-testid="characters-list"], .MuiDataGrid-root, [role="grid"]', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/simple-01-characters-page.png' })
    console.log('✅ Characters page loaded')

    // Step 3: Try to apply any filter manually if possible (simple typing)
    console.log('📝 Step 3: Looking for filter options...')
    await page.waitForTimeout(2000)
    
    // Look for any autocomplete input and try typing "PC"
    const autocompleteInputs = page.locator('input[role="combobox"]')
    const inputCount = await autocompleteInputs.count()
    console.log(`Found ${inputCount} autocomplete inputs`)
    
    if (inputCount > 0) {
      try {
        // Try the first autocomplete input (likely Type filter)
        await autocompleteInputs.first().click()
        await page.waitForTimeout(500)
        await autocompleteInputs.first().type('PC')
        await page.waitForTimeout(1000)
        
        // Look for dropdown options
        const pcOption = page.locator('li').filter({ hasText: 'PC' }).first()
        if (await pcOption.isVisible()) {
          await pcOption.click()
          await page.waitForTimeout(2000)
          console.log('✅ PC filter applied')
        }
      } catch (e) {
        console.log('⚠️ Could not apply filter, continuing without it')
      }
    }
    
    await page.screenshot({ path: 'test-results/simple-02-after-filter-attempt.png' })

    // Step 4: Find SpeedDial button - look for floating action button
    console.log('📝 Step 4: Looking for SpeedDial (floating action button)...')
    
    // Common SpeedDial/FAB selectors
    const fabSelectors = [
      'button[aria-label*="actions"]',
      'button[aria-label*="speed dial"]',
      '.MuiSpeedDial-fab',
      '.MuiFab-root',
      'button.MuiFab-root',
      '[data-testid="speed-dial"]'
    ]
    
    let speedDialButton = null
    for (const selector of fabSelectors) {
      const button = page.locator(selector).first()
      if (await button.isVisible()) {
        speedDialButton = button
        console.log(`✅ Found SpeedDial with selector: ${selector}`)
        break
      }
    }
    
    if (!speedDialButton) {
      // Look for any FAB-like button in bottom right
      const allButtons = page.locator('button')
      const buttonCount = await allButtons.count()
      console.log(`Checking ${buttonCount} buttons for FAB...`)
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = allButtons.nth(i)
        const position = await button.boundingBox()
        if (position && position.x > 1000 && position.y > 600) {
          speedDialButton = button
          console.log(`✅ Found potential FAB at position (${position.x}, ${position.y})`)
          break
        }
      }
    }
    
    if (speedDialButton) {
      // Step 5: Click SpeedDial to open menu
      console.log('📝 Step 5: Clicking SpeedDial to open menu...')
      await speedDialButton.click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/simple-03-speeddial-open.png' })
      
      // Step 6: Look for view switch option
      console.log('📝 Step 6: Looking for view switch options...')
      const viewSwitchOptions = [
        'text=Switch to Mobile View',
        'text=Mobile View', 
        'text=Grid View',
        'text=Switch to Grid View'
      ]
      
      let switchOption = null
      for (const option of viewSwitchOptions) {
        const element = page.locator(option).first()
        if (await element.isVisible()) {
          switchOption = element
          console.log(`✅ Found view switch option: ${option}`)
          break
        }
      }
      
      if (switchOption) {
        // Step 7: Switch to Mobile View
        console.log('📝 Step 7: Switching to Mobile/Grid View...')
        await switchOption.click()
        await page.waitForTimeout(3000)
        await page.screenshot({ path: 'test-results/simple-04-mobile-view.png' })
        console.log('✅ Switched to Mobile View')
        
        // Step 8: Open SpeedDial again to switch back
        console.log('📝 Step 8: Opening SpeedDial again...')
        await speedDialButton.click()
        await page.waitForTimeout(1000)
        
        // Step 9: Switch back to Table View (this should trigger the bug)
        console.log('📝 Step 9: Switching back to Table View (testing for bug)...')
        const tableViewOptions = [
          'text=Switch to Table View',
          'text=Table View',
          'text=List View',
          'text=Switch to List View'
        ]
        
        let tableOption = null
        for (const option of tableViewOptions) {
          const element = page.locator(option).first()
          if (await element.isVisible()) {
            tableOption = element
            console.log(`✅ Found table view option: ${option}`)
            break
          }
        }
        
        if (tableOption) {
          await tableOption.click()
          await page.waitForTimeout(5000) // Wait longer to see if bug occurs
          await page.screenshot({ path: 'test-results/simple-05-back-to-table.png' })
          
          // Step 10: Check for bug - persistent loading skeletons
          console.log('📝 Step 10: Checking for loading skeletons (bug indicator)...')
          
          const skeletonSelectors = [
            '.MuiSkeleton-root',
            '.MuiSkeleton-text',
            '.MuiSkeleton-rectangular',
            '[class*="skeleton"]'
          ]
          
          let skeletonsFound = 0
          for (const selector of skeletonSelectors) {
            const skeletons = page.locator(selector)
            const count = await skeletons.count()
            skeletonsFound += count
          }
          
          if (skeletonsFound > 0) {
            console.log(`🐛 BUG CONFIRMED: Found ${skeletonsFound} loading skeletons persisting after view switch`)
            console.log('🐛 This indicates the data is not being refreshed when switching back to Table View')
          } else {
            console.log('🤔 No persistent skeletons found - bug may not be present or may have different symptoms')
            
            // Check if we have data showing
            const dataRows = await page.locator('.MuiDataGrid-row, [role="row"]').count()
            console.log(`📊 Found ${dataRows} data rows in table`)
            
            if (dataRows === 0) {
              console.log('⚠️ No data rows found - this could indicate the bug (empty table)')
            }
          }
          
          await page.screenshot({ path: 'test-results/simple-06-final-state.png' })
        }
      }
    } else {
      console.log('❌ Could not find SpeedDial button')
      await page.screenshot({ path: 'test-results/simple-no-speeddial.png' })
    }

    console.log('✅ Bug reproduction test completed')
    console.log('📸 Screenshots saved in test-results/simple-*.png')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    await page.screenshot({ path: 'test-results/simple-error.png' })
  } finally {
    await browser.close()
  }
}

// Run the test
testViewSwitcherSimple().catch(console.error)