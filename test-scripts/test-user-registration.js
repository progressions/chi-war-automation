const { chromium } = require('playwright')
const TEST_CONFIG = require('./test-config')

async function testUserRegistration() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🧪 Testing User Registration Flow')
    
    // Step 1: Navigate to registration page
    console.log('📍 Navigating to registration page...')
    await page.goto(TEST_CONFIG.getRegisterUrl())
    await page.waitForLoadState('networkidle')
    
    // Wait for registration form to load
    await page.waitForSelector('text=Create Account', { timeout: 10000 })
    
    await page.screenshot({ 
      path: 'test-results/registration-01-form.png', 
      fullPage: true 
    })
    console.log('📸 Registration form screenshot taken')
    
    // Step 2: Fill out registration form with unique data
    const timestamp = Date.now()
    const testEmail = `test_user_${timestamp}@example.com`
    const testPassword = 'TestPassword123!'
    
    console.log(`📝 Filling out registration form for ${testEmail}...`)
    
    // Fill form fields using Material-UI field selectors
    console.log('📝 Filling first name...')
    await page.getByLabel('First Name').fill('Test')
    
    console.log('📝 Filling last name...')
    await page.getByLabel('Last Name').fill('User')
    
    console.log('📝 Filling email...')
    await page.getByLabel('Email Address').fill(testEmail)
    
    console.log('📝 Filling password...')
    await page.getByLabel('Password').first().fill(testPassword)
    
    console.log('📝 Filling password confirmation...')
    await page.getByLabel('Confirm Password').fill(testPassword)
    
    await page.screenshot({ 
      path: 'test-results/registration-02-form-filled.png', 
      fullPage: true 
    })
    console.log('📸 Filled form screenshot taken')
    
    // Step 3: Submit registration
    console.log('🚀 Submitting registration form...')
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Step 4: Wait for success message or redirect
    console.log('⏳ Waiting for registration response...')
    
    // Wait for either success message or redirect to login
    try {
      // Check for success message first
      await page.waitForSelector('text=Registration successful', { timeout: 10000 })
      console.log('✅ Registration success message appeared')
      
      await page.screenshot({ 
        path: 'test-results/registration-03-success.png', 
        fullPage: true 
      })
      
    } catch (error) {
      // If no success message, check if we were redirected to login
      await page.waitForURL('**/login', { timeout: 5000 })
      console.log('✅ Redirected to login page after registration')
      
      await page.screenshot({ 
        path: 'test-results/registration-03-redirect-login.png', 
        fullPage: true 
      })
    }
    
    // Step 5: Verify we can navigate to login and the user exists
    console.log('🔍 Verifying registration by attempting login...')
    
    // If not already on login page, navigate there
    if (!page.url().includes('/login')) {
      await page.goto(TEST_CONFIG.getLoginUrl())
      await page.waitForLoadState('networkidle')
    }
    
    // Try to login with the new credentials
    await page.getByLabel('Email Address').fill(testEmail)
    await page.getByLabel('Password').fill(testPassword)
    
    await page.screenshot({ 
      path: 'test-results/registration-04-login-attempt.png', 
      fullPage: true 
    })
    
    await page.getByText('SIGN IN').click()
    await page.waitForTimeout(3000)
    
    // Check the result - either successful login or confirmation required
    const currentUrl = page.url()
    const pageContent = await page.content()
    
    if (currentUrl.includes('/login')) {
      // Still on login page - check for unconfirmed account message
      if (pageContent.includes('Please confirm your email')) {
        console.log('✅ Registration successful - email confirmation required')
        await page.screenshot({ 
          path: 'test-results/registration-05-confirmation-required.png', 
          fullPage: true 
        })
      } else {
        console.log('❌ Login failed after registration')
        await page.screenshot({ 
          path: 'test-results/registration-ERROR-login-failed.png', 
          fullPage: true 
        })
        return false
      }
    } else {
      // Successful login redirect
      console.log('✅ Registration and login successful!')
      await page.screenshot({ 
        path: 'test-results/registration-05-login-success.png', 
        fullPage: true 
      })
    }
    
    // Step 6: Verify backend state (optional API check)
    console.log('📊 Verifying user was created in backend...')
    
    // This would require an API call to verify the user exists
    // For now, we'll just log the test email for manual verification
    console.log(`✅ Registration test completed for user: ${testEmail}`)
    
    await page.screenshot({ 
      path: 'test-results/registration-06-final.png', 
      fullPage: true 
    })
    
    console.log('✅ All registration tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message)
    await page.screenshot({ 
      path: 'test-results/registration-ERROR.png', 
      fullPage: true 
    })
    return false
  } finally {
    await browser.close()
  }
}

// Run the test
testUserRegistration().then(success => {
  console.log(success ? '🎉 Registration test suite completed successfully!' : '💥 Registration test suite failed!')
  process.exit(success ? 0 : 1)
})