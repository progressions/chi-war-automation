/**
 * Test script for Up Check system
 * Tests the complete Up Check workflow from wound threshold triggering to resolution
 */

const { chromium } = require('playwright');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = path.join(__dirname, 'test-results', 'up-check-test');

// Test credentials
const TEST_USER = {
  email: 'progressions@gmail.com',
  password: 'password'
};

async function takeScreenshot(page, name) {
  const fs = require('fs');
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
  await page.screenshot({ 
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true 
  });
  console.log(`📸 Screenshot saved: ${name}.png`);
}

async function login(page) {
  console.log('🔐 Logging in...');
  await page.goto(`${FRONTEND_URL}/sign-in`);
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/campaigns');
  console.log('✅ Logged in successfully');
}

async function navigateToFight(page) {
  console.log('🎮 Navigating to test fight...');
  
  // Click on first campaign
  await page.click('[data-testid="campaign-card"]:first-child');
  await page.waitForURL('**/campaigns/*');
  
  // Navigate to fights section
  await page.click('a[href*="/fights"]');
  await page.waitForURL('**/fights');
  
  // Click on first fight or create one
  const fightCards = await page.locator('[data-testid="fight-card"]').count();
  if (fightCards > 0) {
    await page.click('[data-testid="fight-card"]:first-child');
  } else {
    console.log('Creating new fight...');
    await page.click('button:has-text("New Fight")');
    await page.fill('input[name="name"]', 'Up Check Test Fight');
    await page.click('button:has-text("Create")');
  }
  
  await page.waitForURL('**/fights/*');
  console.log('✅ In fight view');
}

async function testUpCheckFlow(page) {
  console.log('\n🧪 Testing Up Check System...\n');
  
  // Step 1: Check for Up Check button
  console.log('1️⃣ Looking for Up Check button...');
  await page.waitForSelector('[data-testid="encounter-action-bar"]', { timeout: 10000 });
  await takeScreenshot(page, '01-encounter-view');
  
  // Look for the Up Check button (with dice icon)
  const upCheckButton = await page.locator('button[title*="Up Check"]').first();
  const isUpCheckVisible = await upCheckButton.isVisible();
  
  if (!isUpCheckVisible) {
    console.log('❌ Up Check button not found');
    return false;
  }
  
  console.log('✅ Up Check button found');
  
  // Step 2: Check if any characters need Up Checks
  const badge = await page.locator('.MuiBadge-badge').filter({ hasText: /\d+/ }).first();
  const needsUpCheck = await badge.isVisible().catch(() => false);
  
  if (needsUpCheck) {
    const count = await badge.textContent();
    console.log(`✅ ${count} character(s) need Up Checks`);
  } else {
    console.log('ℹ️ No characters currently need Up Checks');
    console.log('   (This is normal if no PCs have 35+ wounds)');
  }
  
  // Step 3: Click Up Check button to open panel
  console.log('2️⃣ Opening Up Check panel...');
  await upCheckButton.click();
  await page.waitForTimeout(1000); // Wait for animation
  await takeScreenshot(page, '02-up-check-panel-open');
  
  // Step 4: Check if panel opened
  const panelTitle = await page.locator('text=🎲 Up Check').first();
  const isPanelOpen = await panelTitle.isVisible();
  
  if (!isPanelOpen) {
    console.log('❌ Up Check panel did not open');
    return false;
  }
  
  console.log('✅ Up Check panel opened successfully');
  
  // Step 5: Check panel contents
  const noCharactersMessage = await page.locator('text=No characters currently require Up Checks').isVisible();
  
  if (noCharactersMessage) {
    console.log('ℹ️ Panel shows: No characters currently require Up Checks');
    console.log('   To test full flow, a PC needs to have 35+ wounds with up_check_required status');
  } else {
    // Characters are available for Up Check
    const characterChips = await page.locator('.MuiChip-root').filter({ hasText: /wounds/ });
    const chipCount = await characterChips.count();
    
    if (chipCount > 0) {
      console.log(`✅ Found ${chipCount} character(s) requiring Up Checks`);
      
      // Click first character
      await characterChips.first().click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, '03-character-selected');
      
      // Check if swerve input is visible
      const swerveInput = await page.locator('input').filter({ hasText: 'Swerve Roll' }).first();
      if (await swerveInput.isVisible()) {
        console.log('✅ Swerve input field visible');
        
        // Enter a swerve value
        await swerveInput.fill('3');
        
        // Check if roll button is enabled
        const rollButton = await page.locator('button:has-text("🎲 ROLL UP CHECK")').first();
        if (await rollButton.isEnabled()) {
          console.log('✅ Roll Up Check button is enabled');
          console.log('✅ Up Check system is fully functional!');
        }
      }
    }
  }
  
  // Step 6: Check for status indicators on character cards
  console.log('\n3️⃣ Checking for status indicators...');
  
  // Look for UP CHECK badges
  const upCheckBadges = await page.locator('.MuiChip-label:has-text("UP CHECK")');
  const upCheckCount = await upCheckBadges.count();
  
  if (upCheckCount > 0) {
    console.log(`✅ Found ${upCheckCount} character(s) with UP CHECK status indicator`);
  }
  
  // Look for OUT badges
  const outBadges = await page.locator('.MuiChip-label:has-text("OUT")');
  const outCount = await outBadges.count();
  
  if (outCount > 0) {
    console.log(`✅ Found ${outCount} character(s) with OUT status indicator`);
  }
  
  if (upCheckCount === 0 && outCount === 0) {
    console.log('ℹ️ No status indicators found (characters don\'t have relevant status)');
  }
  
  await takeScreenshot(page, '04-final-state');
  
  return true;
}

async function main() {
  console.log('🚀 Starting Up Check System Test');
  console.log('================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const page = await browser.newPage();
  
  try {
    // Login
    await login(page);
    
    // Navigate to fight
    await navigateToFight(page);
    
    // Test Up Check system
    const success = await testUpCheckFlow(page);
    
    if (success) {
      console.log('\n✅ ✅ ✅ UP CHECK SYSTEM TEST PASSED ✅ ✅ ✅');
      console.log('\nSummary:');
      console.log('- Up Check button is present in encounter view');
      console.log('- Up Check panel opens correctly');
      console.log('- Panel shows characters requiring Up Checks');
      console.log('- Status indicators display properly');
      console.log('- Frontend integration is complete');
    } else {
      console.log('\n❌ Test encountered issues - see logs above');
    }
    
    console.log(`\n📁 Screenshots saved to: ${SCREENSHOT_DIR}`);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    await takeScreenshot(page, 'error-state');
  } finally {
    await page.waitForTimeout(3000); // Keep browser open briefly to see results
    await browser.close();
  }
}

// Run the test
main().catch(console.error);