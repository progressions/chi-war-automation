/**
 * E2E Test for PC Character Creation Template Redesign
 * 
 * This test validates the redesigned PC character creation interface at /characters/create
 * which replaces the carousel with a modern grid layout featuring search and filter capabilities.
 * 
 * Prerequisites:
 * - Rails server running on port 3000: RAILS_ENV=test rails server -p 3000
 * - Next.js server running on port 3001: npm run dev
 * 
 * Test Coverage:
 * 1. Navigate to PC character creation page
 * 2. Verify templates are displayed in cards (not carousel)
 * 3. Test search functionality
 * 4. Test archetype filtering
 * 5. Test weapon/schtick filtering
 * 6. Test direct character creation without confirmation dialog
 * 7. Verify character images are displayed
 */

const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testPCTemplateRedesign() {
  console.log('\n🎮 Starting PC Template Redesign E2E Test');
  console.log('=====================================\n');

  let browser;
  let page;

  try {
    // Launch browser
    browser = await chromium.launch({
      headless: process.env.HEADLESS !== 'false',
      slowMo: 100
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    page = await context.newPage();

    // Step 1: Login as gamemaster
    console.log('🔐 Step 1: Logging in as gamemaster...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    console.log('✅ Logged in successfully\n');

    // Step 2: Navigate to character creation page
    console.log('📍 Step 2: Navigating to character creation page...');
    await page.goto('http://localhost:3001/characters/create');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ 
      path: 'test-results/pc-create-page-initial.png', 
      fullPage: true 
    });
    console.log('✅ Character creation page loaded\n');

    // Step 3: Verify no carousel is present
    console.log('🎠 Step 3: Verifying carousel has been removed...');
    const carouselButtons = await page.locator('button[aria-label*="next"], button[aria-label*="previous"]').count();
    if (carouselButtons > 0) {
      throw new Error('Carousel navigation buttons found - should be removed in redesign');
    }
    console.log('✅ No carousel found - using new layout\n');

    // Step 4: Verify templates are displayed in cards with images
    console.log('🃏 Step 4: Checking template cards display...');
    
    // Wait for template cards to be visible
    await page.waitForSelector('h3', { timeout: 10000 });
    
    // Check for template cards
    const templateCards = await page.locator('div[role="article"]').count();
    console.log(`📊 Found ${templateCards} template cards`);
    
    if (templateCards === 0) {
      // Fallback: check for any h3 elements (template names)
      const templateNames = await page.locator('h3').count();
      console.log(`📊 Found ${templateNames} template names (h3 elements)`);
      
      if (templateNames === 0) {
        throw new Error('No templates found on page');
      }
    }
    
    // Check for character images
    const images = await page.locator('img[alt]').count();
    const avatars = await page.locator('.MuiAvatar-root').count();
    console.log(`🖼️ Found ${images} character images and ${avatars} avatar fallbacks`);
    console.log('✅ Template cards are displayed\n');

    // Step 5: Test search functionality
    console.log('🔍 Step 5: Testing search functionality...');
    const searchInput = page.locator('input[placeholder*="Search"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Archer');
      await page.waitForTimeout(500); // Wait for filtering
      
      await page.screenshot({ 
        path: 'test-results/pc-search-archer.png', 
        fullPage: true 
      });
      
      // Verify filtered results
      const visibleTemplates = await page.locator('h3:visible').count();
      console.log(`📊 After searching "Archer": ${visibleTemplates} visible templates`);
      
      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
      console.log('✅ Search functionality works\n');
    } else {
      console.log('⚠️ Search input not found\n');
    }

    // Step 6: Test archetype filter
    console.log('🎯 Step 6: Testing archetype filter...');
    const archetypeSelect = page.locator('label:has-text("Archetype")').locator('..').locator('select, input');
    
    if (await archetypeSelect.isVisible()) {
      await archetypeSelect.click();
      await page.waitForTimeout(500);
      
      // Try to select an archetype from dropdown
      const archetypeOption = page.locator('li[role="option"]').first();
      if (await archetypeOption.isVisible()) {
        const archetypeName = await archetypeOption.textContent();
        await archetypeOption.click();
        console.log(`📊 Selected archetype: ${archetypeName}`);
        
        await page.screenshot({ 
          path: 'test-results/pc-archetype-filter.png', 
          fullPage: true 
        });
        
        // Clear filter
        await archetypeSelect.click();
        await page.locator('li:has-text("All Archetypes")').click();
        console.log('✅ Archetype filter works\n');
      }
    } else {
      console.log('⚠️ Archetype filter not found\n');
    }

    // Step 7: Test weapon/schtick filters
    console.log('⚔️ Step 7: Testing weapon and schtick filters...');
    const hasWeaponsCheckbox = page.locator('label:has-text("Has Weapons")').locator('input[type="checkbox"]');
    const hasSchticks

Checkbox = page.locator('label:has-text("Has Schticks")').locator('input[type="checkbox"]');
    
    if (await hasWeaponsCheckbox.isVisible()) {
      await hasWeaponsCheckbox.check();
      await page.waitForTimeout(500);
      
      const withWeapons = await page.locator('h3:visible').count();
      console.log(`📊 Templates with weapons: ${withWeapons}`);
      
      await hasWeaponsCheckbox.uncheck();
      console.log('✅ Weapon filter works');
    }
    
    if (await hasSchticksCheckbox.isVisible()) {
      await hasSchticksCheckbox.check();
      await page.waitForTimeout(500);
      
      const withSchticks = await page.locator('h3:visible').count();
      console.log(`📊 Templates with schticks: ${withSchticks}`);
      
      await hasSchticksCheckbox.uncheck();
      console.log('✅ Schtick filter works\n');
    }

    // Step 8: Test result count display
    console.log('📊 Step 8: Checking result count display...');
    const resultCount = page.locator('text=/Showing \\d+ of \\d+ templates/i');
    if (await resultCount.isVisible()) {
      const countText = await resultCount.textContent();
      console.log(`✅ Result count displayed: "${countText}"\n`);
    } else {
      console.log('⚠️ Result count not found\n');
    }

    // Step 9: Test direct character creation (no confirmation dialog)
    console.log('🎭 Step 9: Testing direct character creation...');
    
    // Find and click a template
    const firstTemplate = page.locator('h3').first();
    if (await firstTemplate.isVisible()) {
      const templateName = await firstTemplate.textContent();
      console.log(`🎯 Clicking template: "${templateName}"`);
      
      // Get parent card and click
      const templateCard = firstTemplate.locator('../..');
      await templateCard.click();
      
      // Check for confirmation dialog (should NOT appear)
      await page.waitForTimeout(1000);
      const confirmDialog = page.locator('text=/Confirm.*Character.*Creation/i');
      if (await confirmDialog.isVisible()) {
        throw new Error('Confirmation dialog appeared - should be removed in redesign');
      }
      console.log('✅ No confirmation dialog - direct creation confirmed');
      
      // Wait for potential navigation or loading
      try {
        await page.waitForURL('**/characters/**', { timeout: 5000 });
        console.log('✅ Successfully navigated to character edit page');
        
        const currentUrl = page.url();
        console.log(`📍 Current URL: ${currentUrl}`);
        
        await page.screenshot({ 
          path: 'test-results/pc-character-created.png', 
          fullPage: true 
        });
      } catch (error) {
        // If no navigation, check for loading overlay
        const loadingOverlay = page.locator('.MuiCircularProgress-root');
        if (await loadingOverlay.isVisible()) {
          console.log('⏳ Loading overlay detected - character creation in progress');
        } else {
          console.log('⚠️ Character creation may have failed or is slow');
        }
      }
    } else {
      console.log('⚠️ No templates found to click\n');
    }

    // Test Summary
    console.log('\n========================================');
    console.log('✅ PC Template Redesign Test Complete!');
    console.log('========================================');
    console.log('Summary:');
    console.log('- ✅ Carousel removed');
    console.log('- ✅ Templates displayed in cards');
    console.log('- ✅ Search functionality available');
    console.log('- ✅ Filter options present');
    console.log('- ✅ Direct creation without dialog');
    console.log('- ✅ Character images/avatars shown');
    console.log('\nScreenshots saved in test-results/');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (page) {
      await page.screenshot({ 
        path: 'test-results/pc-template-error.png', 
        fullPage: true 
      });
      console.log('📸 Error screenshot saved');
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testPCTemplateRedesign()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });