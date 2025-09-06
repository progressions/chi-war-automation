/**
 * Test script for verifying shot expenditure in combat actions
 */

const { chromium } = require('playwright');

// Configuration
const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:3001';

async function testShotExpenditure() {
  console.log('🎯 Testing Shot Expenditure in Combat Actions');
  console.log('============================================\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 
  });
  
  const page = await browser.newPage();
  
  // Enable console logging from the page
  page.on('console', msg => {
    if (msg.text().includes('[Apply Damage]') || 
        msg.text().includes('[createAttackerUpdate]') ||
        msg.text().includes('character updates:')) {
      console.log('📋 Browser Console:', msg.text());
    }
  });
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('apply_combat_action')) {
      console.log('\n📤 Combat Action Request:');
      console.log('  URL:', request.url());
      console.log('  Method:', request.method());
      const postData = request.postData();
      if (postData) {
        try {
          const data = JSON.parse(postData);
          console.log('  Payload:', JSON.stringify(data, null, 2));
          
          // Check if character_updates array is present
          if (data.character_updates && Array.isArray(data.character_updates)) {
            console.log('  ✅ character_updates array found with', data.character_updates.length, 'updates');
            
            // Check for shot updates
            data.character_updates.forEach((update, index) => {
              if (update.shot !== undefined) {
                console.log(`  ✅ Update ${index} contains shot value: ${update.shot}`);
              }
              if (update.shot_id) {
                console.log(`  ✅ Update ${index} has shot_id: ${update.shot_id}`);
              }
              if (update.character_id) {
                console.log(`  ✅ Update ${index} has character_id: ${update.character_id}`);
              }
            });
          } else {
            console.log('  ❌ No character_updates array found!');
          }
        } catch (e) {
          console.log('  Could not parse payload:', postData);
        }
      }
    }
  });
  
  // Monitor responses
  page.on('response', response => {
    if (response.url().includes('apply_combat_action')) {
      console.log('\n📥 Combat Action Response:');
      console.log('  Status:', response.status());
      if (response.status() !== 200) {
        response.text().then(text => {
          console.log('  Response:', text);
        });
      } else {
        console.log('  ✅ Success!');
      }
    }
  });
  
  try {
    console.log('1️⃣ Logging in...');
    await page.goto(`${FRONTEND_URL}/sign-in`);
    await page.fill('input[name="email"]', 'progressions@gmail.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/campaigns');
    
    console.log('2️⃣ Navigating to fight...');
    await page.click('[data-testid="campaign-card"]:first-child');
    await page.waitForURL('**/campaigns/*');
    await page.click('a[href*="/fights"]');
    await page.waitForURL('**/fights');
    
    // Open first fight
    const fightCard = await page.locator('[data-testid="fight-card"]').first();
    if (await fightCard.isVisible()) {
      await fightCard.click();
      await page.waitForURL('**/fights/*');
    } else {
      console.log('❌ No fights available');
      await browser.close();
      return;
    }
    
    console.log('3️⃣ Selecting an attacker...');
    // Wait for character selector to load
    await page.waitForSelector('.MuiChip-label', { timeout: 10000 });
    
    // Click on first character to select as attacker
    const firstCharacter = await page.locator('.MuiChip-label').first();
    if (await firstCharacter.isVisible()) {
      const attackerName = await firstCharacter.textContent();
      console.log('   Selected attacker:', attackerName);
      await firstCharacter.click();
      await page.waitForTimeout(500);
    }
    
    console.log('4️⃣ Opening attack panel...');
    // Click attack button
    const attackButton = await page.locator('button[title*="Attack"]').first();
    if (await attackButton.isVisible()) {
      await attackButton.click();
      await page.waitForTimeout(1000);
      console.log('   Attack panel opened');
    }
    
    console.log('5️⃣ Selecting a target...');
    // Select first available target in the attack panel
    const targetChips = await page.locator('[data-testid="target-chip"]').all();
    if (targetChips.length > 0) {
      const targetName = await targetChips[0].textContent();
      console.log('   Selected target:', targetName);
      await targetChips[0].click();
      await page.waitForTimeout(500);
    }
    
    console.log('6️⃣ Entering attack values...');
    // Enter swerve value
    const swerveInput = await page.locator('input[type="number"]').filter({ hasText: 'Swerve' }).first();
    if (await swerveInput.isVisible()) {
      await swerveInput.fill('5');
      console.log('   Entered swerve: 5');
    }
    
    console.log('7️⃣ Applying the attack...');
    console.log('   (Watch the network tab for the request payload)\n');
    
    // Click apply damage button
    const applyButton = await page.locator('button').filter({ hasText: /APPLY|DAMAGE/i }).first();
    if (await applyButton.isVisible()) {
      await applyButton.click();
      await page.waitForTimeout(2000); // Wait for request to complete
    }
    
    console.log('\n✅ Test complete - check the logs above for shot expenditure data');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await page.waitForTimeout(5000); // Keep browser open to see results
    await browser.close();
  }
}

// Run the test
testShotExpenditure().catch(console.error);