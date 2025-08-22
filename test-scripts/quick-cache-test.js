const { chromium } = require('playwright')

async function quickCacheTest() {
  console.log('🧪 Quick localStorage Cache Validation Test...')
  
  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()

  try {
    console.log('1. Navigating to login page...')
    await page.goto('TEST_CONFIG.getFrontendUrl()/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
    
    console.log('2. Logging in as gamemaster...')
    await page.fill('input[type="email"]', 'progressions@gmail.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')
    
    // Wait for redirect after login
    await page.waitForURL(TEST_CONFIG.getFrontendUrl() + '/', { timeout: 30000 })
    console.log('   ✓ Login successful, redirected to home')
    
    console.log('3. Checking cookies and cache after login...')
    const loginData = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const userId = document.cookie.split('userId=')[1]?.split(';')[0] 
      const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
      const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
      
      return {
        hasJwtCookie: !!jwt,
        hasUserIdCookie: !!userId,
        hasCachedUser: !!cachedUser,
        userEmail: parsedUser?.email,
        userAdmin: parsedUser?.admin,
        cacheUserIdMatchesUserId: parsedUser?.id === userId
      }
    })
    
    console.log('   ✓ Login data:', loginData)
    
    console.log('4. Testing cache validation by corrupting cache...')
    const corruptionTest = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const fakeUser = {
        id: "fake-user-123",
        email: "fake@hacker.com",
        admin: true,
        gamemaster: true
      }
      
      localStorage.setItem(`currentUser-${jwt}`, JSON.stringify(fakeUser))
      return { corruptionApplied: true }
    })
    
    console.log('   ✓ Cache corrupted with fake user data')
    
    // Listen for cache mismatch warnings
    const consoleMessages = []
    page.on('console', msg => {
      if (msg.text().includes('Cache mismatch') || msg.text().includes('🔧')) {
        consoleMessages.push(msg.text())
      }
    })
    
    console.log('5. Refreshing page to trigger cache validation...')
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(3000) // Wait for any async operations
    
    const validationResult = await page.evaluate(() => {
      const jwt = document.cookie.split('jwtToken=')[1]?.split(';')[0]
      const userId = document.cookie.split('userId=')[1]?.split(';')[0]
      const cachedUser = localStorage.getItem(`currentUser-${jwt}`)
      const parsedUser = cachedUser ? JSON.parse(cachedUser) : null
      
      return {
        cachedUserEmail: parsedUser?.email,
        cachedUserIsCorrect: parsedUser?.email === 'progressions@gmail.com',
        cacheUserIdMatches: parsedUser?.id === userId,
        fakeUserRejected: parsedUser?.email !== 'fake@hacker.com'
      }
    })
    
    console.log('   ✓ Cache validation messages:', consoleMessages)
    console.log('   ✓ Post-validation data:', validationResult)
    
    const testPassed = validationResult.cachedUserIsCorrect && 
                      validationResult.cacheUserIdMatches && 
                      validationResult.fakeUserRejected &&
                      (consoleMessages.length > 0 || validationResult.cachedUserIsCorrect)
    
    console.log(`\n🎯 Quick Test Result: ${testPassed ? '✅ PASS' : '❌ FAIL'}`)
    
    if (testPassed) {
      console.log('✅ localStorage cache security fix is working!')
      console.log('   - User ID validation prevents fake users')
      console.log('   - Cache mismatches are detected and corrected')
      console.log('   - Correct user data is maintained')
    } else {
      console.log('❌ Issues detected in cache security fix')
    }
    
    return testPassed
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
    return false
  } finally {
    await browser.close()
  }
}

// Run if called directly
if (require.main === module) {
  quickCacheTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

module.exports = { quickCacheTest }