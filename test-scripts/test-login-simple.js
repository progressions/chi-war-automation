const { chromium } = require('playwright')
const { loginAsPlayer } = require('./login-helper')

async function testSimpleLogin() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🧪 Testing Simple Login')
    
    // Test login with test servers
    console.log('📝 Logging in as player...')
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/simple-login.png',
      port: 3005
    })
    
    console.log('✅ Login test passed!')
    return true
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message)
    await page.screenshot({ path: 'test-results/simple-login-ERROR.png' })
    return false
  } finally {
    await browser.close()
  }
}

testSimpleLogin().then(success => {
  process.exit(success ? 0 : 1)
})