const { chromium } = require('playwright')

async function testMarketingLandingPage() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🎬 Testing Marketing Landing Page')

    // Navigate to root page without authentication (test environment)
    console.log('📍 Navigating to root page...')
    await page.goto('http://localhost:3005')

    // Wait for page to load
    await page.waitForTimeout(2000)

    // Take screenshot of landing page
    await page.screenshot({ 
      path: 'test-results/marketing-01-landing-page.png',
      fullPage: true
    })

    // Check if hero section is visible
    console.log('🔍 Checking hero section...')
    const heroTitle = await page.locator('h1:has-text("Master Epic Cinematic Adventures")').first()
    await expect(heroTitle).toBeVisible()

    const heroSubtitle = await page.locator('h2:has-text("The ultimate Feng Shui 2")').first()
    await expect(heroSubtitle).toBeVisible()

    // Check CTAs are present
    console.log('🔍 Checking call-to-action buttons...')
    const signupCTA = await page.locator('a:has-text("Start Your Legendary Campaign")').first()
    const loginCTA = await page.locator('a:has-text("Already a Hero? Login")').first()
    
    await expect(signupCTA).toBeVisible()
    await expect(loginCTA).toBeVisible()

    // Check feature showcase section
    console.log('🔍 Checking feature showcase...')
    const featuresTitle = await page.locator('h2:has-text("Cinematic Adventures Await")').first()
    await expect(featuresTitle).toBeVisible()

    // Check for feature cards
    const featureCards = await page.locator('[data-testid="feature-card"], .MuiCard-root').count()
    console.log(`Found ${featureCards} feature cards`)

    // Check screenshot gallery section
    console.log('🔍 Checking screenshot gallery...')
    const galleryTitle = await page.locator('h2:has-text("See Chi War in Action")').first()
    await expect(galleryTitle).toBeVisible()

    // Check juncture showcase section
    console.log('🔍 Checking juncture showcase...')
    const junctureTitle = await page.locator('h2:has-text("Adventure Across Time")').first()
    await expect(junctureTitle).toBeVisible()

    // Check testimonials section
    console.log('🔍 Checking testimonials section...')
    const testimonialsTitle = await page.locator('h2:has-text("Trusted by Gamemasters Worldwide")').first()
    await expect(testimonialsTitle).toBeVisible()

    // Check final CTA section
    console.log('🔍 Checking final call-to-action...')
    const finalCTATitle = await page.locator('h2:has-text("Your Epic Adventure Awaits")').first()
    await expect(finalCTATitle).toBeVisible()

    // Check footer is present
    console.log('🔍 Checking footer...')
    const footer = await page.locator('footer').first()
    await expect(footer).toBeVisible()

    // Test responsive design
    console.log('📱 Testing mobile responsiveness...')
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)

    await page.screenshot({ 
      path: 'test-results/marketing-02-mobile-view.png',
      fullPage: true
    })

    // Check that hero section is still visible on mobile
    await expect(heroTitle).toBeVisible()
    await expect(signupCTA).toBeVisible()

    // Test signup CTA click
    console.log('🔗 Testing signup CTA...')
    await page.setViewportSize({ width: 1280, height: 720 })
    await signupCTA.click()
    
    // Should navigate to signup page
    await page.waitForURL(/.*sign_up.*/)
    await page.screenshot({ 
      path: 'test-results/marketing-03-signup-redirect.png'
    })

    // Go back to test login CTA
    console.log('🔗 Testing login CTA...')
    await page.goBack()
    await page.waitForTimeout(1000)
    
    await loginCTA.click()
    
    // Should navigate to login page
    await page.waitForURL(/.*login.*/)
    await page.screenshot({ 
      path: 'test-results/marketing-04-login-redirect.png'
    })

    console.log('✅ Marketing landing page test completed successfully!')

  } catch (error) {
    console.error('❌ Marketing landing page test failed:', error)
    
    await page.screenshot({ 
      path: 'test-results/marketing-ERROR.png',
      fullPage: true
    })
    
    throw error
  } finally {
    await browser.close()
  }
}

// Add expect function for assertions
function expect(locator) {
  return {
    async toBeVisible() {
      const isVisible = await locator.isVisible()
      if (!isVisible) {
        throw new Error(`Expected element to be visible`)
      }
    }
  }
}

if (require.main === module) {
  testMarketingLandingPage().catch(console.error)
}

module.exports = { testMarketingLandingPage }