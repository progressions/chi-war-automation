// Template Carousel Navigation Test
// This script tests the template carousel "Next" button navigation

const { chromium } = require('playwright');

async function runTemplateCarouselTest() {
  console.log('🎠 Starting Template Carousel Test...');
  
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
    
    // Wait for template carousel to load
    await page.waitForTimeout(3000);
    
    // Step 3: Inspect the template carousel
    console.log('🎠 Step 3: Inspecting template carousel...');
    
    await page.screenshot({ path: 'test-results/template-carousel-initial.png', fullPage: true });
    console.log('📸 Initial carousel screenshot taken');
    
    // Look for navigation buttons
    const nextButtonSelectors = [
      'button:has-text("Next")',
      'button:has-text("→")',
      'button[aria-label="Next"]',
      'button[aria-label="next"]',
      '.MuiIconButton-root:has([data-testid="KeyboardArrowRightIcon"])',
      '.MuiIconButton-root:has([data-testid="ArrowForwardIcon"])',
      '.carousel-next',
      '.swiper-button-next',
      'button:has(.MuiSvgIcon-root)',
      '[role="button"]:has-text("Next")'
    ];
    
    let nextButton = null;
    for (const selector of nextButtonSelectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible()) {
        console.log(`✅ Found Next button with selector: ${selector}`);
        nextButton = button;
        break;
      }
    }
    
    if (!nextButton) {
      // Look for any arrow icons or navigation elements
      console.log('🔍 Looking for arrow icons or navigation elements...');
      const arrowElements = page.locator('[data-testid*="Arrow"], .MuiSvgIcon-root, button:has(svg)');
      const arrowCount = await arrowElements.count();
      console.log(`Found ${arrowCount} potential navigation elements`);
      
      for (let i = 0; i < Math.min(arrowCount, 5); i++) {
        const arrowElement = arrowElements.nth(i);
        const isVisible = await arrowElement.isVisible();
        if (isVisible) {
          console.log(`   Arrow element ${i + 1}: visible`);
          const parentButton = arrowElement.locator('xpath=ancestor::button[1]');
          if (await parentButton.isVisible()) {
            console.log(`   Found parent button for arrow ${i + 1}`);
            nextButton = parentButton;
            break;
          }
        }
      }
    }
    
    // Step 4: Test carousel navigation
    if (nextButton) {
      console.log('🎠 Step 4: Testing carousel navigation...');
      
      // Record initial state
      const initialContent = await page.textContent('body');
      const initialTemplates = ['Bandit', 'Everyday Hero', 'Killer', 'Martial Artist'];
      console.log('📝 Templates visible initially:');
      initialTemplates.forEach(template => {
        if (initialContent.includes(template)) {
          console.log(`   ✅ ${template}`);
        } else {
          console.log(`   ❌ ${template}`);
        }
      });
      
      // Click Next button and observe what happens
      console.log('👆 Clicking Next button...');
      await nextButton.click();
      
      // Wait and observe animation
      console.log('⏳ Waiting for carousel animation...');
      await page.waitForTimeout(1000);
      
      // Take screenshot during transition
      await page.screenshot({ path: 'test-results/template-carousel-during-transition.png', fullPage: true });
      console.log('📸 During transition screenshot taken');
      
      // Wait longer for animation to complete
      await page.waitForTimeout(2000);
      
      // Take screenshot after transition
      await page.screenshot({ path: 'test-results/template-carousel-after-next.png', fullPage: true });
      console.log('📸 After Next click screenshot taken');
      
      // Check what changed
      const afterContent = await page.textContent('body');
      console.log('📝 Templates visible after Next:');
      initialTemplates.forEach(template => {
        if (afterContent.includes(template)) {
          console.log(`   ✅ ${template}`);
        } else {
          console.log(`   ❌ ${template}`);
        }
      });
      
      // Check if the carousel is stuck/incomplete
      const currentUrl = page.url();
      console.log(`📍 Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/characters/create')) {
        console.log('✅ Still on character creation page - carousel navigation in progress');
        
        // Try to detect if carousel is stuck by checking for loading states or partial animations
        const loadingElements = page.locator('.loading, .MuiCircularProgress-root, [aria-busy="true"]');
        const loadingCount = await loadingElements.count();
        console.log(`🔄 Loading elements found: ${loadingCount}`);
        
        // Check if we can still interact with templates
        console.log('🔍 Testing template interaction after Next click...');
        
        // Try to click on any visible template
        const templateSelectors = [
          'h3:has-text("Bandit")',
          'h3:has-text("Everyday Hero")', 
          'h3:has-text("Killer")',
          'h3:has-text("Martial Artist")'
        ];
        
        let templateClicked = false;
        for (const selector of templateSelectors) {
          const templateElement = page.locator(selector).first();
          if (await templateElement.isVisible()) {
            console.log(`👆 Attempting to click template: ${selector}`);
            try {
              await templateElement.click();
              console.log(`✅ Successfully clicked template`);
              templateClicked = true;
              
              // Wait to see what happens
              await page.waitForTimeout(2000);
              await page.screenshot({ path: 'test-results/template-selected-after-carousel.png', fullPage: true });
              
              break;
            } catch (error) {
              console.log(`❌ Failed to click template: ${error.message}`);
            }
          }
        }
        
        if (!templateClicked) {
          console.log('❌ Could not interact with any templates after carousel navigation');
        }
      }
      
    } else {
      console.log('❌ Could not find Next button for carousel navigation');
    }
    
    console.log('🎯 Template carousel test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-results/template-carousel-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runTemplateCarouselTest()
    .then(() => {
      console.log('✅ Template carousel test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Template carousel test failed:', error);
      process.exit(1);
    });
}

module.exports = { runTemplateCarouselTest };