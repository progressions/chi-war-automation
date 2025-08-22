// Debug Profile Page Console Logs
const { chromium } = require('playwright');
const { loginAsPlayer } = require('./login-helper');
const TEST_CONFIG = require('./test-config')
async function debugProfilePage() {
  console.log('🚀 Starting Profile Page Debug...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log('🖥️ Browser Console:', msg.type(), msg.text());
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('api') || request.url().includes('users')) {
      console.log('📡 Request:', request.method(), request.url());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('api') || response.url().includes('users')) {
      console.log('📡 Response:', response.status(), response.url());
    }
  });
  
  try {
    // Login
    console.log('🔐 Logging in...');
    await loginAsPlayer(page, { takeScreenshot: false });
    
    // Navigate to profile
    console.log('👤 Navigating to profile...');
    await page.goto(TEST_CONFIG.getProfileUrl());
    await page.waitForLoadState('networkidle');
    
    // Wait for profile content
    await page.waitForSelector('text=Personal Information', { timeout: 10000 });
    console.log('✅ Profile page loaded');
    
    // Try to edit first name
    console.log('✏️ Testing first name edit...');
    const firstNameField = page.getByLabel('First Name');
    await firstNameField.clear();
    await firstNameField.fill('TestFirst');
    
    // Wait and see what happens
    console.log('⏱️ Waiting to see network activity...');
    await page.waitForTimeout(5000);
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'test-results/debug-profile-console.png', 
      fullPage: true 
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    await page.screenshot({ 
      path: 'test-results/debug-profile-error.png', 
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

debugProfilePage().catch(console.error);