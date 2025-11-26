// Test script to sign in as David and visit encounter play URL
const { chromium } = require('playwright');

const DAVID_EMAIL = 'progressions+david@gmail.com';
const DAVID_PASSWORD = 'password123';
const ENCOUNTER_URL = 'http://localhost:3001/encounters/006aee2c-f4d4-4508-9578-092867cd7b77/play/e715836b-e78c-4c03-92a6-2ad612a7f304';

async function loginAsDavid(page) {
  console.log('🔐 Logging in as David...');

  // Navigate to login page
  await page.goto('http://localhost:3001/login');
  await page.waitForLoadState('networkidle');

  // Fill login form
  const emailField = page.locator('input').first();
  const passwordField = page.locator('input').nth(1);

  await emailField.fill(DAVID_EMAIL);
  await passwordField.fill(DAVID_PASSWORD);

  // Submit login
  await page.getByText('SIGN IN').click();

  // Wait for redirect
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    console.log('Still on login page, waiting for redirect...');
    await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
  }

  console.log('✅ Login successful');
}

async function main() {
  console.log('🎬 Starting test: Sign in as David and visit encounter');
  console.log(`📍 Target URL: ${ENCOUNTER_URL}`);

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro dimensions
    isMobile: true,
    hasTouch: true
  });

  const page = await context.newPage();

  try {
    // Login as David
    await loginAsDavid(page);

    // Navigate to encounter play URL
    console.log('🎮 Navigating to encounter play URL...');
    await page.goto(ENCOUNTER_URL);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/david-encounter-play.png',
      fullPage: true
    });
    console.log('📸 Screenshot saved: test-results/david-encounter-play.png');

    // Screenshot just the main view without opening dialog
    console.log('📸 Main view captured');

    // Keep browser open for manual inspection
    console.log('✅ Navigation complete. Browser will stay open for inspection.');
    console.log('Press Ctrl+C to close.');

    // Keep alive
    await new Promise(() => {});

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({
      path: 'test-results/david-encounter-error.png',
      fullPage: true
    });
    await browser.close();
    process.exit(1);
  }
}

main();
