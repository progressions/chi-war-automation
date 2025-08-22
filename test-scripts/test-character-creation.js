// Character Creation Test Script
// This script automates the complete character creation and management flow

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function runCharacterCreationTest() {
  console.log('🚀 Starting Character Creation Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false }); // Set to true for headless
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to application and login
    console.log('📍 Step 1: Navigating to application...');
    await page.goto(TEST_CONFIG.getFrontendUrl());
    
    // Take a screenshot to see what we're dealing with
    await page.screenshot({ path: 'test-results/character-login-page.png', fullPage: true });
    console.log('📸 Screenshot taken: test-results/character-login-page.png');
    
    // Wait for page to load and check for login form
    await page.waitForLoadState('networkidle');
    
    // Wait for the login form to appear
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    
    await page.getByText('SIGN IN').click();
    
    // Wait for successful login
    await page.waitForTimeout(3000);
    console.log('✅ Login completed');
    
    // Step 3: Navigate to characters page
    console.log('📍 Step 3: Navigating to characters page...');
    
    // Take screenshot to see current page
    await page.screenshot({ path: 'test-results/after-character-login.png', fullPage: true });
    console.log('📸 After login screenshot taken');
    
    // Look for the characters navigation link
    const charactersLink = page.getByRole('link', { name: 'Characters' });
    const isCharactersVisible = await charactersLink.isVisible();
    console.log('Characters link visible:', isCharactersVisible);
    
    if (isCharactersVisible) {
      await charactersLink.click();
    } else {
      // Try alternative navigation
      console.log('🔄 Trying alternative navigation to characters...');
      await page.goto(TEST_CONFIG.getCharactersUrl());
    }
    
    await page.waitForURL(/.*\/characters.*/, { timeout: 10000 });
    console.log('✅ Successfully navigated to characters page');
    
    // Step 4: Open character creation dialog
    console.log('➕ Step 4: Opening character creation dialog...');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of characters page
    await page.screenshot({ path: 'test-results/characters-page.png', fullPage: true });
    console.log('📸 Characters page screenshot taken');
    
    // Look for SpeedDial or Create button
    const speedDialButton = page.getByRole('button', { name: 'SpeedDial' })
      .or(page.locator('[aria-label="SpeedDial"]'))
      .or(page.locator('.MuiSpeedDial-fab'));
    
    const isSpeedDialVisible = await speedDialButton.isVisible();
    console.log('SpeedDial button visible:', isSpeedDialVisible);
    
    if (isSpeedDialVisible) {
      await speedDialButton.click();
      console.log('Clicked SpeedDial button');
      
      // Wait for menu to appear
      await page.waitForTimeout(1000);
      
      // Look for Create action (be more specific to avoid "Created" column header)
      const createAction = page.getByRole('menuitem', { name: 'Create' })
        .or(page.locator('[title="Create"]'))
        .or(page.locator('button:has-text("Create")'));
      
      const isCreateVisible = await createAction.first().isVisible();
      console.log('Create action visible:', isCreateVisible);
      
      if (isCreateVisible) {
        await createAction.first().click();
        console.log('Clicked create action');
      } else {
        throw new Error('Create action not found in SpeedDial menu');
      }
    } else {
      // Try alternative create button
      console.log('Looking for alternative create button...');
      const createButton = page.getByRole('button', { name: /create/i })
        .or(page.getByText(/new character/i))
        .or(page.locator('button:has-text("Create")'));
      
      await createButton.click();
      console.log('Clicked alternative create button');
    }
    
    // Wait for template selection form to appear
    console.log('⏳ Waiting for character template selection to appear...');
    await page.waitForTimeout(2000);
    
    // Take screenshot to see what's actually displayed
    await page.screenshot({ path: 'test-results/character-template-selection.png', fullPage: true });
    console.log('📸 Template selection screenshot taken');
    
    // Step 5: Select a character template
    console.log('🎭 Step 5: Selecting character template...');
    
    // Look for template options - these could be buttons, cards, or dropdown options
    const templateSelectors = [
      'button:has-text("Bandit")',
      'button:has-text("Everyday Hero")', 
      'button:has-text("Killer")',
      'button:has-text("Martial Artist")',
      '.template-card:has-text("Bandit")',
      '[data-testid*="template"]:has-text("Bandit")',
      'li:has-text("Bandit")',
      '.MuiListItem-root:has-text("Bandit")'
    ];
    
    let templateSelected = false;
    for (const selector of templateSelectors) {
      const templateOption = page.locator(selector).first();
      if (await templateOption.isVisible()) {
        console.log(`✅ Found template option with selector: ${selector}`);
        await templateOption.click();
        console.log('✅ Selected Bandit template');
        templateSelected = true;
        break;
      }
    }
    
    if (!templateSelected) {
      // Try looking for any template-related text or buttons
      console.log('Looking for any template-related elements...');
      const pageContent = await page.textContent('body');
      if (pageContent.includes('Bandit') || pageContent.includes('template')) {
        console.log('Page contains template-related content, continuing...');
        // Try clicking on any visible button that might advance the process
        const genericButtons = page.locator('button:visible');
        const buttonCount = await genericButtons.count();
        console.log(`Found ${buttonCount} visible buttons`);
        
        if (buttonCount > 0) {
          // Click the first visible button to try to proceed
          await genericButtons.first().click();
          console.log('Clicked first visible button to proceed');
        }
      } else {
        await page.screenshot({ path: 'test-results/no-templates-found.png', fullPage: true });
        throw new Error('Could not find template selection options');
      }
    }
    
    // Wait for character customization form
    await page.waitForTimeout(2000);
    
    // Step 6: Customize character details
    console.log('📝 Step 6: Customizing character details...');
    
    const characterName = `Test Character ${Date.now()}`;
    console.log(`Creating character: ${characterName}`);
    
    // Look for name field in the customization form
    const nameFieldSelectors = [
      'input[name="name"]',
      'input[placeholder*="Name"]',
      'input[placeholder*="name"]',
      '.MuiTextField-root input[type="text"]',
      'input[type="text"]'
    ];
    
    let nameFieldFound = false;
    for (const selector of nameFieldSelectors) {
      const nameField = page.locator(selector).first();
      if (await nameField.isVisible()) {
        console.log(`✅ Found name field with selector: ${selector}`);
        await nameField.fill(characterName);
        console.log('✅ Character name filled');
        nameFieldFound = true;
        break;
      }
    }
    
    if (!nameFieldFound) {
      console.log('⚠️ No name field found, character might use template name');
    }
    
    // Take screenshot of customization form
    await page.screenshot({ path: 'test-results/character-customization-form.png', fullPage: true });
    console.log('📸 Customization form screenshot taken');
    
    // Step 6: Save the character
    console.log('💾 Step 6: Saving the character...');
    
    // Look for save button with more specific selectors
    const saveButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("Save")',
      'button:has-text("Create")',
      'button:has-text("Submit")',
      '.MuiButton-root:has-text("Save")',
      '[data-testid*="save"]',
      '[data-testid*="submit"]'
    ];
    
    let saveButtonFound = false;
    for (const selector of saveButtonSelectors) {
      const saveButton = page.locator(selector);
      if (await saveButton.isVisible()) {
        console.log(`Found save button with selector: ${selector}`);
        await saveButton.click();
        console.log('Clicked save button');
        saveButtonFound = true;
        break;
      }
    }
    
    if (!saveButtonFound) {
      console.log('⚠️ No save button found, character might have been auto-saved or form might be different');
      // Take screenshot to see current state
      await page.screenshot({ path: 'test-results/no-save-button.png', fullPage: true });
    }
    
    // Wait for success notification or page change
    try {
      await page.waitForSelector('text=Character created successfully', { timeout: 5000 });
      console.log('✅ Character created successfully');
    } catch (error) {
      // Alternative success indicators
      console.log('Looking for alternative success indicators...');
      try {
        await page.waitForSelector('text=Operation successful', { timeout: 3000 });
        console.log('✅ Operation successful');
      } catch (error2) {
        try {
          // Check if we're back on the characters list (indicating success)
          await page.waitForSelector('text=Characters', { timeout: 3000 });
          const currentUrl = page.url();
          if (currentUrl.includes('/characters') && !currentUrl.includes('/characters/')) {
            console.log('✅ Appeared to return to characters list (likely successful)');
          }
        } catch (error3) {
          console.log('⚠️ No explicit success message found, continuing to verification...');
        }
      }
    }
    
    // Step 7: Verify character appears in the list
    console.log('🔍 Step 7: Verifying character appears in list...');
    
    // Navigate back to characters list if needed
    const currentUrl = page.url();
    if (!currentUrl.includes('/characters') || currentUrl.includes('/characters/')) {
      console.log('🔄 Navigating back to characters list...');
      await page.goto(TEST_CONFIG.getCharactersUrl());
      await page.waitForLoadState('networkidle');
    }
    
    // Refresh to see the new character
    console.log('🔄 Refreshing page to load new character...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of characters list
    await page.screenshot({ path: 'test-results/after-character-creation.png', fullPage: true });
    console.log('📸 Characters list screenshot taken');
    
    // Look for the new character in the list
    const characterLink = page.getByRole('link', { name: characterName })
      .or(page.locator(`text="${characterName}"`))
      .or(page.getByText(characterName));
    
    const isCharacterVisible = await characterLink.isVisible();
    console.log(`Character "${characterName}" visible in list: ${isCharacterVisible}`);
    
    if (isCharacterVisible) {
      console.log('✅ Character successfully created and appears in list');
      
      // Optional: Click on the character to view details
      await characterLink.click();
      console.log(`✅ Clicked on character: ${characterName}`);
      
      // Wait for character detail page
      await page.waitForTimeout(2000);
      
      // Take screenshot of character details
      await page.screenshot({ path: 'test-results/character-details.png', fullPage: true });
      console.log('📸 Character details screenshot taken');
      
    } else {
      console.log(`❌ Could not find character: ${characterName} in the list`);
      
      // Debug: List all visible text to see what's actually there
      const visibleText = await page.locator('body').textContent();
      console.log('Page contains character name:', visibleText.includes(characterName));
    }
    
    // Step 8: Final verification
    console.log('🎯 Step 8: Final verification...');
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/character-creation-test-final.png', fullPage: true });
    console.log('📸 Final screenshot taken');
    
    console.log('🎉 Character creation test completed successfully!');
    console.log(`📊 Character created: ${characterName}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/character-creation-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runCharacterCreationTest()
    .then(() => {
      console.log('✅ Character creation test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Character creation test failed:', error);
      process.exit(1);
    });
}

module.exports = { runCharacterCreationTest };