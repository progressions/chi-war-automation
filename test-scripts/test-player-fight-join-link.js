const { chromium } = require('playwright');

// Use development ports since we're running on dev servers
const BASE_URL = 'http://localhost:3001';
const DAVID_EMAIL = 'progressions+david@gmail.com';
const DAVID_PASSWORD = 'password123';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    console.log('Step 2: Login as David');
    // Wait for login form
    await page.waitForSelector('text=Login to Chi War', { timeout: 10000 });
    
    // Fill login form using same approach as login-helper
    const emailField = page.locator('input').first();
    const passwordField = page.locator('input').nth(1);
    
    await emailField.fill(DAVID_EMAIL);
    await passwordField.fill(DAVID_PASSWORD);
    
    // Submit login
    await page.getByText('SIGN IN').click();
    
    // Wait for successful login and redirect
    await page.waitForTimeout(3000);
    
    // Check if we've been redirected away from login page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Still on login page, waiting for redirect...');
      await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 10000 });
    }
    console.log('Login successful, current URL:', page.url());

    console.log('Step 3: Wait for dashboard to load');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Step 4: Check for Active Fight Banner');
    // Look for the banner with "A Fight" text
    const banner = await page.locator('text=A Fight').first();
    if (await banner.isVisible()) {
      console.log('Active Fight Banner found');
    } else {
      await page.screenshot({ path: 'test-results/no-banner-found.png' });
      throw new Error('Active Fight Banner not found');
    }

    console.log('Step 5: Check for "Play as Agent 47" link');
    // Now using link (a tag styled as button) instead of button
    const playAsLink = await page.locator('a:has-text("Play as Agent 47")');
    
    // Wait a moment for the component to fully render
    await page.waitForTimeout(1000);
    
    if (await playAsLink.isVisible({ timeout: 5000 })) {
      console.log('SUCCESS: "Play as Agent 47" link is visible!');
      
      // Verify it has target="_blank"
      const target = await playAsLink.getAttribute('target');
      if (target === '_blank') {
        console.log('SUCCESS: Link has target="_blank"');
      } else {
        console.log('WARNING: Link target is:', target);
      }
      
      // Verify the href is correct
      const href = await playAsLink.getAttribute('href');
      console.log('Link href:', href);
      if (href && href.includes('/encounters/') && href.includes('/play/')) {
        console.log('SUCCESS: Link href format is correct');
      }
      
      // Take a screenshot showing the styled link
      await page.screenshot({ path: 'test-results/player-fight-join-link-success.png' });
      console.log('Screenshot saved to test-results/player-fight-join-link-success.png');
      
      // Check that the "Join Fight" or "Manage Fight" link is also present
      const manageFightLink = await page.locator('a:has-text("Manage Fight")');
      if (await manageFightLink.isVisible({ timeout: 2000 })) {
        console.log('SUCCESS: "Manage Fight" link is also visible');
        const manageTarget = await manageFightLink.getAttribute('target');
        console.log('Manage Fight link target:', manageTarget);
      }
    } else {
      // Take a screenshot to see what's on the page
      await page.screenshot({ path: 'test-results/player-fight-join-link-failed.png' });
      console.log('Screenshot saved to test-results/player-fight-join-link-failed.png');
      
      // Debug: check what links are visible in the banner area
      const links = await page.locator('a').all();
      console.log('Found links:');
      for (const link of links.slice(0, 10)) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text && text.trim()) {
          console.log('  -', text.trim(), '->', href);
        }
      }
      
      throw new Error('"Play as Agent 47" link not found');
    }

    console.log('\n=== TEST PASSED ===');
  } catch (error) {
    console.error('Test failed:', error.message);
    await page.screenshot({ path: 'test-results/player-fight-join-link-error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
}

test();
