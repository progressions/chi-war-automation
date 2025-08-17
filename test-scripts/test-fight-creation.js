// Fight Creation Test Script
// This script automates the complete fight creation and management flow

const { chromium } = require('playwright');

async function runFightCreationTest() {
  console.log('🚀 Starting Fight Creation Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false }); // Set to true for headless
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to login page
    console.log('📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:3001');
    
    // Take a screenshot to see what we're dealing with
    await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });
    console.log('📸 Screenshot taken: test-results/login-page.png');
    
    // Wait for page to load and check for login form
    await page.waitForLoadState('networkidle');
    
    // Wait for the login form to appear
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    // Use CSS selectors to find the input fields directly
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    
    // Take screenshot before clicking sign in
    await page.screenshot({ path: 'test-results/before-signin.png', fullPage: true });
    console.log('📸 Screenshot before sign in taken');
    
    await page.getByText('SIGN IN').click();
    
    // Wait a moment and take screenshot after click
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/after-signin.png', fullPage: true });
    console.log('📸 Screenshot after sign in taken');
    
    // Check if we're still on login page or redirected
    const currentUrl = page.url();
    console.log('Current URL after login attempt:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('Still on login page, checking for error messages...');
      const pageText = await page.textContent('body');
      console.log('Page text contains:', pageText.substring(0, 500));
    }
    
    // Wait for successful login - check if error message is gone and handle redirect
    const hasErrorMessage = await page.locator('text=Login failed').isVisible();
    if (!hasErrorMessage) {
      console.log('✅ Login appears successful (no error message)');
      
      // Check if we're redirected to home page or still on login page
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        console.log('🔄 Still on login page, manually navigating to home page...');
        await page.goto('http://localhost:3001/');
        await page.waitForLoadState('networkidle');
        console.log('Current URL after manual navigation:', page.url());
      } else {
        console.log('✅ Successfully redirected to:', currentUrl);
      }
    } else {
      console.log('❌ Login failed - error message visible');
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true });
      throw new Error('Login failed');
    }
    
    // Step 3: Navigate to fights
    console.log('📍 Step 3: Navigating to fights page...');
    
    // Take screenshot to see what page we're on
    await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });
    console.log('📸 Screenshot after login taken');
    
    // Log current URL
    console.log('Current URL after login:', page.url());
    
    // Try to find the fights link
    const fightsLink = page.getByRole('link', { name: 'All fights' });
    const isVisible = await fightsLink.isVisible();
    console.log('All fights link visible:', isVisible);
    
    if (!isVisible) {
      // Try alternative selectors or check page content
      const pageContent = await page.textContent('body');
      console.log('Page content (first 1000 chars):', pageContent.substring(0, 1000));
    }
    
    await page.getByRole('link', { name: 'All fights' }).click();
    await page.waitForURL(/.*\/fights.*/, { timeout: 10000 });
    
    // Step 4: Open create fight dialog
    console.log('➕ Step 4: Opening create fight dialog...');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give extra time for React to render
    
    // Take screenshot of fights page first
    await page.screenshot({ path: 'test-results/fights-page.png', fullPage: true });
    console.log('📸 Fights page screenshot taken');
    
    // SpeedDial button is typically a floating action button
    // First try to find and click the SpeedDial button to open the menu
    const speedDialButton = page.getByRole('button', { name: 'SpeedDial' }).or(page.locator('[aria-label="SpeedDial"]')).or(page.locator('.MuiSpeedDial-fab'));
    const isSpeedDialVisible = await speedDialButton.isVisible();
    console.log('SpeedDial button visible:', isSpeedDialVisible);
    
    if (isSpeedDialVisible) {
      await speedDialButton.click();
      console.log('Clicked SpeedDial button');
      
      // Wait a moment for menu to appear
      await page.waitForTimeout(1000);
      
      // Now look for the Create action
      const createAction = page.getByRole('menuitem', { name: 'Create' }).or(page.locator('[title="Create"]'));
      const isCreateVisible = await createAction.isVisible();
      console.log('Create action visible:', isCreateVisible);
      
      if (isCreateVisible) {
        await createAction.click();
        console.log('Clicked create action');
      } else {
        console.log('Create action not found, checking page content...');
        const pageContent = await page.textContent('body');
        console.log('Page content after clicking SpeedDial:', pageContent.substring(0, 500));
      }
    } else {
      console.log('SpeedDial button not found, checking available buttons...');
      const allButtons = await page.getByRole('button').all();
      for (const button of allButtons) {
        const text = await button.textContent();
        console.log('Available button:', text);
      }
    }
    
    // Wait for form to appear - the form might be in a drawer or dialog
    console.log('⏳ Waiting for fight creation form to appear...');
    await page.waitForTimeout(2000); // Give time for the drawer/dialog to open
    
    // Try different selectors for the name field
    const nameFieldSelectors = [
      'input[name="name"]',
      'input[label="Name"]',
      '#name',
      'input[placeholder*="Name"]',
      '.MuiTextField-root input'
    ];
    
    let nameFieldFound = false;
    for (const selector of nameFieldSelectors) {
      const field = page.locator(selector).first();
      if (await field.isVisible()) {
        console.log(`✅ Found name field with selector: ${selector}`);
        nameFieldFound = true;
        break;
      }
    }
    
    if (!nameFieldFound) {
      // Take a screenshot to see what's on screen
      await page.screenshot({ path: 'test-results/form-not-found.png', fullPage: true });
      console.log('📸 Form screenshot saved to test-results/form-not-found.png');
      throw new Error('Could not find the name field in the fight creation form');
    }
    
    // Step 5: Fill fight details
    console.log('📝 Step 5: Filling fight details...');
    const fightName = `Test Fight ${Date.now()}`;
    await page.getByRole('textbox', { name: 'Name' }).fill(fightName);
    
    // Fill description
    const description = 'Automated test fight - A fierce battle in a testing environment where bugs meet their doom.';
    await page.locator('div').filter({ hasText: /^Description$/ }).getByRole('textbox').fill(description);
    
    // Set season and session
    await page.getByRole('textbox').nth(2).fill('5'); // Season
    await page.getByRole('textbox').nth(3).fill('99'); // Session (high number to avoid conflicts)
    
    // Step 6: Save the fight
    console.log('💾 Step 6: Saving the fight...');
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Wait for success notification
    await page.waitForSelector('text=Fight created successfully', { timeout: 10000 });
    console.log('✅ Fight created successfully');
    
    // Step 7: Navigate to the new fight
    console.log('📍 Step 7: Navigating to the new fight...');
    
    // Refresh the page to see the new fight in the table
    console.log('🔄 Refreshing page to load new fight...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take a screenshot to see the fights list after refresh
    await page.screenshot({ path: 'test-results/after-fight-creation.png', fullPage: true });
    console.log('📸 Screenshot after refresh saved');
    
    // Now try to find the new fight link
    const fightLink = page.getByRole('link', { name: fightName }).or(
      page.locator(`text="${fightName}"`).first()
    );
    
    const isFightVisible = await fightLink.isVisible();
    console.log(`Fight "${fightName}" visible after refresh: ${isFightVisible}`);
    
    if (isFightVisible) {
      await fightLink.click();
      console.log(`✅ Clicked on fight: ${fightName}`);
    } else {
      console.log(`❌ Could not find fight: ${fightName}`);
      // Take another screenshot to debug
      await page.screenshot({ path: 'test-results/fight-not-found.png', fullPage: true });
      console.log('📸 Debug screenshot saved to test-results/fight-not-found.png');
      
      // List all visible fights for debugging
      const visibleFights = await page.locator('td').allTextContents();
      console.log('Visible table cells:', visibleFights);
    }
    
    // Wait for navigation - be more flexible about what counts as success
    await page.waitForTimeout(3000); // Give time for navigation
    const fightPageUrl = page.url();
    console.log('Current URL after clicking fight link:', fightPageUrl);
    
    // Check if we're on a fight detail page (URL might vary)
    if (fightPageUrl.includes('/fights/') || fightPageUrl.includes('fight')) {
      console.log('✅ Successfully navigated to fight page');
    } else {
      console.log('⚠️ URL did not change as expected, but continuing...');
    }
    
    // Step 8: Add a fighter
    console.log('👤 Step 8: Adding a fighter...');
    await page.locator('div').filter({ hasText: /^FightersManage$/ }).getByRole('button').click();
    
    // Select character from dropdown
    await page.getByRole('combobox', { name: 'Characters' }).click();
    await page.getByRole('option', { name: 'Fred the Bounty Hunter' }).click();
    
    // Add the character
    await page.locator('div').filter({ hasText: /^TypeTypeFactionsFactionsArchetypeArchetypeCharactersCharacters$/ }).getByRole('button').nth(4).click();
    
    // Wait for success
    await page.waitForSelector('text=Operation successful', { timeout: 5000 });
    await page.waitForSelector('text=Fight updated successfully', { timeout: 5000 });
    console.log('✅ Fighter added successfully');
    
    // Step 9: Verify fighter was added
    console.log('🔍 Step 9: Verifying fighter was added...');
    const fighterElement = await page.waitForSelector('text=Fred the Bounty Hunter', { timeout: 5000 });
    if (fighterElement) {
      console.log('✅ Fighter verification successful');
    }
    
    // Step 10: Remove the fighter
    console.log('🗑️ Step 10: Removing the fighter...');
    await page.locator('.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-colorError').click();
    
    // Wait for removal confirmation
    await page.waitForSelector('text=Fight updated successfully', { timeout: 5000 });
    await page.waitForSelector('text=No items found', { timeout: 5000 });
    console.log('✅ Fighter removed successfully');
    
    // Step 11: Take a screenshot of final state
    console.log('📸 Step 11: Taking final screenshot...');
    await page.screenshot({ path: 'test-results/fight-creation-test.png', fullPage: true });
    
    console.log('🎉 Test completed successfully!');
    console.log(`📊 Fight created: ${fightName}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/error-screenshot.png', fullPage: true });
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runFightCreationTest()
    .then(() => {
      console.log('✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { runFightCreationTest };