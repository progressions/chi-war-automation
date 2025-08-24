/**
 * Test Character Creation Navigation from Onboarding Module
 * 
 * This test validates that the "Go to Characters" button in the onboarding module
 * correctly navigates to /characters/create when clicked.
 * 
 * Prerequisites:
 * - User with an active campaign
 * - User has not created any characters yet
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { loginAsGamemaster } = require('./login-helper');

const SCREENSHOTS_DIR = path.join(__dirname, 'test-results', 'character-navigation');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function testCharacterCreationNavigation() {
  console.log('🚀 Starting Character Creation Navigation Test\n');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login as gamemaster
    console.log('📝 Step 1: Login as gamemaster with existing campaign');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: SCREENSHOTS_DIR,
      screenshotPrefix: `${TIMESTAMP}_01_login`
    });
    console.log('✅ Login successful\n');
    
    // Step 2: Navigate to characters page
    console.log('📝 Step 2: Navigate to characters page');
    await page.goto('http://localhost:3005/characters');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_02_characters_page.png`),
      fullPage: true 
    });
    console.log('✅ On characters page\n');
    
    // Step 3: Look for onboarding module with character creation prompt
    console.log('📝 Step 3: Check for onboarding module');
    
    // Wait for onboarding module to appear
    const onboardingModule = await page.waitForSelector('[class*="MuiPaper-root"]:has-text("Create your first Character")', {
      timeout: 10000
    }).catch(() => null);
    
    if (!onboardingModule) {
      console.log('⚠️  No onboarding module found - user may already have characters');
      console.log('   Checking if user has existing characters...');
      
      const hasCharacters = await page.locator('[role="row"], .MuiDataGrid-row').count() > 0;
      if (hasCharacters) {
        console.log('   User already has characters - test not applicable');
        return { success: false, reason: 'User already has characters' };
      }
      
      throw new Error('Onboarding module not found despite no characters existing');
    }
    
    console.log('✅ Onboarding module found\n');
    
    // Step 4: Find and click the "Create Character" or "Go to Characters" button
    console.log('📝 Step 4: Find character creation button in onboarding');
    
    // Look for the button that should navigate to character creation
    const buttonSelectors = [
      'button:has-text("Create Character")',
      'button:has-text("Go to Characters")',
      '.MuiButton-root:has-text("Create Character")',
      '.MuiButton-root:has-text("Go to Characters")'
    ];
    
    let createButton = null;
    let buttonText = '';
    
    for (const selector of buttonSelectors) {
      createButton = await page.locator(selector).first();
      if (await createButton.count() > 0) {
        buttonText = await createButton.textContent();
        console.log(`✅ Found button: "${buttonText}"`);
        break;
      }
    }
    
    if (!createButton || await createButton.count() === 0) {
      throw new Error('Character creation button not found in onboarding module');
    }
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_03_before_click.png`),
      fullPage: true 
    });
    
    // Step 5: Click the button and verify navigation
    console.log('\n📝 Step 5: Click button and verify navigation to /characters/create');
    
    await createButton.click();
    
    // Wait for navigation
    await page.waitForURL('**/characters/create', { timeout: 10000 });
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_04_after_navigation.png`),
      fullPage: true 
    });
    
    // Verify we're on the character creation page
    if (!currentUrl.includes('/characters/create')) {
      throw new Error(`Navigation failed - expected /characters/create but got ${currentUrl}`);
    }
    
    // Verify character creation form is present
    const characterForm = await page.waitForSelector('form', { timeout: 5000 }).catch(() => null);
    if (!characterForm) {
      throw new Error('Character creation form not found on /characters/create');
    }
    
    console.log('✅ Successfully navigated to character creation page\n');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, `${TIMESTAMP}_error.png`),
      fullPage: true 
    }).catch(() => {});
    
    throw error;
    
  } finally {
    await browser.close();
  }
}

// Run the test
testCharacterCreationNavigation()
  .then(result => {
    if (result.success) {
      console.log('✅ OVERALL RESULT: PASSED');
      console.log('The character creation navigation from onboarding works correctly!');
    } else {
      console.log(`⚠️  Test skipped: ${result.reason}`);
    }
    process.exit(0);
  })
  .catch(error => {
    console.log('\n❌ OVERALL RESULT: FAILED');
    console.log(`Error: ${error.message}`);
    console.log(`\n📸 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    process.exit(1);
  });