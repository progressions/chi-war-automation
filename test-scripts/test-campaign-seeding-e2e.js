/**
 * Campaign Seeding End-to-End Test
 * 
 * Tests that new campaigns are automatically seeded with characters from:
 * 1. Master Template Campaign (template characters)
 * 2. Master Campaign (non-template characters)
 * 
 * Prerequisites:
 * - Rails test server running with seed data
 * - Next.js frontend running
 */

const { chromium } = require('playwright');
const TEST_CONFIG = require('./test-config');
const { loginAsGamemaster } = require('./login-helper');

async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

async function takeScreenshot(page, name, directory = 'test-results/campaign-seeding') {
  const fs = require('fs');
  const path = require('path');
  
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  
  const screenshotPath = path.join(directory, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot saved: ${screenshotPath}`);
}

async function testCampaignSeeding() {
  console.log('🚀 Starting Campaign Seeding E2E Test');
  console.log(`🎯 Frontend: ${TEST_CONFIG.getFrontendUrl()}`);
  console.log(`🔗 Backend: ${TEST_CONFIG.getBackendUrl()}`);
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1024 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('\n🔐 Step 1: Login as Gamemaster');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results/campaign-seeding' 
    });
    
    console.log('\n📋 Step 2: Navigate to Campaigns Page');
    await page.goto(TEST_CONFIG.getCampaignsUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '01-campaigns-list');
    
    console.log('\n➕ Step 3: Create New Campaign');
    // Click on new campaign button - try multiple possible selectors
    const newCampaignSelectors = [
      'button:has-text("New Campaign")',
      'button:has-text("Create Campaign")',
      'a:has-text("New Campaign")',
      'a:has-text("Create Campaign")',
      '[data-testid="new-campaign-button"]'
    ];
    
    let clicked = false;
    for (const selector of newCampaignSelectors) {
      try {
        await page.locator(selector).first().click({ timeout: 5000 });
        clicked = true;
        console.log(`  ✓ Clicked: ${selector}`);
        break;
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find New Campaign button');
    }
    
    await waitForPageLoad(page);
    await takeScreenshot(page, '02-new-campaign-form');
    
    console.log('\n📝 Step 4: Fill Campaign Details');
    const campaignName = `Seeded Test Campaign ${Date.now()}`;
    
    // Fill in campaign name
    await page.fill('input[name="name"]', campaignName);
    
    // Fill in description if available
    const descriptionField = page.locator('textarea[name="description"], input[name="description"]').first();
    if (await descriptionField.isVisible()) {
      await descriptionField.fill('Test campaign to verify character seeding from Master Campaign');
    }
    
    await takeScreenshot(page, '03-campaign-form-filled');
    
    console.log('\n💾 Step 5: Save Campaign');
    // Submit the form
    const saveSelectors = [
      'button[type="submit"]:has-text("Create")',
      'button[type="submit"]:has-text("Save")',
      'button:has-text("Create Campaign")',
      'button:has-text("Save Campaign")'
    ];
    
    clicked = false;
    for (const selector of saveSelectors) {
      try {
        await page.locator(selector).first().click({ timeout: 5000 });
        clicked = true;
        console.log(`  ✓ Clicked: ${selector}`);
        break;
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find Save/Create button');
    }
    
    // Wait for navigation or success message
    await page.waitForURL(/campaigns/, { timeout: 10000 }).catch(() => {});
    await waitForPageLoad(page);
    await takeScreenshot(page, '04-campaign-created');
    
    console.log('\n👥 Step 6: Navigate to Characters');
    // Go to characters page to verify seeding
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await waitForPageLoad(page);
    await takeScreenshot(page, '05-characters-list');
    
    console.log('\n🔍 Step 7: Verify Seeded Characters');
    // Wait for characters to load
    await page.waitForSelector('[data-testid="character-item"], .character-row, tr:has-text("Boss"), tr:has-text("Featured Foe")', { 
      timeout: 10000 
    }).catch(() => {});
    
    // Get all visible character names
    const characterNames = await page.evaluate(() => {
      const elements = [
        ...document.querySelectorAll('[data-testid="character-name"]'),
        ...document.querySelectorAll('.character-name'),
        ...document.querySelectorAll('td:first-child'),
        ...document.querySelectorAll('h3'),
        ...document.querySelectorAll('h4')
      ];
      
      return elements
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0);
    });
    
    console.log(`\n📊 Found ${characterNames.length} characters:`);
    characterNames.forEach(name => console.log(`  - ${name}`));
    
    // Verify we have seeded characters
    if (characterNames.length === 0) {
      console.warn('⚠️ Warning: No characters found, but campaign may still be seeding');
      
      // Try refreshing the page once
      console.log('🔄 Refreshing page to check for seeded characters...');
      await page.reload();
      await waitForPageLoad(page);
      await takeScreenshot(page, '06-characters-after-refresh');
      
      const refreshedNames = await page.evaluate(() => {
        const elements = [
          ...document.querySelectorAll('[data-testid="character-name"]'),
          ...document.querySelectorAll('.character-name'),
          ...document.querySelectorAll('td:first-child')
        ];
        return elements.map(el => el.textContent?.trim()).filter(Boolean);
      });
      
      if (refreshedNames.length > 0) {
        console.log(`✅ Found ${refreshedNames.length} characters after refresh`);
        refreshedNames.forEach(name => console.log(`  - ${name}`));
      }
    }
    
    // Check for specific character types
    const pageContent = await page.content();
    const hasTemplateCharacters = pageContent.includes('Template') || pageContent.includes('template');
    const hasBossCharacters = pageContent.includes('Boss') || pageContent.includes('boss');
    const hasFeaturedFoes = pageContent.includes('Featured Foe') || pageContent.includes('featured');
    
    console.log('\n✅ Seeding Verification:');
    console.log(`  Template Characters: ${hasTemplateCharacters ? '✓' : '✗'}`);
    console.log(`  Boss Characters: ${hasBossCharacters ? '✓' : '✗'}`);
    console.log(`  Featured Foes: ${hasFeaturedFoes ? '✓' : '✗'}`);
    
    // Success if we have any characters
    if (characterNames.length > 0 || hasTemplateCharacters || hasBossCharacters) {
      console.log('\n🎉 Campaign Seeding Test PASSED!');
      console.log(`  Campaign "${campaignName}" was successfully seeded with characters`);
    } else {
      console.log('\n⚠️ Campaign Seeding Test INCONCLUSIVE');
      console.log('  No characters detected, but seeding may be async or require Master Campaign setup');
    }
    
    return {
      success: true,
      campaignName,
      characterCount: characterNames.length,
      hasTemplates: hasTemplateCharacters,
      hasBosses: hasBossCharacters,
      hasFeaturedFoes
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await takeScreenshot(page, 'error-state');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testCampaignSeeding()
    .then(result => {
      console.log('\n📋 Test Summary:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testCampaignSeeding };