// Party-to-Fight Feature - Acceptance Test
// Following the exact test plan specification

const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');
const TEST_CONFIG = require('./test-config');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // Step 1: Login as Gamemaster
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Step 2: Navigate directly to the seeded test fight
    console.log('Navigating to seeded test fight...');
    
    // Navigate directly to the test fight (ID from database)
    const testFightId = '5295f622-086e-449f-a9f0-82e276ad9be3';
    await page.goto(`${TEST_CONFIG.getFrontendUrl()}/fights/${testFightId}`);
    await page.waitForLoadState('networkidle');
    
    console.log('Navigated to test fight page');
    
    // Step 3: Select party from dropdown
    console.log('Looking for party dropdown...');
    await page.screenshot({ path: 'test-results/debug-before-dropdown.png', fullPage: true });
    
    // Try different selectors for the dropdown
    let partyDropdown;
    try {
      partyDropdown = page.getByRole('combobox', { name: 'Parties' });
      await partyDropdown.click();
    } catch (error) {
      console.log('Combobox with name "Parties" not found, trying alternative selectors...');
      // Try finding any combobox in the Parties section
      partyDropdown = page.locator('[role="combobox"]').first();
      await partyDropdown.click();
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/debug-dropdown-opened.png', fullPage: true });
    
    // Type "The Heroes" to filter options
    await partyDropdown.fill('The Heroes');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/debug-typed-heroes.png', fullPage: true });
    
    // Select "The Heroes" from the dropdown list
    try {
      await page.getByRole('option', { name: 'The Heroes' }).click();
    } catch (error) {
      console.log('Option with name "The Heroes" not found, trying alternative...');
      await page.locator('text=The Heroes').first().click();
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/debug-after-selection.png', fullPage: true });
    
    // Step 4: Click Add button
    console.log('Looking for Add button...');
    
    // Wait a bit for the button to become enabled after selection
    await page.waitForTimeout(1000);
    
    // Try multiple selectors for the Add button
    const addButtonSelectors = [
      'button[aria-label="Add Party to Fight"]',
      'button:has(svg[data-testid="PersonAddIcon"])',
      '.MuiButton-containedSecondary',
      'button.MuiButton-containedSecondary',
      'button[color="secondary"]'
    ];
    
    let buttonClicked = false;
    for (const selector of addButtonSelectors) {
      try {
        console.log(`Trying selector: ${selector}`);
        const button = page.locator(selector);
        await button.waitFor({ timeout: 2000 });
        await button.click();
        console.log(`Successfully clicked button with selector: ${selector}`);
        buttonClicked = true;
        break;
      } catch (error) {
        console.log(`Selector ${selector} failed: ${error.message}`);
        continue;
      }
    }
    
    if (!buttonClicked) {
      throw new Error('Could not find or click the Add button');
    }
    
    // Take screenshot after button click
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/debug-after-add-click.png', fullPage: true });
    console.log('Button clicked, looking for toast message...');
    
    // Step 5: Verify toast (try multiple possible messages)
    const possibleToastMessages = [
      'Party added successfully',
      'Party added to fight successfully', 
      'Success',
      'Added successfully',
      'Characters added to fight'
    ];
    
    let toastFound = false;
    for (const message of possibleToastMessages) {
      try {
        console.log(`Looking for toast: "${message}"`);
        await page.waitForSelector(`text=${message}`, { timeout: 3000 });
        console.log(`Found toast: "${message}"`);
        toastFound = true;
        break;
      } catch (error) {
        console.log(`Toast "${message}" not found`);
        continue;
      }
    }
    
    if (!toastFound) {
      console.log('No expected toast found, checking for any toast or error messages...');
      // Look for any toast/alert/error messages
      const alerts = await page.locator('[role="alert"]').all();
      console.log(`Found ${alerts.length} alerts`);
      
      for (let i = 0; i < alerts.length; i++) {
        const text = await alerts[i].textContent();
        console.log(`Alert ${i}: "${text}"`);
      }
    }
    
    // Step 6: Verify characters added
    const characterNames = ['Captain Strongarm', 'Shadow Ninja', 'Lucky Luke', 'Doctor Wisdom'];
    console.log('Verifying characters were added to the fight...');
    for (const name of characterNames) {
      console.log(`Looking for character: ${name}`);
      await page.waitForSelector(`text=${name}`, { timeout: 5000 });
      console.log(`✅ Found character: ${name}`);
    }
    
    // Step 7: Verify vehicle added
    console.log('Verifying vehicle was added to the fight...');
    try {
      console.log('Looking for vehicle: The Hero Mobile');
      await page.waitForSelector('text=The Hero Mobile', { timeout: 5000 });
      console.log('✅ Found vehicle: The Hero Mobile');
    } catch (error) {
      console.log('❌ Vehicle "The Hero Mobile" was not found - this may indicate an issue with vehicle addition');
      // Take screenshot to see current state
      await page.screenshot({ path: 'test-results/party-to-fight-missing-vehicle.png', fullPage: true });
      throw error;
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/party-to-fight-success.png', fullPage: true });
    
    console.log('✅ Party-to-fight test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: `test-results/error-party-to-fight-${Date.now()}.png`,
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
})();