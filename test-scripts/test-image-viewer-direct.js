const { chromium } = require('@playwright/test');
const { loginAsGamemaster } = require('./login-helper');

(async () => {
  console.log('Starting direct image viewer test...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate and login
    await page.goto('http://localhost:3005');
    console.log('✓ Navigated to test app');
    
    await loginAsGamemaster(page, { takeScreenshot: true, screenshotPath: 'test-results' });
    console.log('✓ Logged in as gamemaster');

    // Navigate directly to the character with the test image
    const characterId = '167dda5a-0aa1-49bd-8cac-e23464eda609';
    await page.goto(`http://localhost:3005/characters/${characterId}`);
    await page.waitForLoadState('networkidle');
    console.log('✓ Navigated to character detail page');

    // Wait for the image to load
    await page.waitForTimeout(2000);

    // Look for the character image
    const characterImage = await page.locator('img[src*="placeholder"]').first();
    if (await characterImage.count() > 0) {
      console.log('✓ Found character image');
      
      // Take a screenshot before clicking
      await page.screenshot({ path: 'test-results/before-click.png' });
      
      // Click on the image to open the viewer
      await characterImage.click();
      console.log('✓ Clicked on character image');

      // Wait for the modal to appear
      try {
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        console.log('✅ Image viewer modal opened successfully!');
        
        // Take a screenshot of the open modal
        await page.screenshot({ path: 'test-results/modal-open.png' });

        // Test display mode toggle
        const originalSizeBtn = await page.locator('button:has-text("Original Size")');
        if (await originalSizeBtn.count() > 0) {
          await originalSizeBtn.click();
          console.log('✅ Toggled to Original Size mode');
          await page.waitForTimeout(500);
          
          const fitScreenBtn = await page.locator('button:has-text("Fit to Screen")');
          if (await fitScreenBtn.count() > 0) {
            await fitScreenBtn.click();
            console.log('✅ Toggled back to Fit to Screen mode');
          }
        }

        // Test ESC key
        await page.keyboard.press('Escape');
        await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 3000 });
        console.log('✅ Modal closed with ESC key');

        // Reopen and test close button
        await characterImage.click();
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
        const closeBtn = await page.locator('[aria-label="Close image viewer"]');
        if (await closeBtn.count() > 0) {
          await closeBtn.click();
          await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 3000 });
          console.log('✅ Modal closed with close button');
        }

        // Reopen and test backdrop click
        await characterImage.click();
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
        await page.mouse.click(50, 50);
        await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 3000 });
        console.log('✅ Modal closed with backdrop click');

        console.log('\n🎉 All image viewer tests passed successfully!');
        
      } catch (modalError) {
        console.log('Modal did not open - checking if image is clickable...');
        const cursor = await characterImage.evaluate(el => 
          window.getComputedStyle(el).cursor
        );
        console.log(`Image cursor style: ${cursor}`);
        
        // Check if the image is inside a positionable container
        const parent = await characterImage.evaluateHandle(el => el.parentElement);
        const parentTag = await parent.evaluate(el => el.tagName);
        console.log(`Image parent tag: ${parentTag}`);
      }
      
    } else {
      console.log('Image not found - checking page structure...');
      const allImages = await page.locator('img').all();
      console.log(`Total images on page: ${allImages.length}`);
      
      for (const img of allImages) {
        const src = await img.getAttribute('src');
        console.log(`  Image src: ${src}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'test-results/error-state.png' });
  } finally {
    await browser.close();
    console.log('\nTest completed');
  }
})();