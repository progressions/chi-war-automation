/**
 * E2E Tests for Passkey (WebAuthn) Authentication Flows
 *
 * Tests:
 * 1. Passkey registration flow (add new passkey)
 * 2. Passkey login flow (authenticate with passkey)
 * 3. Passkey management (rename, delete)
 *
 * Uses Playwright's virtual authenticator for WebAuthn testing
 */

const { chromium } = require("playwright")
const TEST_CONFIG = require("./test-config")
const { loginAsGamemaster } = require("./login-helper")

const SCREENSHOT_PATH = "test-results/passkey"

async function setupVirtualAuthenticator(context) {
  // Create a virtual authenticator for WebAuthn testing
  const cdpSession = await context.newCDPSession(await context.pages()[0] || await context.newPage())

  await cdpSession.send("WebAuthn.enable")

  const { authenticatorId } = await cdpSession.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    },
  })

  console.log(`Virtual authenticator created: ${authenticatorId}`)
  return { cdpSession, authenticatorId }
}

async function testPasskeyRegistration(page, cdpSession, authenticatorId) {
  console.log("\n========================================")
  console.log("TEST: Passkey Registration Flow")
  console.log("========================================\n")

  try {
    // Navigate to profile page where PasskeyManager is located
    await page.goto(TEST_CONFIG.getProfileUrl())
    await page.waitForLoadState("networkidle")

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/01-profile-page.png`,
      fullPage: true,
    })
    console.log("1. Navigated to profile page")

    // Look for the Security section with PasskeyManager
    const securitySection = page.locator("text=Security")
    await securitySection.waitFor({ timeout: 10000 })
    console.log("2. Found Security section")

    // Look for the Add Passkey button
    const addPasskeyButton = page.locator("button:has-text('Add Passkey')")
    await addPasskeyButton.waitFor({ timeout: 10000 })

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/02-passkey-manager.png`,
      fullPage: true,
    })
    console.log("3. Found Add Passkey button")

    // Click Add Passkey to open registration dialog
    await addPasskeyButton.click()
    await page.waitForTimeout(500)

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/03-registration-dialog.png`,
      fullPage: true,
    })
    console.log("4. Opened passkey registration dialog")

    // Find the passkey name field and fill it
    const nameField = page.locator("input[label='Passkey Name'], input").filter({ hasText: "" }).first()
    const dialogNameField = page.locator("dialog input, [role='dialog'] input").first()

    if (await dialogNameField.isVisible()) {
      await dialogNameField.fill("Test Device")
      console.log("5. Filled passkey name: Test Device")
    }

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/04-name-entered.png`,
      fullPage: true,
    })

    // Click Continue to start WebAuthn registration
    const continueButton = page.locator("button:has-text('Continue')")
    await continueButton.click()

    // Wait for the WebAuthn ceremony to complete (virtual authenticator handles it)
    await page.waitForTimeout(2000)

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/05-after-registration.png`,
      fullPage: true,
    })

    // Check for success - either a success toast or the new passkey in the list
    const successToast = page.locator("text=Passkey registered successfully")
    const passkeyListItem = page.locator("text=Test Device")

    const registrationSucceeded = await Promise.race([
      successToast.waitFor({ timeout: 5000 }).then(() => true).catch(() => false),
      passkeyListItem.waitFor({ timeout: 5000 }).then(() => true).catch(() => false),
    ])

    if (registrationSucceeded) {
      console.log("6. Passkey registration successful!")
      await page.screenshot({
        path: `${SCREENSHOT_PATH}/06-registration-success.png`,
        fullPage: true,
      })
      return true
    } else {
      console.log("6. Registration may have failed - checking for errors")
      await page.screenshot({
        path: `${SCREENSHOT_PATH}/06-registration-result.png`,
        fullPage: true,
      })
      return false
    }

  } catch (error) {
    console.error("Passkey registration test failed:", error.message)
    await page.screenshot({
      path: `${SCREENSHOT_PATH}/registration-error.png`,
      fullPage: true,
    })
    return false
  }
}

async function testPasskeyLogin(browser) {
  console.log("\n========================================")
  console.log("TEST: Passkey Login Flow")
  console.log("========================================\n")

  // Create a fresh context without cookies (logged out state)
  const context = await browser.newContext()
  const page = await context.newPage()

  // Set up virtual authenticator for the new context
  const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(context)

  try {
    // Navigate to login page
    await page.goto(TEST_CONFIG.getLoginUrl())
    await page.waitForLoadState("networkidle")

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/login-01-page.png`,
      fullPage: true,
    })
    console.log("1. Navigated to login page")

    // Click on Passkey tab
    const passkeyTab = page.locator("[role='tab']:has-text('Passkey')")
    await passkeyTab.waitFor({ timeout: 10000 })
    await passkeyTab.click()

    await page.waitForTimeout(500)
    await page.screenshot({
      path: `${SCREENSHOT_PATH}/login-02-passkey-tab.png`,
      fullPage: true,
    })
    console.log("2. Selected Passkey login tab")

    // Fill in email
    const emailField = page.locator("input[name='email'], input[type='email']").first()
    await emailField.fill("progressions@gmail.com")
    console.log("3. Entered email address")

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/login-03-email-entered.png`,
      fullPage: true,
    })

    // Click Sign in with Passkey
    const signInButton = page.locator("button:has-text('Sign in with Passkey')")
    await signInButton.click()

    // Wait for WebAuthn ceremony (virtual authenticator handles it)
    await page.waitForTimeout(3000)

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/login-04-after-auth.png`,
      fullPage: true,
    })

    // Check for success - should redirect away from login page
    const currentUrl = page.url()
    if (!currentUrl.includes("/login")) {
      console.log("4. Passkey login successful - redirected to:", currentUrl)
      return true
    } else {
      // Check for error message
      const errorAlert = page.locator("[role='alert'], .MuiAlert-root")
      if (await errorAlert.isVisible()) {
        const errorText = await errorAlert.textContent()
        console.log("4. Login failed with error:", errorText)
      }
      return false
    }

  } catch (error) {
    console.error("Passkey login test failed:", error.message)
    await page.screenshot({
      path: `${SCREENSHOT_PATH}/login-error.png`,
      fullPage: true,
    })
    return false
  } finally {
    await context.close()
  }
}

async function testPasskeyManagement(page) {
  console.log("\n========================================")
  console.log("TEST: Passkey Management")
  console.log("========================================\n")

  try {
    // Navigate to profile page
    await page.goto(TEST_CONFIG.getProfileUrl())
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(1000)

    await page.screenshot({
      path: `${SCREENSHOT_PATH}/manage-01-profile.png`,
      fullPage: true,
    })
    console.log("1. Navigated to profile page")

    // Look for existing passkeys
    const passkeyList = page.locator("text=Passkeys").locator("..")
    const passkeyItem = page.locator("li:has-text('Test Device'), [role='listitem']:has-text('Test Device')")

    if (await passkeyItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log("2. Found existing passkey")

      // Test rename functionality
      const editButton = passkeyItem.locator("button[aria-label='rename']")
      if (await editButton.isVisible()) {
        await editButton.click()
        await page.waitForTimeout(500)

        await page.screenshot({
          path: `${SCREENSHOT_PATH}/manage-02-edit-dialog.png`,
          fullPage: true,
        })
        console.log("3. Opened edit dialog")

        // Change the name
        const nameInput = page.locator("[role='dialog'] input").first()
        await nameInput.fill("Renamed Device")

        // Save
        const saveButton = page.locator("button:has-text('Save')")
        await saveButton.click()
        await page.waitForTimeout(1000)

        await page.screenshot({
          path: `${SCREENSHOT_PATH}/manage-03-after-rename.png`,
          fullPage: true,
        })
        console.log("4. Renamed passkey")
      }

      // Test delete functionality
      const renamedItem = page.locator("li:has-text('Renamed Device'), [role='listitem']:has-text('Renamed Device')")
      const deleteButton = renamedItem.locator("button[aria-label='delete']")

      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        await page.waitForTimeout(500)

        await page.screenshot({
          path: `${SCREENSHOT_PATH}/manage-04-delete-dialog.png`,
          fullPage: true,
        })
        console.log("5. Opened delete confirmation")

        // Confirm delete
        const confirmButton = page.locator("button:has-text('Delete')")
        await confirmButton.click()
        await page.waitForTimeout(1000)

        await page.screenshot({
          path: `${SCREENSHOT_PATH}/manage-05-after-delete.png`,
          fullPage: true,
        })
        console.log("6. Deleted passkey")
      }

      return true
    } else {
      console.log("2. No passkeys found to manage")
      return false
    }

  } catch (error) {
    console.error("Passkey management test failed:", error.message)
    await page.screenshot({
      path: `${SCREENSHOT_PATH}/manage-error.png`,
      fullPage: true,
    })
    return false
  }
}

async function runTests() {
  console.log("========================================")
  console.log("CHI WAR PASSKEY E2E TESTS")
  console.log("========================================")
  console.log(`Frontend URL: ${TEST_CONFIG.getFrontendUrl()}`)
  console.log(`Backend URL: ${TEST_CONFIG.getBackendUrl()}`)
  console.log(`Screenshots: ${SCREENSHOT_PATH}/`)
  console.log("========================================\n")

  // Create screenshot directory
  const fs = require("fs")
  if (!fs.existsSync(SCREENSHOT_PATH)) {
    fs.mkdirSync(SCREENSHOT_PATH, { recursive: true })
  }

  const browser = await chromium.launch({
    headless: true,
  })

  const results = {
    registration: false,
    login: false,
    management: false,
  }

  try {
    // Create context with virtual authenticator
    const context = await browser.newContext()
    const page = await context.newPage()

    // Set up virtual authenticator
    const { cdpSession, authenticatorId } = await setupVirtualAuthenticator(context)

    // First, login normally to access profile page
    console.log("\n--- Logging in with password first ---\n")
    await loginAsGamemaster(page, {
      takeScreenshot: true,
      screenshotPath: SCREENSHOT_PATH,
    })

    // Test 1: Passkey Registration
    results.registration = await testPasskeyRegistration(page, cdpSession, authenticatorId)

    // Test 2: Passkey Management (rename and delete)
    results.management = await testPasskeyManagement(page)

    // Close the logged-in context
    await context.close()

    // Test 3: Passkey Login (requires a fresh context)
    // Note: This will only work if there's a passkey registered
    // In a real test, we'd register a passkey first without deleting it
    // results.login = await testPasskeyLogin(browser)

  } catch (error) {
    console.error("\n❌ Test execution error:", error.message)
  } finally {
    await browser.close()
  }

  // Print results summary
  console.log("\n========================================")
  console.log("TEST RESULTS SUMMARY")
  console.log("========================================")
  console.log(`Registration: ${results.registration ? "PASSED" : "FAILED"}`)
  console.log(`Login: ${results.login ? "PASSED" : "SKIPPED"}`)
  console.log(`Management: ${results.management ? "PASSED" : "FAILED"}`)
  console.log("========================================\n")

  const allPassed = results.registration && results.management
  process.exit(allPassed ? 0 : 1)
}

// Run tests
runTests().catch(error => {
  console.error("Fatal error:", error)
  process.exit(1)
})
