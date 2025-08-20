const { chromium } = require('playwright')
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper')

async function testLocalstorageCacheSecurity() {
  console.log('🧪 Starting localStorage Cache Security Test...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  let testResults = {
    userIsolation: false,
    cacheValidation: false,
    cleanupVerification: false,
    userIdCookiePersistence: false,
    overallSuccess: false
  }

  try {
    // Test 1: Multi-User Cache Isolation Test
    console.log('\n📋 Test 1: Multi-User Cache Isolation')
    
    // Step 1: Login as Admin/Gamemaster (User A)
    console.log('  Step 1a: Login as gamemaster (progressions@gmail.com)')
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/localStorage-test-gamemaster-login.png' 
    })
    
    // Verify admin menu is visible
    console.log('  Step 1b: Verify admin "Users" menu is visible')
    await page.click('[aria-label="menu"]')
    await page.waitForSelector('nav', { timeout: 5000 })
    
    const usersMenuExists = await page.locator('a[href="/users"]').count() > 0
    console.log(`    ✓ Users menu visible: ${usersMenuExists}`)
    
    // Check localStorage cache population
    console.log('  Step 1c: Check localStorage cache population')
    const cacheAfterLogin = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const userId = document.cookie.split('userId=')[1]?.split(';')[0] 
      const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
      return {
        jwt: jwt?.slice(0, 20) + '...', // Show first 20 chars for security
        userId,
        cacheExists: !!cachedUser,
        cachedUserEmail: cachedUser ? JSON.parse(cachedUser).email : null
      }
    })
    console.log('    ✓ Cache after gamemaster login:', cacheAfterLogin)
    
    // Step 2: Logout User A
    console.log('  Step 2a: Logout gamemaster')
    await page.click('[aria-label="menu"]')
    await page.waitForSelector('.MuiAvatar-root', { timeout: 5000 })
    await page.click('.MuiAvatar-root')
    await page.waitForSelector('text="Logout"', { timeout: 5000 })
    await page.click('text="Logout"')
    
    // Wait for redirect to login
    await page.waitForURL('**/login', { timeout: 10000 })
    console.log('    ✓ Redirected to login page')
    
    // Step 2b: Verify storage cleanup
    console.log('  Step 2b: Verify storage cleanup after logout')
    const storageAfterLogout = await page.evaluate(() => {
      const cookies = document.cookie
      const localStorageKeys = Object.keys(localStorage)
      const userCacheKeys = localStorageKeys.filter(key => 
        key.startsWith('currentUser-') || key.startsWith('currentCampaign-')
      )
      return {
        hasJwtToken: cookies.includes('jwtToken'),
        hasUserIdCookie: cookies.includes('userId'),
        userCacheKeysCount: userCacheKeys.length,
        userCacheKeys
      }
    })
    console.log('    ✓ Storage after logout:', storageAfterLogout)
    
    const cleanupSuccess = !storageAfterLogout.hasJwtToken && 
                          !storageAfterLogout.hasUserIdCookie && 
                          storageAfterLogout.userCacheKeysCount === 0
    console.log(`    ✓ Cleanup successful: ${cleanupSuccess}`)
    
    // Step 3: Login as Player (User B)
    console.log('  Step 3a: Login as player (progressions+david@gmail.com)')
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/localStorage-test-player-login.png' 
    })
    
    // Step 3b: Verify player does NOT see admin menus
    console.log('  Step 3b: Verify player does NOT see admin Users menu')
    await page.click('[aria-label="menu"]')
    await page.waitForSelector('nav', { timeout: 5000 })
    
    const usersMenuStillExists = await page.locator('a[href="/users"]').count() > 0
    console.log(`    ✓ Users menu visible to player: ${usersMenuStillExists}`)
    
    // Step 3c: Verify correct user cache
    console.log('  Step 3c: Verify player cache contains correct user data')
    const playerCache = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const userId = document.cookie.split('userId=')[1]?.split(';')[0]
      const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
      const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
      return {
        userId,
        cachedUserEmail: parsedUser?.email,
        cachedUserAdmin: parsedUser?.admin,
        cachedUserGamemaster: parsedUser?.gamemaster,
        cacheUserIdMatches: parsedUser?.id === userId
      }
    })
    console.log('    ✓ Player cache data:', playerCache)
    
    // Verify user isolation success
    const userIsolationSuccess = usersMenuExists && // Admin saw menu
                                !usersMenuStillExists && // Player doesn't see menu
                                cleanupSuccess && // Storage cleaned properly
                                playerCache.cachedUserEmail === 'progressions+david@gmail.com' && // Correct user cached
                                !playerCache.cachedUserAdmin && // Not admin
                                playerCache.cacheUserIdMatches // User ID matches
                                
    console.log(`\n✅ Test 1 - User Isolation: ${userIsolationSuccess ? 'PASS' : 'FAIL'}`)
    testResults.userIsolation = userIsolationSuccess
    testResults.cleanupVerification = cleanupSuccess
    testResults.userIdCookiePersistence = playerCache.cacheUserIdMatches

    // Test 2: Cache Validation Test
    console.log('\n📋 Test 2: Cache Validation Test')
    console.log('  Step 2a: Corrupt cache with fake user data')
    
    const corruptionResult = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const fakeUser = {
        id: "fake-user-id",
        email: "fake@example.com",
        admin: true,
        gamemaster: true
      }
      
      // Store original for comparison
      const originalCache = localStorage.getItem(`currentUser-${jwt}`)
      
      // Corrupt the cache
      localStorage.setItem(`currentUser-${jwt}`, JSON.stringify(fakeUser))
      
      return {
        jwt: jwt?.slice(0, 20) + '...',
        corruptionApplied: true,
        originalUserEmail: originalCache ? JSON.parse(originalCache).email : null
      }
    })
    console.log('    ✓ Cache corruption applied:', corruptionResult)
    
    // Step 2b: Refresh page to trigger cache validation
    console.log('  Step 2b: Refresh page to trigger cache validation')
    
    // Listen for console messages
    const consoleMessages = []
    page.on('console', msg => {
      if (msg.text().includes('Cache mismatch') || msg.text().includes('🔧')) {
        consoleMessages.push(msg.text())
      }
    })
    
    await page.reload({ waitUntil: 'networkidle' })
    
    // Wait a moment for any cache validation to occur
    await page.waitForTimeout(2000)
    
    // Step 2c: Verify cache validation occurred
    console.log('  Step 2c: Check for cache mismatch warnings')
    const cacheValidationSuccess = consoleMessages.some(msg => 
      msg.includes('Cache mismatch detected') || msg.includes('🔧')
    )
    console.log('    ✓ Console messages:', consoleMessages)
    console.log(`    ✓ Cache validation triggered: ${cacheValidationSuccess}`)
    
    // Verify correct user is still displayed
    console.log('  Step 2d: Verify correct user is displayed after validation')
    const finalUserCheck = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const userId = document.cookie.split('userId=')[1]?.split(';')[0]
      const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
      const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
      
      return {
        displayedUserCorrect: parsedUser?.email === 'progressions+david@gmail.com',
        cacheIdMatchesUserId: parsedUser?.id === userId,
        userIsNotAdmin: !parsedUser?.admin
      }
    })
    console.log('    ✓ Final user verification:', finalUserCheck)
    
    const cacheValidationPassed = cacheValidationSuccess && 
                                 finalUserCheck.displayedUserCorrect && 
                                 finalUserCheck.cacheIdMatchesUserId && 
                                 finalUserCheck.userIsNotAdmin
    
    console.log(`\n✅ Test 2 - Cache Validation: ${cacheValidationPassed ? 'PASS' : 'FAIL'}`)
    testResults.cacheValidation = cacheValidationPassed

    // Overall test result
    testResults.overallSuccess = testResults.userIsolation && 
                               testResults.cacheValidation &&
                               testResults.cleanupVerification &&
                               testResults.userIdCookiePersistence

    console.log('\n🎯 OVERALL TEST RESULTS:')
    console.log('================================')
    console.log(`User Isolation: ${testResults.userIsolation ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Cache Validation: ${testResults.cacheValidation ? '✅ PASS' : '❌ FAIL'}`) 
    console.log(`Cleanup Verification: ${testResults.cleanupVerification ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`User ID Cookie Persistence: ${testResults.userIdCookiePersistence ? '✅ PASS' : '❌ FAIL'}`)
    console.log(`Overall Success: ${testResults.overallSuccess ? '✅ PASS' : '❌ FAIL'}`)

    if (testResults.overallSuccess) {
      console.log('\n🎉 localStorage Cache Security Fix: WORKING CORRECTLY!')
    } else {
      console.log('\n⚠️  localStorage Cache Security Fix: ISSUES DETECTED')
    }

  } catch (error) {
    console.error('❌ Test execution error:', error)
    testResults.overallSuccess = false
  } finally {
    await browser.close()
  }

  return testResults
}

// Run the test if called directly
if (require.main === module) {
  testLocalstorageCacheSecurity()
    .then(results => {
      process.exit(results.overallSuccess ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal test error:', error)
      process.exit(1)
    })
}

module.exports = { testLocalstorageCacheSecurity }