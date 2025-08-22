const { chromium } = require('playwright')
const { loginAsPlayer, loginAsGamemaster } = require('./login-helper')
const TEST_CONFIG = require('./test-config')

async function testAdminUserProfile() {
  console.log('🧪 Testing Admin-Aware User Profile Feature...')
  
  const browser = await chromium.launch({ headless: false })
  
  try {
    // Test 1: Non-admin user should be redirected from user profile page
    console.log('\n📋 Test 1: Non-admin user redirect behavior')
    const playerContext = await browser.newContext()
    const playerPage = await playerContext.newPage()
    
    await loginAsPlayer(playerPage, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/admin-user-profile-player-login.png' 
    })
    
    // Get the player user ID for testing
    const playerUserId = '5f07e960-0653-47ca-8c9b-d59cd2b2c17d' // From seed data
    
    console.log(`   → Attempting to access /users/${playerUserId} as player`)
    await playerPage.goto(`${TEST_CONFIG.getFrontendUrl()}/users/${playerUserId}`)
    await playerPage.waitForTimeout(2000)
    
    // Should be redirected to homepage
    const currentUrl = playerPage.url()
    if (currentUrl.includes('/users/')) {
      console.log('   ❌ FAIL: Player was NOT redirected from user profile page')
      await playerPage.screenshot({ path: 'test-results/admin-user-profile-player-fail.png' })
    } else {
      console.log('   ✅ PASS: Player was properly redirected to homepage')
      await playerPage.screenshot({ path: 'test-results/admin-user-profile-player-redirect.png' })
    }
    
    await playerContext.close()
    
    // Test 2: Admin user should access user profile page and see role management
    console.log('\n📋 Test 2: Admin user access and role management')
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    
    await loginAsGamemaster(adminPage, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/admin-user-profile-admin-login.png' 
    })
    
    console.log(`   → Accessing /users/${playerUserId} as admin`)
    await adminPage.goto(`${TEST_CONFIG.getFrontendUrl()}/users/${playerUserId}`)
    await adminPage.waitForTimeout(3000)
    
    // Should see the user profile page
    const finalUrl = adminPage.url()
    if (finalUrl.includes(`/users/${playerUserId}`)) {
      console.log('   ✅ PASS: Admin successfully accessed user profile page')
      
      // Look for role management interface
      try {
        await adminPage.waitForSelector('text=User Roles & Permissions', { timeout: 5000 })
        console.log('   ✅ PASS: Role management interface is visible')
        
        // Look for Admin and Gamemaster checkboxes using more robust selectors
        const adminCheckbox = await adminPage.locator('input[type="checkbox"]').first()
        const gamemasterCheckbox = await adminPage.locator('input[type="checkbox"]').last()
        
        if (await adminCheckbox.isVisible() && await gamemasterCheckbox.isVisible()) {
          console.log('   ✅ PASS: Admin and Gamemaster checkboxes are visible')
          
          // Test role toggle functionality
          console.log('   → Testing Gamemaster role toggle...')
          
          // Check current state and toggle appropriately
          const isCurrentlyChecked = await gamemasterCheckbox.isChecked()
          const isDisabled = await gamemasterCheckbox.isDisabled()
          console.log(`   Current Gamemaster checkbox state: ${isCurrentlyChecked}, disabled: ${isDisabled}`)
          
          if (!isDisabled) {
            // Use force click to bypass any overlay issues
            await gamemasterCheckbox.click({ force: true })
            console.log('   → Clicked Gamemaster checkbox with force')
          } else {
            console.log('   ⚠️  WARNING: Gamemaster checkbox is disabled')
          }
          
          await adminPage.waitForTimeout(3000) // Wait for API call
          
          // Look for success message
          try {
            await adminPage.waitForSelector('[data-testid="alert"], .MuiAlert-root', { timeout: 5000 })
            console.log('   ✅ PASS: Role toggle triggered and alert appeared')
          } catch (error) {
            console.log('   ⚠️  WARNING: Could not verify success/error message for role toggle')
          }
          
        } else {
          console.log('   ❌ FAIL: Admin and/or Gamemaster checkboxes not found')
        }
        
      } catch (error) {
        console.log('   ❌ FAIL: Role management interface not found')
        console.log('   Error:', error.message)
      }
      
      await adminPage.screenshot({ path: 'test-results/admin-user-profile-admin-success.png' })
    } else {
      console.log('   ❌ FAIL: Admin was redirected instead of accessing user profile')
      await adminPage.screenshot({ path: 'test-results/admin-user-profile-admin-redirect-fail.png' })
    }
    
    await adminContext.close()
    
    // Test 3: Verify backend API protection
    console.log('\n📋 Test 3: Backend API protection verification')
    
    // Test with no auth token
    const response = await fetch(TEST_CONFIG.getApiUrl(`users/${playerUserId}`))
    if (response.status === 401) {
      console.log('   ✅ PASS: API correctly rejects unauthenticated requests')
    } else {
      console.log('   ❌ FAIL: API should reject unauthenticated requests')
    }
    
    console.log('\n🎯 Admin User Profile Feature Test Complete!')
    
  } catch (error) {
    console.error('❌ Test failed with error:', error)
    await browser.close()
    throw error
  } finally {
    await browser.close()
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAdminUserProfile().catch(console.error)
}

module.exports = { testAdminUserProfile }