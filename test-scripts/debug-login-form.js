const { chromium } = require('playwright');

async function debugLoginForm() {
  console.log('🔍 Debugging login form behavior...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 2000 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('localhost:3004') || request.url().includes('signin')) {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('localhost:3004') || response.url().includes('signin')) {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    await page.goto('http://localhost:3005/login');
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see the form
    await page.screenshot({ path: 'test-results/debug-form-initial.png', fullPage: true });
    
    // Examine the form structure
    const forms = await page.locator('form').count();
    console.log(`Found ${forms} forms on the page`);
    
    const inputs = await page.locator('input').count();
    console.log(`Found ${inputs} input elements`);
    
    const buttons = await page.locator('button').count();
    console.log(`Found ${buttons} buttons`);
    
    // Check the form attributes
    const form = page.locator('form').first();
    const formAction = await form.getAttribute('action');
    const formMethod = await form.getAttribute('method');
    console.log(`Form action: ${formAction}`);
    console.log(`Form method: ${formMethod}`);
    
    // Fill the form
    console.log('Filling login form...');
    await page.fill('input[type="text"]', 'player@example.com');
    await page.fill('input[type="password"]', 'password');
    
    await page.screenshot({ path: 'test-results/debug-form-filled.png', fullPage: true });
    
    // Find the submit button
    const submitButton = page.locator('button[type="submit"]');
    const submitButtonCount = await submitButton.count();
    console.log(`Found ${submitButtonCount} submit buttons`);
    
    if (submitButtonCount > 0) {
      const buttonText = await submitButton.first().textContent();
      console.log(`Submit button text: "${buttonText}"`);
    }
    
    // Try clicking and see what happens
    console.log('Clicking submit button...');
    await submitButton.click();
    
    // Wait and see what happens
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log(`Current URL after submit: ${currentUrl}`);
    
    await page.screenshot({ path: 'test-results/debug-form-after-submit.png', fullPage: true });
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'test-results/debug-form-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  debugLoginForm().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { debugLoginForm };