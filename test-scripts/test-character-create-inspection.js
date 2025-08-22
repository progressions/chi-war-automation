// Character Create Inspection Test
// This script just clicks "Create" on characters page to see what appears

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function runCharacterCreateInspectionTest() {
  console.log('🔍 Starting Character Create Inspection Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate and login
    console.log('📍 Step 1: Navigating to application and logging in...');
    await page.goto(TEST_CONFIG.getFrontendUrl());
    
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill('progressions@gmail.com');
    await passwordField.fill('password');
    await page.getByText('SIGN IN').click();
    
    await page.waitForTimeout(3000);
    console.log('✅ Login completed');
    
    // Step 2: Navigate to characters page
    console.log('📍 Step 2: Navigating to characters page...');
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of characters page
    await page.screenshot({ path: 'test-results/characters-page-before-create.png', fullPage: true });
    console.log('📸 Characters page screenshot taken');
    
    // Step 3: Click Create button and inspect what appears
    console.log('➕ Step 3: Clicking Create and inspecting...');
    
    // Look for SpeedDial or Create button
    const speedDialButton = page.getByRole('button', { name: 'SpeedDial' })
      .or(page.locator('[aria-label="SpeedDial"]'))
      .or(page.locator('.MuiSpeedDial-fab'));
    
    const isSpeedDialVisible = await speedDialButton.isVisible();
    console.log('SpeedDial button visible:', isSpeedDialVisible);
    
    if (isSpeedDialVisible) {
      await speedDialButton.click();
      console.log('Clicked SpeedDial button');
      
      // Wait longer for SpeedDial menu to appear and stabilize
      await page.waitForTimeout(2000);
      
      // Look for Create action with more patience
      const createAction = page.getByRole('menuitem', { name: 'Create' })
        .or(page.locator('[title="Create"]'))
        .or(page.locator('button:has-text("Create")'));
      
      // Wait for the create action to be visible
      await createAction.first().waitFor({ state: 'visible', timeout: 5000 });
      await createAction.first().click({ force: true });
      console.log('Clicked create action');
    } else {
      // Try alternative create button
      console.log('Looking for alternative create button...');
      const createButton = page.getByRole('button', { name: /create/i })
        .or(page.getByText(/new character/i))
        .or(page.locator('button:has-text("Create")'));
      
      await createButton.click();
      console.log('Clicked alternative create button');
    }
    
    // Wait for something to appear
    await page.waitForTimeout(3000);
    
    // Step 4: Take screenshot and inspect what's visible
    console.log('🔍 Step 4: Inspecting what appeared...');
    await page.screenshot({ path: 'test-results/after-clicking-create.png', fullPage: true });
    console.log('📸 After clicking create screenshot taken');
    
    // Get all visible text to understand what's on the page
    const pageContent = await page.textContent('body');
    console.log('📝 Page contains the following keywords:');
    
    const keywords = ['template', 'Template', 'Bandit', 'Everyday Hero', 'Killer', 'Martial Artist', 'archetype', 'Archetype'];
    keywords.forEach(keyword => {
      if (pageContent.includes(keyword)) {
        console.log(`   ✅ Found: "${keyword}"`);
      } else {
        console.log(`   ❌ Missing: "${keyword}"`);
      }
    });
    
    // Look for any form elements
    console.log('🔍 Looking for form elements...');
    
    const inputs = await page.locator('input').count();
    const buttons = await page.locator('button').count();
    const selects = await page.locator('select').count();
    
    console.log(`   📊 Found ${inputs} input fields`);
    console.log(`   📊 Found ${buttons} buttons`);
    console.log(`   📊 Found ${selects} select dropdowns`);
    
    // List all visible buttons with their text
    console.log('🔍 Visible buttons:');
    const visibleButtons = page.locator('button:visible');
    const buttonCount = await visibleButtons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const buttonText = await visibleButtons.nth(i).textContent();
      console.log(`   🔘 Button ${i + 1}: "${buttonText?.trim()}"`);
    }
    
    // List all visible input fields with their placeholders/labels
    console.log('🔍 Visible input fields:');
    const visibleInputs = page.locator('input:visible');
    const inputCount = await visibleInputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 10); i++) {
      const placeholder = await visibleInputs.nth(i).getAttribute('placeholder');
      const name = await visibleInputs.nth(i).getAttribute('name');
      const type = await visibleInputs.nth(i).getAttribute('type');
      console.log(`   📝 Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}"`);
    }
    
    // Check for any dropdown/select options
    console.log('🔍 Looking for dropdown options...');
    const dropdownOptions = page.locator('option, li[role="option"], .MuiMenuItem-root');
    const optionCount = await dropdownOptions.count();
    
    if (optionCount > 0) {
      console.log(`   📋 Found ${optionCount} dropdown options:`);
      for (let i = 0; i < Math.min(optionCount, 10); i++) {
        const optionText = await dropdownOptions.nth(i).textContent();
        console.log(`   📋 Option ${i + 1}: "${optionText?.trim()}"`);
      }
    } else {
      console.log('   📋 No dropdown options found');
    }
    
    // Check for any dialog or modal titles
    console.log('🔍 Looking for dialog/modal titles...');
    const dialogTitles = page.locator('h1, h2, h3, .MuiDialogTitle-root, [role="dialog"] h1, [role="dialog"] h2');
    const titleCount = await dialogTitles.count();
    
    if (titleCount > 0) {
      for (let i = 0; i < titleCount; i++) {
        const titleText = await dialogTitles.nth(i).textContent();
        console.log(`   🏷️ Title: "${titleText?.trim()}"`);
      }
    } else {
      console.log('   🏷️ No dialog titles found');
    }
    
    // Step 5: Select the second template (Everyday Hero)
    console.log('🎭 Step 5: Selecting the "Everyday Hero" template...');
    
    // Look for the Everyday Hero template - try multiple selectors
    const templateSelectors = [
      'h1:has-text("Everyday Hero")',
      'h2:has-text("Everyday Hero")', 
      'h3:has-text("Everyday Hero")',
      'button:has-text("Everyday Hero")',
      '.template-card:has-text("Everyday Hero")',
      '[data-testid*="template"]:has-text("Everyday Hero")',
      'li:has-text("Everyday Hero")',
      '.MuiListItem-root:has-text("Everyday Hero")',
      '.MuiCard-root:has-text("Everyday Hero")',
      '[role="button"]:has-text("Everyday Hero")'
    ];
    
    let templateSelected = false;
    for (const selector of templateSelectors) {
      const templateOption = page.locator(selector).first();
      if (await templateOption.isVisible()) {
        console.log(`✅ Found "Everyday Hero" template with selector: ${selector}`);
        await templateOption.click();
        console.log('✅ Clicked on "Everyday Hero" template');
        templateSelected = true;
        break;
      }
    }
    
    if (!templateSelected) {
      console.log('❌ Could not find clickable "Everyday Hero" template');
      // Try clicking any element containing the text
      const anyElementWithText = page.locator('*:has-text("Everyday Hero")').first();
      if (await anyElementWithText.isVisible()) {
        console.log('🔄 Trying to click any element containing "Everyday Hero"...');
        await anyElementWithText.click();
        templateSelected = true;
      }
    }
    
    if (templateSelected) {
      // Wait for any changes after template selection
      await page.waitForTimeout(2000);
      
      // Step 6: Inspect what happens after template selection
      console.log('🔍 Step 6: Inspecting after template selection...');
      
      await page.screenshot({ path: 'test-results/after-template-selection.png', fullPage: true });
      console.log('📸 After template selection screenshot taken');
      
      // Check what's now visible
      const newPageContent = await page.textContent('body');
      
      console.log('📝 After template selection, page contains:');
      const postSelectionKeywords = ['name', 'Name', 'save', 'Save', 'create', 'Create', 'cancel', 'Cancel', 'form', 'Form'];
      postSelectionKeywords.forEach(keyword => {
        if (newPageContent.includes(keyword)) {
          console.log(`   ✅ Found: "${keyword}"`);
        } else {
          console.log(`   ❌ Missing: "${keyword}"`);
        }
      });
      
      // Check for new form elements
      const newInputs = await page.locator('input:visible').count();
      const newButtons = await page.locator('button:visible').count();
      
      console.log(`📊 After template selection: ${newInputs} visible inputs, ${newButtons} visible buttons`);
      
      // List visible input fields again
      console.log('🔍 Input fields after template selection:');
      const visibleInputsAfter = page.locator('input:visible');
      const inputCountAfter = await visibleInputsAfter.count();
      
      for (let i = 0; i < Math.min(inputCountAfter, 5); i++) {
        const placeholder = await visibleInputsAfter.nth(i).getAttribute('placeholder');
        const name = await visibleInputsAfter.nth(i).getAttribute('name');
        const type = await visibleInputsAfter.nth(i).getAttribute('type');
        const value = await visibleInputsAfter.nth(i).inputValue();
        console.log(`   📝 Input ${i + 1}: type="${type}", name="${name}", placeholder="${placeholder}", value="${value}"`);
      }
      
      // Look for any pre-filled data from the template
      console.log('🔍 Checking for pre-filled template data...');
      if (newPageContent.includes('Everyday Hero')) {
        console.log('   ✅ Template name "Everyday Hero" appears in form');
      }
      
      // Check for action values or other template-specific content
      const templateSpecificContent = ['Defense', 'Toughness', 'Speed', 'Guns', 'Martial Arts'];
      templateSpecificContent.forEach(content => {
        if (newPageContent.includes(content)) {
          console.log(`   ✅ Found template content: "${content}"`);
        }
      });
      
      // Step 7: Complete character creation and verify navigation to show page
      console.log('💾 Step 7: Completing character creation...');
      
      // Wait a bit more to ensure everything is loaded
      await page.waitForTimeout(1000);
      
      // The template selection should have created the character automatically
      // Check if we're now on a character show page
      const currentUrl = page.url();
      console.log(`📍 Current URL after template selection: ${currentUrl}`);
      
      if (currentUrl.includes('/characters/') && !currentUrl.includes('/characters/new') && !currentUrl.includes('/characters/create')) {
        console.log('✅ Successfully navigated to character show page!');
        
        // Take screenshot of the character show page
        await page.screenshot({ path: 'test-results/character-show-page.png', fullPage: true });
        console.log('📸 Character show page screenshot taken');
        
        // Extract character ID from URL
        const characterId = currentUrl.split('/characters/')[1];
        console.log(`🆔 Character ID: ${characterId}`);
        
        // Verify the character name appears on the page
        const showPageContent = await page.textContent('body');
        if (showPageContent.includes('Everyday Hero')) {
          console.log('✅ Character name "Everyday Hero" appears on show page');
        } else {
          console.log('❌ Character name not found on show page');
        }
        
        // Look for character details that should be displayed
        const characterDetails = ['Defense', 'Toughness', 'Speed', 'Guns', 'Martial Arts', 'Fortune', 'Type', 'PC'];
        console.log('🔍 Character details visible on show page:');
        characterDetails.forEach(detail => {
          if (showPageContent.includes(detail)) {
            console.log(`   ✅ Found: "${detail}"`);
          } else {
            console.log(`   ❌ Missing: "${detail}"`);
          }
        });
        
        // Check for edit button or other character management options
        const editButton = page.locator('button:has-text("Edit")').or(page.locator('a:has-text("Edit")'));
        const hasEditButton = await editButton.isVisible();
        console.log(`🔧 Edit button visible: ${hasEditButton}`);
        
      } else {
        console.log('❌ Did not navigate to character show page');
        console.log('🔍 Looking for what happened instead...');
        
        // Check if we're still on the creation flow
        if (currentUrl.includes('/characters/new') || currentUrl.includes('/characters/create') || (currentUrl.includes('/characters') && !currentUrl.includes('/characters/'))) {
          console.log('⚠️ Still on character creation/list page');
          
          // Look for a submit/create button to complete the process
          const submitSelectors = [
            'button[type="submit"]',
            'button:has-text("Create")',
            'button:has-text("Save")',
            'button:has-text("Submit")',
            'button:has-text("Confirm")',
            '.MuiButton-root:has-text("Create")',
            '.MuiButton-root:has-text("Save")'
          ];
          
          let submitClicked = false;
          for (const selector of submitSelectors) {
            const submitButton = page.locator(selector).first();
            if (await submitButton.isVisible()) {
              console.log(`🔄 Found submit button with selector: ${selector}`);
              await submitButton.click();
              console.log('✅ Clicked submit button');
              submitClicked = true;
              
              // Wait for navigation - character creation should redirect
              try {
                await page.waitForURL(/\/characters\/\d+/, { timeout: 10000 });
                const newUrl = page.url();
                console.log(`📍 URL after submit: ${newUrl}`);
                console.log('✅ Successfully navigated to character show page after submit!');
                await page.screenshot({ path: 'test-results/character-show-page-after-submit.png', fullPage: true });
                
                // Extract and display character ID
                const characterId = newUrl.match(/\/characters\/(\d+)/)?.[1];
                if (characterId) {
                  console.log(`🆔 Created character ID: ${characterId}`);
                }
                
                // Verify character details on show page
                const showPageContent = await page.textContent('body');
                if (showPageContent.includes('Everyday Hero')) {
                  console.log('✅ Character name "Everyday Hero" appears on show page');
                } else {
                  console.log('❌ Character name not found on show page');
                }
                
              } catch (waitError) {
                console.log('⚠️ Navigation timeout - checking current page...');
                const newUrl = page.url();
                console.log(`📍 URL after submit: ${newUrl}`);
                
                // Check if we're still on creation page or somewhere else
                if (newUrl.includes('/characters/create')) {
                  console.log('❌ Still on creation page after submit - character creation may have failed');
                } else {
                  console.log('✅ Navigated somewhere after submit');
                }
                
                await page.screenshot({ path: 'test-results/after-submit-no-redirect.png', fullPage: true });
              }
              break;
            }
          }
          
          if (!submitClicked) {
            console.log('❌ Could not find submit button to complete creation');
            await page.screenshot({ path: 'test-results/stuck-in-creation-flow.png', fullPage: true });
          }
        }
      }
    }
    
    console.log('🎯 Complete character creation test finished!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/character-create-inspection-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runCharacterCreateInspectionTest()
    .then(() => {
      console.log('✅ Character create inspection test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Character create inspection test failed:', error);
      process.exit(1);
    });
}

module.exports = { runCharacterCreateInspectionTest };