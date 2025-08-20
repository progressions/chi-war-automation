// Debug Profile Navigation Test
// This script helps debug how to navigate to the profile page

const { chromium } = require('playwright');
const { loginAsPlayer } = require('./login-helper');

async function debugProfileNavigation() {
  console.log('🔍 Starting Profile Navigation Debug...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login as player
    console.log('🔐 Logging in as player user...');
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Checking for profile navigation options...');
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/debug-homepage.png', 
      fullPage: true 
    });
    console.log('📸 Homepage screenshot taken');
    
    // Check for user avatar/profile button in top right
    console.log('🔍 Looking for user avatar button...');
    const avatarButton = page.locator('button').filter({ hasText: /user|profile|avatar/i }).or(
      page.locator('[data-testid*="avatar"]')
    ).or(
      page.locator('[aria-label*="User"]')
    ).or(
      page.locator('button').last() // Often the last button in header
    );
    
    const avatarCount = await avatarButton.count();
    console.log(`Found ${avatarCount} potential avatar buttons`);
    
    if (avatarCount > 0) {
      console.log('🔍 Clicking user avatar button...');
      await avatarButton.first().click();
      await page.waitForTimeout(2000);
      
      await page.screenshot({ 
        path: 'test-results/debug-avatar-clicked.png', 
        fullPage: true 
      });
      console.log('📸 After avatar click screenshot taken');
      
      // Look for profile option in dropdown
      const profileOption = page.locator('text=Profile').or(
        page.locator('[href="/profile"]')
      ).or(
        page.locator(':text("profile")')
      );
      
      const profileCount = await profileOption.count();
      console.log(`Found ${profileCount} profile options`);
      
      if (profileCount > 0) {
        console.log('✅ Found profile option in avatar dropdown');
        await profileOption.first().click();
        
        await page.waitForTimeout(2000);
        await page.screenshot({ 
          path: 'test-results/debug-profile-navigation.png', 
          fullPage: true 
        });
        console.log('📸 After profile navigation screenshot taken');
        
        const currentUrl = page.url();
        console.log('Current URL after profile click:', currentUrl);
      }
    }
    
    // Try direct navigation to profile
    console.log('🔍 Trying direct navigation to /profile...');
    await page.goto('http://localhost:3001/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/debug-direct-profile.png', 
      fullPage: true 
    });
    console.log('📸 Direct profile navigation screenshot taken');
    
    const directUrl = page.url();
    console.log('URL after direct navigation:', directUrl);
    
    // Check if profile page loaded
    const hasProfileContent = await page.locator('text=Edit Profile').or(
      page.locator('text=Personal Information')
    ).or(
      page.locator('text=Account Information')
    ).count();
    
    if (hasProfileContent > 0) {
      console.log('✅ Profile page content found via direct navigation');
    } else {
      console.log('❌ No profile content found via direct navigation');
    }
    
    console.log('🎉 Profile navigation debug completed!');
    
  } catch (error) {
    console.error('❌ Profile navigation debug failed:', error);
    await page.screenshot({ 
      path: 'test-results/debug-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the debug
if (require.main === module) {
  debugProfileNavigation()
    .then(() => {
      console.log('✅ Profile navigation debug completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Profile navigation debug failed:', error);
      process.exit(1);
    });
}

module.exports = { debugProfileNavigation };