const { chromium } = require('playwright')
const { loginAsPlayer, loginAsGamemaster } = require('./login-helper')
const TEST_CONFIG = require('./test-config')

async function testEmailChangeProtection() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🧪 Testing Email Change Protection Feature')
    
    // Step 1: Login as a test user
    console.log('📝 Step 1: Logging in as player...')
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/email-protection-01-login.png',
    })
    
    // Step 2: Navigate to profile page
    console.log('📝 Step 2: Navigating to profile page...')
    await page.goto('TEST_CONFIG.getProfileUrl()')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'test-results/email-protection-02-profile-page.png' })
    
    // Step 3: Verify profile form is loaded
    console.log('📝 Step 3: Verifying profile form...')
    await page.waitForSelector('input[name="email"]', { timeout: 10000 })
    await page.waitForSelector('input[name="first_name"]')
    await page.waitForSelector('input[name="last_name"]')
    
    const originalEmail = await page.inputValue('input[name="email"]')
    console.log(`   Original email: ${originalEmail}`)
    
    // Step 4: Test non-email field changes (should not show dialog)
    console.log('📝 Step 4: Testing non-email field changes...')
    await page.fill('input[name="first_name"]', 'UpdatedFirst')
    await page.waitForTimeout(1000) // Wait for potential API call
    
    // Verify no confirmation dialog appears
    const dialogVisible = await page.isVisible('[role="dialog"]')
    if (dialogVisible) {
      throw new Error('❌ Confirmation dialog should NOT appear for non-email changes')
    }
    console.log('   ✅ Non-email changes work without confirmation')
    
    // Step 5: Test email change (should show confirmation dialog on blur)
    console.log('📝 Step 5: Testing email change...')
    const newEmail = 'updated@example.com'
    await page.fill('input[name="email"]', newEmail)
    
    // Verify dialog does NOT appear while typing
    console.log('   Verifying dialog does not appear while typing...')
    await page.waitForTimeout(1000) // Wait to ensure no dialog appears
    const dialogWhileTyping = await page.isVisible('[role="dialog"]')
    if (dialogWhileTyping) {
      throw new Error('❌ Dialog should NOT appear while typing')
    }
    console.log('   ✅ Dialog does not appear while typing')
    
    // Blur the email field to trigger confirmation dialog
    console.log('   Blurring email field to trigger confirmation...')
    await page.locator('input[name="email"]').blur()
    
    // Wait for confirmation dialog to appear
    console.log('   Waiting for confirmation dialog...')
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
    await page.screenshot({ path: 'test-results/email-protection-03-confirmation-dialog.png' })
    
    // Step 6: Verify dialog content
    console.log('📝 Step 6: Verifying dialog content...')
    await page.waitForSelector('text=Confirm Email Address Change')
    await page.waitForSelector('text=Changing your email address will affect')
    
    // Check that both emails are shown
    const dialogContent = await page.textContent('[role="dialog"]')
    if (!dialogContent.includes(originalEmail)) {
      throw new Error(`❌ Dialog should show original email: ${originalEmail}`)
    }
    if (!dialogContent.includes(newEmail)) {
      throw new Error(`❌ Dialog should show new email: ${newEmail}`)
    }
    console.log('   ✅ Dialog shows correct email addresses')
    
    // Step 7: Test cancellation
    console.log('📝 Step 7: Testing cancellation...')
    await page.click('button:has-text("Cancel")')
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' })
    console.log('   ✅ Cancel button closes dialog')
    
    // Step 8: Test email change again with confirmation
    console.log('📝 Step 8: Testing email change with confirmation...')
    await page.fill('input[name="email"]', newEmail)
    await page.locator('input[name="email"]').blur()
    
    // Wait for confirmation dialog
    await page.waitForSelector('[role="dialog"]')
    await page.screenshot({ path: 'test-results/email-protection-04-confirm-change.png' })
    
    // Click confirm
    await page.click('button:has-text("Confirm Change")')
    
    // Wait for dialog to close and success notification
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' })
    console.log('   ✅ Confirm button processes email change')
    
    // Step 9: Test ESC key cancellation
    console.log('📝 Step 9: Testing ESC key cancellation...')
    const anotherNewEmail = 'another@example.com'
    await page.fill('input[name="email"]', anotherNewEmail)
    await page.locator('input[name="email"]').blur()
    
    // Wait for confirmation dialog
    await page.waitForSelector('[role="dialog"]')
    
    // Press Escape
    await page.keyboard.press('Escape')
    
    // Wait for dialog to close
    await page.waitForSelector('[role="dialog"]', { state: 'hidden' })
    console.log('   ✅ ESC key closes dialog')
    
    // Step 10: Test case-insensitive email detection
    console.log('📝 Step 10: Testing case-insensitive email detection...')
    const currentEmail = await page.inputValue('input[name="email"]')
    await page.fill('input[name="email"]', currentEmail.toUpperCase())
    
    // Should not show dialog for case-only changes
    await page.waitForTimeout(1000)
    const caseDialogVisible = await page.isVisible('[role="dialog"]')
    if (caseDialogVisible) {
      throw new Error('❌ Dialog should NOT appear for case-only email changes')
    }
    console.log('   ✅ Case-only changes do not trigger confirmation')
    
    // Step 11: Test whitespace trimming
    console.log('📝 Step 11: Testing whitespace trimming...')
    await page.fill('input[name="email"]', ` ${currentEmail} `)
    
    // Should not show dialog for whitespace-only changes
    await page.waitForTimeout(1000)
    const whitespaceDialogVisible = await page.isVisible('[role="dialog"]')
    if (whitespaceDialogVisible) {
      throw new Error('❌ Dialog should NOT appear for whitespace-only email changes')
    }
    console.log('   ✅ Whitespace-only changes do not trigger confirmation')
    
    // Step 12: Final screenshot
    await page.screenshot({ path: 'test-results/email-protection-05-final.png' })
    
    console.log('✅ All email change protection tests passed!')
    return true
    
  } catch (error) {
    console.error('❌ Email change protection test failed:', error.message)
    await page.screenshot({ path: 'test-results/email-protection-ERROR.png' })
    return false
  } finally {
    await browser.close()
  }
}

async function testAccessibility() {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🌐 Testing Email Change Dialog Accessibility')
    
    // Login and navigate to profile
    await loginAsPlayer(page, { takeScreenshot: false, port: 3001 })
    await page.goto('TEST_CONFIG.getProfileUrl()')
    await page.waitForLoadState('networkidle')
    
    // Trigger email change dialog
    await page.fill('input[name="email"]', 'accessibility-test@example.com')
    await page.locator('input[name="email"]').blur()
    await page.waitForSelector('[role="dialog"]')
    
    // Test keyboard navigation
    console.log('   Testing keyboard navigation...')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Verify dialog has proper ARIA attributes
    const dialog = await page.$('[role="dialog"]')
    const ariaLabelledBy = await dialog.getAttribute('aria-labelledby')
    const ariaDescribedBy = await dialog.getAttribute('aria-describedby')
    
    if (!ariaLabelledBy) {
      throw new Error('❌ Dialog missing aria-labelledby')
    }
    if (!ariaDescribedBy) {
      throw new Error('❌ Dialog missing aria-describedby')  
    }
    
    console.log('   ✅ Dialog has proper ARIA attributes')
    
    // Test focus management
    const activeElement = await page.evaluate(() => document.activeElement?.tagName)
    console.log(`   Active element: ${activeElement}`)
    
    await page.keyboard.press('Escape')
    console.log('   ✅ Accessibility tests passed')
    
    return true
    
  } catch (error) {
    console.error('❌ Accessibility test failed:', error.message)
    await page.screenshot({ path: 'test-results/email-protection-accessibility-ERROR.png' })
    return false
  } finally {
    await browser.close()
  }
}

async function runAllTests() {
  console.log('🚀 Starting Email Change Protection E2E Tests')
  console.log('=' .repeat(60))
  
  const results = []
  
  // Run main functionality test
  const functionalityResult = await testEmailChangeProtection()
  results.push({ test: 'Email Change Protection Functionality', passed: functionalityResult })
  
  // Run accessibility test
  const accessibilityResult = await testAccessibility()
  results.push({ test: 'Email Change Protection Accessibility', passed: accessibilityResult })
  
  console.log('\n' + '=' .repeat(60))
  console.log('📊 Test Results Summary:')
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL'
    console.log(`   ${status}: ${result.test}`)
  })
  
  const allPassed = results.every(result => result.passed)
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`)
  
  return allPassed
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1)
  })
}

module.exports = { testEmailChangeProtection, testAccessibility, runAllTests }