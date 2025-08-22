const { chromium } = require('playwright')
const { loginAsGamemaster } = require('./login-helper')

async function testAuthenticationRouting() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🔐 Testing Authentication Routing Logic')

    // Test 1: Unauthenticated user sees marketing page
    console.log('📍 Test 1: Unauthenticated user at root...')
    await page.goto('http://localhost:3005')
    await page.waitForTimeout(2000)

    // Should see marketing landing page
    const heroTitle = await page.locator('h1:has-text("Master Epic Cinematic Adventures")').first()
    if (await heroTitle.isVisible()) {
      console.log('✅ Unauthenticated user sees marketing page')
    } else {
      throw new Error('❌ Unauthenticated user does not see marketing page')
    }

    await page.screenshot({ 
      path: 'test-results/auth-routing-01-unauthenticated.png',
      fullPage: true
    })

    // Test 2: Login and verify redirect
    console.log('🔑 Test 2: Authenticating user...')
    
    // Navigate to login page
    await page.goto('http://localhost:3005/login')
    await page.waitForTimeout(1000)

    // Login as gamemaster
    await loginAsGamemaster(page, { 
      takeScreenshot: false,
      skipNavigation: true
    })

    await page.screenshot({ 
      path: 'test-results/auth-routing-02-authenticated-login.png'
    })

    // Test 3: Authenticated user visits root - should redirect to dashboard
    console.log('📍 Test 3: Authenticated user visits root...')
    await page.goto('http://localhost:3005')
    await page.waitForTimeout(3000)

    // Should be redirected to campaigns dashboard
    const currentURL = page.url()
    console.log('Current URL:', currentURL)

    if (currentURL.includes('/campaigns') || await page.locator('h1:has-text("Campaigns")').first().isVisible()) {
      console.log('✅ Authenticated user redirected to dashboard')
    } else {
      // Check if we see dashboard content
      const dashboardContent = await page.locator('[data-testid="dashboard"], .dashboard, h1:has-text("Campaign")').first()
      if (await dashboardContent.isVisible()) {
        console.log('✅ Authenticated user sees dashboard content')
      } else {
        console.log('⚠️  Checking for any campaign-related content...')
        const pageContent = await page.textContent('body')
        if (pageContent.includes('Campaign') || pageContent.includes('Dashboard')) {
          console.log('✅ Found campaign-related content')
        } else {
          throw new Error('❌ Authenticated user not redirected to dashboard')
        }
      }
    }

    await page.screenshot({ 
      path: 'test-results/auth-routing-03-authenticated-dashboard.png'
    })

    // Test 4: Logout and verify marketing page returns
    console.log('🚪 Test 4: Logout and verify marketing page returns...')
    
    // Clear cookies to simulate logout
    await context.clearCookies()
    
    // Visit root again
    await page.goto('http://localhost:3005')
    await page.waitForTimeout(2000)

    // Should see marketing page again
    const heroTitleAgain = await page.locator('h1:has-text("Master Epic Cinematic Adventures")').first()
    if (await heroTitleAgain.isVisible()) {
      console.log('✅ After logout, user sees marketing page')
    } else {
      throw new Error('❌ After logout, user does not see marketing page')
    }

    await page.screenshot({ 
      path: 'test-results/auth-routing-04-post-logout-marketing.png',
      fullPage: true
    })

    // Test 5: Test protected route redirect
    console.log('🔒 Test 5: Testing protected route redirect...')
    await page.goto('http://localhost:3005/campaigns')
    await page.waitForTimeout(2000)

    // Should be redirected to login with redirect parameter
    const loginURL = page.url()
    if (loginURL.includes('/login')) {
      console.log('✅ Protected route redirects to login')
      if (loginURL.includes('redirect=')) {
        console.log('✅ Redirect parameter preserved')
      }
    } else {
      throw new Error('❌ Protected route does not redirect to login')
    }

    await page.screenshot({ 
      path: 'test-results/auth-routing-05-protected-redirect.png'
    })

    console.log('✅ Authentication routing test completed successfully!')

  } catch (error) {
    console.error('❌ Authentication routing test failed:', error)
    
    await page.screenshot({ 
      path: 'test-results/auth-routing-ERROR.png',
      fullPage: true
    })
    
    throw error
  } finally {
    await browser.close()
  }
}

if (require.main === module) {
  testAuthenticationRouting().catch(console.error)
}

module.exports = { testAuthenticationRouting }