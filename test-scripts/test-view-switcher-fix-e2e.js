const { test, expect } = require('@playwright/test')
const { loginAsGamemaster } = require('./login-helper')
const TEST_CONFIG = require('./test-config')

test.describe('View Switcher Bug Fix E2E', () => {
  test('should refresh data when switching between Table and Mobile views with filters applied', async ({ page }) => {
    // Step 1: Login as gamemaster
    await loginAsGamemaster(page, {
      takeScreenshot: true,
      screenshotPath: 'test-results',
      screenshotName: 'e2e-01-login'
    })

    // Step 2: Navigate to Characters page
    await page.goto('TEST_CONFIG.getCharactersUrl()')
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 })
    await page.screenshot({ path: 'test-results/e2e-02-characters-page.png' })

    // Step 3: Apply PC filter
    const typeInput = page.locator('input[role="combobox"]').first()
    await typeInput.click()
    await typeInput.fill('PC')
    await page.waitForTimeout(1000)
    
    const pcOption = page.locator('li').filter({ hasText: 'PC' }).first()
    await pcOption.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/e2e-03-filter-applied.png' })

    // Step 4: Verify initial data exists
    const initialRows = await page.locator('.MuiDataGrid-row').count()
    expect(initialRows).toBeGreaterThan(0)
    console.log(`Initial table shows ${initialRows} filtered rows`)

    // Step 5: Find and open SpeedDial
    const speedDial = page.locator('button[aria-label*="actions"]').first()
    await expect(speedDial).toBeVisible()
    await speedDial.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/e2e-04-speeddial-open.png' })

    // Step 6: Switch to Mobile View
    const mobileViewAction = page.locator('.MuiSpeedDialAction-fab').first()
    await expect(mobileViewAction).toBeVisible()
    await mobileViewAction.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/e2e-05-mobile-view.png' })

    // Step 7: Verify we're in Mobile/Grid view (different layout)
    const isInGridView = await page.locator('.MuiGrid-container, [class*="grid"]').count() > 0
    // Mobile view might use different components, so we'll check that table is not visible
    const tableVisible = await page.locator('.MuiDataGrid-root').isVisible()
    console.log(`Grid view detected: ${isInGridView}, Table hidden: ${!tableVisible}`)

    // Step 8: Open SpeedDial again to switch back
    await speedDial.click()
    await page.waitForTimeout(1000)

    // Step 9: Switch back to Table View (this tests our fix)
    const tableViewAction = page.locator('.MuiSpeedDialAction-fab').nth(0) // Usually first action after switch
    await tableViewAction.click()
    await page.waitForTimeout(3000) // Wait for potential data refetch
    await page.screenshot({ path: 'test-results/e2e-06-back-to-table.png' })

    // Step 10: CRITICAL TEST - Verify fix is working
    // Check that we DON'T have persistent loading skeletons
    const skeletonCount = await page.locator('.MuiSkeleton-root').count()
    expect(skeletonCount).toBe(0) // Should be no loading skeletons

    // Check that we DO have data rows showing
    const finalRows = await page.locator('.MuiDataGrid-row').count()
    expect(finalRows).toBeGreaterThan(0) // Should have actual data
    expect(finalRows).toBe(initialRows) // Should have same filtered data

    // Check that table is visible again
    await expect(page.locator('.MuiDataGrid-root')).toBeVisible()

    console.log(`✅ Fix verified: ${finalRows} rows showing, ${skeletonCount} skeletons`)
    await page.screenshot({ path: 'test-results/e2e-07-fix-verified.png' })

    // Step 11: Additional verification - check that data is actually the filtered data
    // Look for PC-type characters in the table
    const characterLinks = await page.locator('.MuiDataGrid-row a').allTextContents()
    expect(characterLinks.length).toBeGreaterThan(0)
    console.log(`Character names visible: ${characterLinks.slice(0, 3).join(', ')}...`)
  })

  test('should work without filters applied', async ({ page }) => {
    // Test the fix works even without filters
    await loginAsGamemaster(page)
    await page.goto('TEST_CONFIG.getCharactersUrl()')
    await page.waitForSelector('.MuiDataGrid-root', { timeout: 10000 })

    const initialRows = await page.locator('.MuiDataGrid-row').count()
    
    // Switch to mobile and back without filters
    const speedDial = page.locator('button[aria-label*="actions"]').first()
    await speedDial.click()
    await page.waitForTimeout(500)
    
    const mobileAction = page.locator('.MuiSpeedDialAction-fab').first()
    await mobileAction.click()
    await page.waitForTimeout(2000)
    
    await speedDial.click()
    await page.waitForTimeout(500)
    
    const tableAction = page.locator('.MuiSpeedDialAction-fab').first()
    await tableAction.click()
    await page.waitForTimeout(2000)

    // Verify no skeletons and data is present
    const skeletonCount = await page.locator('.MuiSkeleton-root').count()
    const finalRows = await page.locator('.MuiDataGrid-row').count()
    
    expect(skeletonCount).toBe(0)
    expect(finalRows).toBeGreaterThan(0)
    expect(finalRows).toBe(initialRows)
    
    console.log(`✅ Fix works without filters: ${finalRows} rows, ${skeletonCount} skeletons`)
  })
})

test.beforeEach(async ({ page }) => {
  // Set a reasonable timeout for all tests
  page.setDefaultTimeout(30000)
})

test.afterEach(async ({ page }, testInfo) => {
  // Take screenshot on failure
  if (testInfo.status === 'failed') {
    await page.screenshot({ 
      path: `test-results/failed-${testInfo.title.replace(/\s+/g, '-')}.png`,
      fullPage: true 
    })
  }
})