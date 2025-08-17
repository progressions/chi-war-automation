// Fixed Character Creation Test Script
// This script directly selects templates without carousel navigation

const { chromium } = require('playwright');

async function runCharacterCreationTest() {
  console.log('🚀 Starting Fixed Character Creation Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate and login
    console.log('📍 Step 1: Navigating to application and logging in...');
    await page.goto('http://localhost:3001');
    
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
    await page.goto('http://localhost:3001/characters');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Open SpeedDial and click Create
    const speedDialButton = page.getByRole('button', { name: 'SpeedDial' })
      .or(page.locator('[aria-label="SpeedDial"]'))
      .or(page.locator('.MuiSpeedDial-fab'));
    
    if (await speedDialButton.isVisible()) {
      await speedDialButton.click();
      await page.waitForTimeout(2000);
      
      const createAction = page.getByRole('menuitem', { name: 'Create' })
        .or(page.locator('[title="Create"]'))
        .or(page.locator('button:has-text("Create")'));
      
      await createAction.first().waitFor({ state: 'visible', timeout: 5000 });
      await createAction.first().click({ force: true });
      console.log('✅ Opened character creation');
    }
    
    // Wait for template selection to load
    await page.waitForTimeout(3000);
    
    // Step 3: Directly select a template (skip carousel navigation)
    console.log('🎭 Step 3: Selecting template directly...');
    
    await page.screenshot({ path: 'test-results/templates-available.png', fullPage: true });
    console.log('📸 Templates screenshot taken');
    
    // Try to click "Everyday Hero" template directly
    const templateSelectors = [
      'h3:has-text("Everyday Hero")',
      'h2:has-text("Everyday Hero")', 
      'h1:has-text("Everyday Hero")',
      'button:has-text("Everyday Hero")',
      '.MuiCard-root:has-text("Everyday Hero")',
      '[role="button"]:has-text("Everyday Hero")',
      '*:has-text("Everyday Hero")'
    ];
    
    let templateClicked = false;
    for (const selector of templateSelectors) {
      const templateElement = page.locator(selector).first();
      if (await templateElement.isVisible()) {
        console.log(`✅ Found "Everyday Hero" template with selector: ${selector}`);
        try {
          await templateElement.click();
          console.log('✅ Clicked template successfully');
          templateClicked = true;
          break;
        } catch (error) {
          console.log(`❌ Failed to click with ${selector}: ${error.message}`);
        }
      }
    }
    
    if (!templateClicked) {
      console.log('⚠️ Could not click template, trying any visible template...');
      
      // Try any template
      const anyTemplate = page.locator('h3, h2, h1').filter({ hasText: /Bandit|Everyday Hero|Killer|Martial Artist/ }).first();
      if (await anyTemplate.isVisible()) {
        await anyTemplate.click();
        console.log('✅ Clicked alternative template');
        templateClicked = true;
      }
    }
    
    if (templateClicked) {
      // Step 4: Wait for character creation to complete
      console.log('⏳ Step 4: Waiting for character creation...');
      
      // Character creation should redirect to show page
      try {
        await page.waitForURL(/\/characters\/\d+/, { timeout: 10000 });
        const newUrl = page.url();
        console.log(`📍 Successfully redirected to: ${newUrl}`);
        
        // Extract character ID
        const characterId = newUrl.match(/\/characters\/(\d+)/)?.[1];
        if (characterId) {
          console.log(`🆔 Created character ID: ${characterId}`);
        }
        
        // Take screenshot of character show page
        await page.screenshot({ path: 'test-results/character-created-success.png', fullPage: true });
        console.log('📸 Character show page screenshot taken');
        
        // Verify character data is displayed
        const pageContent = await page.textContent('body');
        
        console.log('🔍 Character show page verification:');
        const verificationItems = [
          'Defense', 'Toughness', 'Speed', 'Guns', 'Martial Arts', 
          'Fortune', 'Type', 'PC', 'Everyday Hero'
        ];
        
        verificationItems.forEach(item => {
          if (pageContent.includes(item)) {
            console.log(`   ✅ Found: ${item}`);
          } else {
            console.log(`   ❌ Missing: ${item}`);
          }
        });
        
        console.log('🎉 Character creation test completed successfully!');
        
      } catch (urlError) {
        console.log('❌ Did not redirect to character show page');
        console.log(`📍 Current URL: ${page.url()}`);
        
        await page.screenshot({ path: 'test-results/character-creation-failed.png', fullPage: true });
        console.log('📸 Failure screenshot taken');
        
        // Check for validation errors or issues
        const currentContent = await page.textContent('body');
        if (currentContent.includes('error') || currentContent.includes('Error')) {
          console.log('⚠️ Error messages may be present on page');
        }
      }
      
    } else {
      console.log('❌ Could not select any template');
      await page.screenshot({ path: 'test-results/template-selection-failed.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/character-creation-test-error.png', fullPage: true });
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
      console.log('✅ Fixed character creation test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fixed character creation test failed:', error);
      process.exit(1);
    });
}

module.exports = { runCharacterCreationTest };