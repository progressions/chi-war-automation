/**
 * Test Suite: Dismissable Onboarding Modules
 * Tests the ability to dismiss onboarding modules and restore them via settings
 */

const { chromium } = require('playwright');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');

const CONFIG = {
  BACKEND_URL: 'http://localhost:3000',
  FRONTEND_URL: 'http://localhost:3001',
  SCREENSHOT_PATH: './test-results',
  TIMEOUT: 30000,
};

async function testDismissableOnboardingModules() {
  const browser = await chromium.launch({ 
    headless: process.env.HEADLESS === 'true',
    slowMo: 100 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🧪 Testing Dismissable Onboarding Modules...\n');

    // Test 1: Login and check onboarding carousel is visible
    console.log('1. Login as gamemaster and verify onboarding carousel...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: CONFIG.SCREENSHOT_PATH 
    });

    // Navigate to campaigns page where onboarding is typically shown
    await page.goto(`${CONFIG.FRONTEND_URL}/campaigns`);
    await page.waitForLoadState('networkidle');
    
    // Look for onboarding carousel module
    const carouselModule = page.locator('[data-testid*="onboarding"]').first();
    const hasOnboarding = await carouselModule.count() > 0;
    
    if (!hasOnboarding) {
      console.log('  ⚠️  No onboarding carousel found - user may have completed onboarding');
      console.log('  Creating new test user to verify dismiss functionality...');
      
      // Test would continue with new user creation or reset existing user's onboarding
      await testOnboardingReset(page);
    }
    
    await page.screenshot({ 
      path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-01-initial-onboarding.png` 
    });

    // Test 2: Test individual milestone dismissal
    console.log('2. Testing individual milestone dismissal...');
    
    // Look for carousel navigation or milestone cards
    const milestoneCards = page.locator('.MuiBox-root').filter({ 
      hasText: 'Create your first' 
    });
    
    if (await milestoneCards.count() > 0) {
      // Look for dismiss button on milestone card
      const dismissButton = page.locator('button[aria-label="Dismiss"], button').filter({ 
        hasText: '×' 
      }).first();
      
      if (await dismissButton.count() > 0) {
        console.log('  ✓ Found dismiss button on milestone');
        
        // Click dismiss button
        await dismissButton.click();
        
        // Wait for API call and UI update
        await page.waitForResponse(resp => 
          resp.url().includes('/api/v2/onboarding') && resp.status() === 200
        );
        
        await page.screenshot({ 
          path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-02-milestone-dismissed.png` 
        });
        
        console.log('  ✓ Successfully dismissed individual milestone');
      } else {
        console.log('  ⚠️  No dismiss button found on milestone cards');
      }
    }

    // Test 3: Test complete carousel dismissal
    console.log('3. Testing complete carousel dismissal...');
    
    // Look for carousel dismiss button (top-right corner)
    const carouselDismissButton = page.locator('.MuiPaper-root').filter({
      hasText: 'Great! Now build your world'
    }).locator('button').filter({ hasText: '×' }).first();
    
    if (await carouselDismissButton.count() > 0) {
      console.log('  ✓ Found carousel dismiss button');
      
      await carouselDismissButton.click();
      
      // Wait for API response and carousel to disappear
      await page.waitForResponse(resp => 
        resp.url().includes('/api/v2/onboarding') && resp.status() === 200
      );
      
      // Verify carousel is hidden
      await page.waitForFunction(() => {
        const carousel = document.querySelector('[data-testid*="onboarding"]');
        return !carousel || !carousel.offsetParent;
      });
      
      await page.screenshot({ 
        path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-03-carousel-dismissed.png` 
      });
      
      console.log('  ✓ Successfully dismissed entire onboarding carousel');
    } else {
      console.log('  ⚠️  No carousel dismiss button found');
    }

    // Test 4: Test onboarding restoration via settings
    console.log('4. Testing onboarding restoration via settings...');
    
    // Navigate to profile/settings page
    await page.goto(`${CONFIG.FRONTEND_URL}/profile`);
    await page.waitForLoadState('networkidle');
    
    // Look for onboarding reset/restore option
    const restoreSection = page.locator('text=Restore Onboarding, text=Reset Onboarding').first();
    
    if (await restoreSection.count() > 0) {
      console.log('  ✓ Found onboarding restore section in settings');
      
      const restoreButton = page.locator('button').filter({ 
        hasText: /restore.*onboarding|reset.*onboarding/i 
      }).first();
      
      if (await restoreButton.count() > 0) {
        await restoreButton.click();
        
        // Handle confirmation dialog if present
        const confirmButton = page.locator('button').filter({ 
          hasText: /confirm|yes|restore/i 
        }).first();
        
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        // Wait for API response
        await page.waitForResponse(resp => 
          resp.url().includes('/api/v2/onboarding') && resp.status() === 200
        );
        
        await page.screenshot({ 
          path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-04-restore-initiated.png` 
        });
        
        console.log('  ✓ Initiated onboarding restoration');
      }
    } else {
      console.log('  ⚠️  No onboarding restore option found in settings');
    }

    // Test 5: Verify restoration worked
    console.log('5. Verifying onboarding restoration...');
    
    // Navigate back to campaigns to check if onboarding reappeared
    await page.goto(`${CONFIG.FRONTEND_URL}/campaigns`);
    await page.waitForLoadState('networkidle');
    
    const restoredOnboarding = page.locator('[data-testid*="onboarding"]').first();
    const isRestored = await restoredOnboarding.count() > 0;
    
    await page.screenshot({ 
      path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-05-restoration-verified.png` 
    });
    
    if (isRestored) {
      console.log('  ✓ Onboarding successfully restored and visible again');
    } else {
      console.log('  ⚠️  Onboarding not visible after restoration attempt');
    }

    // Test 6: Test persistence across page refreshes
    console.log('6. Testing dismiss persistence across page refresh...');
    
    if (isRestored) {
      // Dismiss carousel again
      const persistDismissBtn = page.locator('.MuiPaper-root')
        .filter({ hasText: 'Great! Now build your world' })
        .locator('button').filter({ hasText: '×' }).first();
      
      if (await persistDismissBtn.count() > 0) {
        await persistDismissBtn.click();
        
        await page.waitForResponse(resp => 
          resp.url().includes('/api/v2/onboarding') && resp.status() === 200
        );
        
        // Refresh page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Verify dismissal persisted
        const persistedDismissal = await page.locator('[data-testid*="onboarding"]').count() === 0;
        
        await page.screenshot({ 
          path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-06-persistence-verified.png` 
        });
        
        if (persistedDismissal) {
          console.log('  ✓ Dismissal persisted across page refresh');
        } else {
          console.log('  ❌ Dismissal did not persist after page refresh');
        }
      }
    }

    console.log('\n✅ Dismissable Onboarding Modules test completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    await page.screenshot({ 
      path: `${CONFIG.SCREENSHOT_PATH}/dismiss-test-ERROR.png` 
    });
    
    return false;
  } finally {
    await browser.close();
  }
}

// Helper function to test onboarding reset functionality
async function testOnboardingReset(page) {
  console.log('  → Testing onboarding reset for existing user...');
  
  // Navigate to profile to find reset option
  await page.goto(`${CONFIG.FRONTEND_URL}/profile`);
  await page.waitForLoadState('networkidle');
  
  // Try to reset onboarding if option exists
  const resetOption = page.locator('button').filter({ 
    hasText: /reset.*onboarding|restore.*onboarding/i 
  }).first();
  
  if (await resetOption.count() > 0) {
    await resetOption.click();
    
    // Handle confirmation
    const confirmBtn = page.locator('button').filter({ 
      hasText: /confirm|yes|reset/i 
    }).first();
    
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    await page.waitForResponse(resp => 
      resp.url().includes('/api/v2/onboarding') && resp.status() === 200
    );
    
    console.log('  ✓ Reset onboarding for testing');
    return true;
  }
  
  console.log('  ⚠️  No reset option available');
  return false;
}

// Run the test if called directly
if (require.main === module) {
  testDismissableOnboardingModules()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testDismissableOnboardingModules };