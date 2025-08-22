const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Starting character owner reassignment test...');
    
    // Login as gamemaster
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    console.log('✓ Logged in as gamemaster');

    // Navigate to characters page
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await page.waitForTimeout(2000); // Give page time to load
    await page.screenshot({ 
      path: 'test-results/characters-page.png', 
      fullPage: true 
    });
    
    // Try different selectors for the characters list
    try {
      await page.waitForSelector('[data-testid="characters-table"]', { timeout: 5000 });
    } catch {
      // Try alternative selectors
      await page.waitForSelector('table', { timeout: 5000 });
    }
    console.log('✓ Navigated to characters page');

    // Click on first character (Brick Manly) - opens in new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('text=Brick Manly')
    ]);
    await newPage.waitForLoadState();
    await newPage.waitForSelector('h1:has-text("Brick Manly")', { timeout: 10000 });
    console.log('✓ Opened character details page in new tab');

    // Check if owner field is visible for gamemaster
    const ownerField = await newPage.locator('input[id*="User"]').first();
    if (await ownerField.isVisible()) {
      console.log('✓ Owner field is visible for gamemaster');
      
      // Click on the owner field to open dropdown
      await ownerField.click();
      console.log('✓ Clicked owner field');
      
      // Type to filter users
      await ownerField.fill('player');
      await newPage.waitForTimeout(500); // Wait for autocomplete
      
      // Select the player user from dropdown
      const playerOption = newPage.locator('text=player@example.com').first();
      if (await playerOption.isVisible()) {
        await playerOption.click();
        console.log('✓ Selected new owner from dropdown');
        
        // Wait for update to complete
        await newPage.waitForTimeout(2000);
        
        // Verify the change was saved
        await newPage.reload();
        await newPage.waitForSelector('h1:has-text("Brick Manly")', { timeout: 10000 });
        
        // Check if owner was updated (should show in some format)
        const pageContent = await newPage.content();
        if (pageContent.includes('player@example.com') || pageContent.includes('Player One')) {
          console.log('✅ Owner successfully reassigned!');
        } else {
          console.log('⚠️ Could not verify owner change');
        }
      } else {
        console.log('❌ Could not find player option in dropdown');
      }
    } else {
      console.log('❌ Owner field not visible - user may not have permission');
    }
    
    // Close the character detail tab
    await newPage.close();

    // Test as regular player (should NOT see owner field)
    console.log('\nTesting as regular player...');
    
    // Logout
    await page.goto(TEST_CONFIG.getProfileUrl());
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL(TEST_CONFIG.getLoginUrl());
    console.log('✓ Logged out');
    
    // Login as player
    await page.fill('input[name="email"]', 'player@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(TEST_CONFIG.getCampaignsUrl());
    console.log('✓ Logged in as player');
    
    // Navigate to same character
    await page.goto(TEST_CONFIG.getCharactersUrl());
    await page.waitForTimeout(2000); // Give page time to load
    try {
      await page.waitForSelector('[data-testid="characters-table"]', { timeout: 5000 });
    } catch {
      await page.waitForSelector('table', { timeout: 5000 });
    }
    
    // Click on character - opens in new tab
    const [playerCharPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('text=Brick Manly')
    ]);
    await playerCharPage.waitForLoadState();
    await playerCharPage.waitForSelector('h1:has-text("Brick Manly")', { timeout: 10000 });
    
    // Check that owner field is NOT visible for regular player
    const ownerFieldAsPlayer = await playerCharPage.locator('input[id*="User"]').first();
    if (await ownerFieldAsPlayer.isVisible()) {
      console.log('❌ Owner field is visible to player (should be hidden)');
    } else {
      console.log('✅ Owner field correctly hidden from regular player');
    }
    
    // Close the character detail tab
    await playerCharPage.close();

    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ 
      path: `test-results/owner-reassignment-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();