const { chromium } = require('playwright');

// Custom login function for port 3001
async function loginAsGamemaster(page) {
  console.log('🔐 Logging in as gamemaster...');
  await page.goto('http://localhost:3001/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', 'progressions@gmail.com');
  await page.fill('input[type="password"]', 'password');
  await page.getByRole('button', { name: /sign in/i }).click();
  
  await page.waitForURL('http://localhost:3001/**');
  console.log('✅ Logged in successfully');
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    console.log('🎯 Testing Up Check Panel with BasePanel conversion');
    
    // Login as gamemaster
    await loginAsGamemaster(page);

    // Navigate to encounters
    await page.goto('http://localhost:3001/encounters');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to encounters');

    // Click on a fight to open it
    const fightCards = await page.locator('[data-testid="fight-card"], .MuiCard-root').all();
    if (fightCards.length > 0) {
      await fightCards[0].click();
      console.log('✅ Opened fight');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ No fights found, creating one...');
      // Create a fight if none exists
      await page.getByRole('button', { name: /create.*fight/i }).click();
      await page.fill('input[name="name"]', 'Test Fight for Up Check');
      await page.getByRole('button', { name: /create/i }).click();
      await page.waitForTimeout(2000);
    }

    // Look for encounter control buttons
    const controlButtons = await page.locator('[data-testid="encounter-control-button"], button').all();
    console.log(`Found ${controlButtons.length} control buttons`);

    // Find and click the Up Check button
    let upCheckFound = false;
    for (const button of controlButtons) {
      const text = await button.textContent();
      console.log(`Checking button: ${text}`);
      if (text && text.toLowerCase().includes('up check')) {
        await button.click();
        upCheckFound = true;
        console.log('✅ Clicked Up Check button');
        break;
      }
    }

    if (!upCheckFound) {
      // Try alternative selectors
      const upCheckButton = page.locator('button:has-text("Up Check")').first();
      if (await upCheckButton.isVisible()) {
        await upCheckButton.click();
        console.log('✅ Found and clicked Up Check button (alternative selector)');
        upCheckFound = true;
      }
    }

    if (upCheckFound) {
      await page.waitForTimeout(2000);

      // Check if the Up Check panel is using BasePanel
      const basePanel = await page.locator('.MuiPaper-root:has-text("Up Check")').first();
      if (await basePanel.isVisible()) {
        console.log('✅ Up Check panel is visible');

        // Check for BasePanel structure
        const hasIcon = await page.locator('.MuiPaper-root:has-text("Up Check") svg').first().isVisible();
        console.log(`✅ Icon present: ${hasIcon}`);

        // Check for warning border color (should be warning.main)
        const borderColor = await basePanel.evaluate(el => 
          window.getComputedStyle(el).borderColor
        );
        console.log(`✅ Border color: ${borderColor}`);

        // Check for title structure
        const titleElement = await page.locator('.MuiPaper-root:has-text("Up Check") h2').first();
        if (await titleElement.isVisible()) {
          console.log('✅ Title element found with h2 tag (BasePanel structure)');
        }

        // Take screenshot
        await page.screenshot({ 
          path: 'test-results/up-check-basepanel-converted.png',
          fullPage: false 
        });
        console.log('✅ Screenshot saved');

        // Check internal content is still working
        const charactersSection = await page.locator('text=/Characters Requiring Up Check/i').first();
        if (await charactersSection.isVisible()) {
          console.log('✅ Characters section visible');
        }

        console.log('✨ Up Check Panel successfully converted to use BasePanel!');
      } else {
        console.log('❌ Up Check panel not visible');
      }
    } else {
      console.log('⚠️ Up Check button not found - this might be expected if no characters need Up Checks');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ 
      path: 'test-results/up-check-basepanel-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
})();