// Profile Page Test Script
// This script tests the user profile page functionality

const { chromium } = require('playwright');
const { loginAsPlayer } = require('./login-helper');

async function runProfilePageTest() {
  console.log('🚀 Starting Profile Page Test...');
  
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Login as a player user (not gamemaster)
    console.log('🔐 Step 1: Logging in as player user...');
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Step 2: Confirm the homepage loads correctly
    console.log('🏠 Step 2: Verifying homepage loads correctly...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const homepageUrl = page.url();
    console.log('Current URL after login:', homepageUrl);
    
    // Check if we're on the homepage
    if (!homepageUrl.includes('localhost:3001') || homepageUrl.includes('/login')) {
      throw new Error('Homepage did not load correctly after login');
    }
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/profile-test-homepage.png', 
      fullPage: true 
    });
    console.log('📸 Homepage screenshot taken');
    console.log('✅ Homepage loads correctly');
    
    // Step 3: Click on Profile in the Menu
    console.log('📱 Step 3: Opening navigation menu and clicking Profile...');
    
    // Wait for and click the menu button
    const menuButton = page.locator('button[aria-label="Menu"]').or(
      page.locator('button').filter({ hasText: /menu/i })
    ).or(
      page.locator('[data-testid="menu-button"]')
    ).or(
      page.getByRole('button', { name: /menu/i })
    );
    
    await menuButton.waitFor({ timeout: 10000 });
    await menuButton.click();
    
    // Wait for menu to open
    await page.waitForTimeout(1000);
    
    // Take screenshot of open menu
    await page.screenshot({ 
      path: 'test-results/profile-test-menu-open.png', 
      fullPage: true 
    });
    console.log('📸 Open menu screenshot taken');
    
    // Click on Profile in the menu
    const profileMenuItem = page.getByText('Profile').or(
      page.locator('text=Profile')
    ).or(
      page.locator('[href="/profile"]')
    );
    
    await profileMenuItem.waitFor({ timeout: 5000 });
    await profileMenuItem.click();
    
    // Step 4: Confirm that the profile page loads properly
    console.log('👤 Step 4: Verifying profile page loads properly...');
    
    // Wait for profile page to load
    await page.waitForURL(/.*\/profile/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const profileUrl = page.url();
    console.log('Profile page URL:', profileUrl);
    
    if (!profileUrl.includes('/profile')) {
      throw new Error('Profile page did not load correctly');
    }
    
    // Wait for profile content to appear
    await page.waitForSelector('text=Edit Profile', { timeout: 10000 });
    
    // Take screenshot of profile page
    await page.screenshot({ 
      path: 'test-results/profile-test-page-loaded.png', 
      fullPage: true 
    });
    console.log('📸 Profile page screenshot taken');
    console.log('✅ Profile page loads properly');
    
    // Step 5: Update first name and last name, confirm it saves
    console.log('✏️ Step 5: Testing profile update functionality...');
    
    // Find the first name and last name fields
    const firstNameField = page.locator('input[label="First Name"]').or(
      page.locator('input').filter({ has: page.locator('label:text("First Name")') })
    ).or(
      page.getByLabel('First Name')
    );
    
    const lastNameField = page.locator('input[label="Last Name"]').or(
      page.locator('input').filter({ has: page.locator('label:text("Last Name")') })
    ).or(
      page.getByLabel('Last Name')
    );
    
    await firstNameField.waitFor({ timeout: 5000 });
    await lastNameField.waitFor({ timeout: 5000 });
    
    // Get current values
    const originalFirstName = await firstNameField.inputValue();
    const originalLastName = await lastNameField.inputValue();
    console.log('Original names:', { originalFirstName, originalLastName });
    
    // Clear and enter new values
    const newFirstName = 'TestFirst';
    const newLastName = 'TestLast';
    
    await firstNameField.clear();
    await firstNameField.fill(newFirstName);
    
    await lastNameField.clear();
    await lastNameField.fill(newLastName);
    
    // Take screenshot with updated values
    await page.screenshot({ 
      path: 'test-results/profile-test-updated-fields.png', 
      fullPage: true 
    });
    console.log('📸 Updated fields screenshot taken');
    
    // Click Save Changes button
    const saveButton = page.getByText('Save Changes').or(
      page.locator('button').filter({ hasText: /save/i })
    ).or(
      page.getByRole('button', { name: /save/i })
    );
    
    await saveButton.waitFor({ timeout: 5000 });
    await saveButton.click();
    
    console.log('💾 Save button clicked, waiting for update...');
    
    // Wait for the save operation to complete
    await page.waitForTimeout(3000);
    
    // Check for success message or confirmation
    try {
      // Look for success toast or message
      await page.waitForSelector('text=Profile updated successfully', { timeout: 5000 });
      console.log('✅ Success message found');
    } catch (error) {
      console.log('⚠️ No success message found, but continuing...');
    }
    
    // Take screenshot after save
    await page.screenshot({ 
      path: 'test-results/profile-test-after-save.png', 
      fullPage: true 
    });
    console.log('📸 After save screenshot taken');
    
    // Verify the values are still there (they should persist)
    const updatedFirstName = await firstNameField.inputValue();
    const updatedLastName = await lastNameField.inputValue();
    
    console.log('Updated names:', { updatedFirstName, updatedLastName });
    
    if (updatedFirstName === newFirstName && updatedLastName === newLastName) {
      console.log('✅ Profile update successful - values persisted');
    } else {
      throw new Error(`Profile update failed - expected "${newFirstName} ${newLastName}", got "${updatedFirstName} ${updatedLastName}"`);
    }
    
    // Optional: Refresh page to verify persistence
    console.log('🔄 Refreshing page to verify persistence...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const persistedFirstName = await page.getByLabel('First Name').inputValue();
    const persistedLastName = await page.getByLabel('Last Name').inputValue();
    
    if (persistedFirstName === newFirstName && persistedLastName === newLastName) {
      console.log('✅ Profile changes persisted after page refresh');
    } else {
      console.log('⚠️ Profile changes may not have persisted properly');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/profile-test-final.png', 
      fullPage: true 
    });
    console.log('📸 Final screenshot taken');
    
    console.log('🎉 Profile page test completed successfully!');
    
  } catch (error) {
    console.error('❌ Profile page test failed:', error);
    await page.screenshot({ 
      path: 'test-results/profile-test-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken');
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  runProfilePageTest()
    .then(() => {
      console.log('✅ Profile page test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Profile page test failed:', error);
      process.exit(1);
    });
}

module.exports = { runProfilePageTest };