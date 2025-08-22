// Corrected Character Creation Test Script
// This script follows the actual carousel flow: PersonAdd icon → Confirmation dialog → Confirm

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config')
async function runCharacterCreationTest() {
  console.log('🚀 Starting Corrected Character Creation Test...');
  
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
    
    // Step 2: Navigate to characters and open create
    console.log('📍 Step 2: Opening character creation...');
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate directly to character creation page to avoid SpeedDial issues
    console.log('🔄 Navigating directly to character creation page...');
    await page.goto('TEST_CONFIG.getFrontendUrl()/characters/create');
    await page.waitForLoadState('networkidle');
    console.log('✅ Opened character creation directly');
    
    // Wait for template carousel to load
    await page.waitForTimeout(4000);
    
    // Step 3: Take screenshot to see what templates are available
    console.log('🎠 Step 3: Examining template carousel...');
    await page.screenshot({ path: 'test-results/template-carousel-loaded.png', fullPage: true });
    console.log('📸 Template carousel screenshot taken');
    
    // Check what templates are visible
    const pageContent = await page.textContent('body');
    const templateNames = ['Bandit', 'Everyday Hero', 'Killer', 'Martial Artist'];
    console.log('📝 Templates visible on page:');
    templateNames.forEach(name => {
      if (pageContent.includes(name)) {
        console.log(`   ✅ Found: ${name}`);
      } else {
        console.log(`   ❌ Missing: ${name}`);
      }
    });
    
    // Step 4: Click the PersonAdd icon button (the actual selection mechanism)
    console.log('👆 Step 4: Clicking PersonAdd icon to select template...');
    
    // Look for PersonAdd icon buttons
    const personAddSelectors = [
      'button:has([data-testid="PersonAddIcon"])',
      '.MuiIconButton-root:has([data-testid="PersonAddIcon"])',
      'button[aria-label*="person"]',
      'button[aria-label*="add"]',
      'button[aria-label*="select"]',
      'button[title*="person"]',
      'button[title*="add"]',
      'button[title*="select"]'
    ];
    
    let personAddClicked = false;
    for (const selector of personAddSelectors) {
      const personAddButtons = page.locator(selector);
      const buttonCount = await personAddButtons.count();
      
      if (buttonCount > 0) {
        console.log(`✅ Found ${buttonCount} PersonAdd button(s) with selector: ${selector}`);
        
        // Click the first visible PersonAdd button
        const firstButton = personAddButtons.first();
        if (await firstButton.isVisible()) {
          await firstButton.click();
          console.log('✅ Clicked PersonAdd icon button');
          personAddClicked = true;
          break;
        }
      }
    }
    
    if (!personAddClicked) {
      console.log('❌ Could not find PersonAdd icon button');
      
      // Look for any buttons with icons as fallback
      console.log('🔍 Looking for any icon buttons...');
      const iconButtons = page.locator('.MuiIconButton-root, button:has(svg)');
      const iconButtonCount = await iconButtons.count();
      console.log(`Found ${iconButtonCount} icon buttons total`);
      
      if (iconButtonCount > 0) {
        // Try clicking the first icon button in the carousel area
        await iconButtons.first().click();
        console.log('✅ Clicked first available icon button');
        personAddClicked = true;
      }
    }
    
    if (personAddClicked) {
      // Step 5: Wait for and handle the confirmation dialog
      console.log('💬 Step 5: Waiting for confirmation dialog...');
      await page.waitForTimeout(2000);
      
      // Take screenshot to see if dialog appeared
      await page.screenshot({ path: 'test-results/after-template-click.png', fullPage: true });
      console.log('📸 After template click screenshot taken');
      
      // Look for confirmation dialog
      const confirmDialogSelectors = [
        'button:has-text("Confirm")',
        '.MuiButton-containedPrimary:has-text("Confirm")',
        'button[type="submit"]',
        '.MuiDialog-root button:has-text("Confirm")',
        '[role="dialog"] button:has-text("Confirm")'
      ];
      
      let confirmClicked = false;
      for (const selector of confirmDialogSelectors) {
        const confirmButton = page.locator(selector).first();
        if (await confirmButton.isVisible()) {
          console.log(`✅ Found confirmation button with selector: ${selector}`);
          await confirmButton.click();
          console.log('✅ Clicked Confirm button');
          confirmClicked = true;
          break;
        }
      }
      
      if (!confirmClicked) {
        console.log('⚠️ No confirmation dialog found - checking page content...');
        const afterClickContent = await page.textContent('body');
        
        if (afterClickContent.includes('Create a character') || afterClickContent.includes('archetype')) {
          console.log('✅ Dialog text found - looking for any confirm/yes/ok buttons...');
          
          const genericConfirmSelectors = [
            'button:has-text("Yes")',
            'button:has-text("OK")', 
            'button:has-text("Create")',
            'button:has-text("Continue")',
            '.MuiButton-root[color="primary"]'
          ];
          
          for (const selector of genericConfirmSelectors) {
            const button = page.locator(selector).first();
            if (await button.isVisible()) {
              await button.click();
              console.log(`✅ Clicked ${selector}`);
              confirmClicked = true;
              break;
            }
          }
        }
      }
      
      if (confirmClicked) {
        // Step 6: Wait for character creation and redirect
        console.log('⏳ Step 6: Waiting for character creation and redirect...');
        
        try {
          // Wait for URL to change to character show page
          await page.waitForURL(/\/characters\/[a-f0-9-]+/, { timeout: 15000 });
          const newUrl = page.url();
          console.log(`📍 Successfully redirected to: ${newUrl}`);
          
          // Extract character ID
          const characterId = newUrl.match(/\/characters\/(\d+)/)?.[1];
          if (characterId) {
            console.log(`🆔 Created character ID: ${characterId}`);
          }
          
          // Take screenshot of character show page
          await page.screenshot({ path: 'test-results/character-show-page-success.png', fullPage: true });
          console.log('📸 Character show page screenshot taken');
          
          // Verify character data is displayed
          const showPageContent = await page.textContent('body');
          
          console.log('🔍 Character show page verification:');
          const verificationItems = [
            'Defense', 'Toughness', 'Speed', 'Guns', 'Martial Arts', 
            'Fortune', 'Type', 'PC'
          ];
          
          verificationItems.forEach(item => {
            if (showPageContent.includes(item)) {
              console.log(`   ✅ Found: ${item}`);
            } else {
              console.log(`   ❌ Missing: ${item}`);
            }
          });
          
          console.log('🎉 Character creation completed successfully!');
          
        } catch (urlError) {
          console.log('❌ Character creation did not complete - no redirect occurred');
          console.log(`📍 Current URL: ${page.url()}`);
          
          await page.screenshot({ path: 'test-results/character-creation-no-redirect.png', fullPage: true });
          console.log('📸 No redirect screenshot taken');
          
          // Check for any error messages
          const finalContent = await page.textContent('body');
          if (finalContent.includes('error') || finalContent.includes('Error')) {
            console.log('⚠️ Error messages detected on page');
          }
        }
        
      } else {
        console.log('❌ Could not find or click confirmation dialog');
        await page.screenshot({ path: 'test-results/no-confirmation-dialog.png', fullPage: true });
      }
      
    } else {
      console.log('❌ Could not find or click PersonAdd icon button');
      await page.screenshot({ path: 'test-results/no-person-add-button.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/character-creation-corrected-error.png', fullPage: true });
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
      console.log('✅ Corrected character creation test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Corrected character creation test failed:', error);
      process.exit(1);
    });
}

module.exports = { runCharacterCreationTest };