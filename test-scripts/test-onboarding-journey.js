const { test, expect } = require('@playwright/test');

test('Complete user onboarding journey', async ({ page }) => {
  // Navigate to landing page
  await page.goto('http://localhost:3001');
  
  // Step 1: Click "Start Your Legendary Campaign" to go to registration
  await page.getByRole('button', { name: 'Start Your Legendary Campaign' }).first().click();
  
  // Step 2: Fill out registration form
  const timestamp = Date.now();
  await page.getByRole('textbox', { name: 'First Name' }).fill('Test');
  await page.getByRole('textbox', { name: 'Last Name' }).fill('User');
  await page.getByRole('textbox', { name: 'Email Address' }).fill(`testuser_${timestamp}@example.com`);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password123');
  await page.getByRole('textbox', { name: 'Confirm Password' }).fill('password123');
  
  // Step 3: Submit registration
  await page.getByRole('button', { name: 'Create Account' }).click();
  
  // Note: In a real test, you would need to confirm the account via email
  // For this example, we assume the account is confirmed programmatically
  
  // Step 4: Login with the new account
  await page.goto('http://localhost:3001/login');
  await page.getByRole('textbox', { name: 'Email Address' }).fill(`testuser_${timestamp}@example.com`);
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for navigation to campaigns page
  await page.waitForURL('**/campaigns**');
  
  // Step 5: Create first campaign - Click onboarding CTA
  await page.getByTestId('campaign-onboarding-cta').click();
  
  // Step 6: Fill campaign creation form
  await page.getByRole('textbox', { name: 'Name' }).fill('Epic Test Campaign');
  
  // Fill description in RichTextEditor
  const editor = await page.waitForSelector('.ProseMirror[contenteditable="true"]');
  await editor.click();
  await page.evaluate(() => {
    const editor = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (editor) {
      editor.focus();
      document.execCommand('insertText', false, 'A test campaign for epic adventures across time and space!');
    }
  });
  
  // Step 7: Save the campaign
  await page.getByRole('button', { name: 'Save' }).click();
  
  // Wait for campaign to be created
  await expect(page.locator('text=Campaign created successfully')).toBeVisible();
  
  // Step 8: Activate the campaign
  await page.getByRole('button', { name: 'Activate', exact: true }).click();
  
  // Wait for activation confirmation
  await expect(page.locator('text=Campaign "Epic Test Campaign" activated')).toBeVisible();
  
  // Step 9: Go to character creation
  await page.getByTestId('character-onboarding-cta').click();
  
  // Wait for character creation page
  await page.waitForURL('**/characters/create');
  
  // Step 10: Select character template (Bandit)
  await page.getByTestId('carousel-select-button').first().click();
  
  // Step 11: Confirm character creation
  await page.getByRole('button', { name: 'Confirm' }).click();
  
  // Wait for character to be created and redirected to character page
  await page.waitForURL(/\/characters\/[a-f0-9-]+/);
  
  // Verify character creation progress
  await expect(page.locator('text=/Progress: \\d+\\/6 milestones/')).toBeVisible();
  
  // Step 12: Continue with Party creation
  await page.getByTestId('party-onboarding-cta').click();
  
  // Wait for parties page
  await page.waitForURL('**/parties**');
  
  // Step 13: Create a party
  await page.getByTestId('party-onboarding-cta').click();
  
  // Fill party creation form
  await page.getByRole('textbox', { name: 'Name' }).fill('The Heroes of Time');
  
  // Fill description
  const partyEditor = await page.waitForSelector('.ProseMirror[contenteditable="true"]');
  await partyEditor.click();
  await page.evaluate(() => {
    const editor = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (editor) {
      editor.focus();
      document.execCommand('insertText', false, 'A brave band of heroes from different eras, united to protect the timeline!');
    }
  });
  
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('text=Party created successfully')).toBeVisible();
  
  // Step 14: Continue with Site creation
  await page.getByTestId('site-onboarding-cta').click();
  
  // Wait for sites page
  await page.waitForURL('**/sites**');
  
  // Step 15: Create a site
  await page.getByTestId('site-onboarding-cta').click();
  
  // Fill site creation form
  await page.getByRole('textbox', { name: 'Name' }).fill('Temple of Eternal Balance');
  
  // Fill description
  const siteEditor = await page.waitForSelector('.ProseMirror[contenteditable="true"]');
  await siteEditor.click();
  await page.evaluate(() => {
    const editor = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (editor) {
      editor.focus();
      document.execCommand('insertText', false, 'An ancient temple where chi flows strongest, a nexus of power between the junctures.');
    }
  });
  
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('text=Site created successfully')).toBeVisible();
  
  // Step 16: Continue with Fight creation (final step)
  await page.getByTestId('fight-onboarding-cta').click();
  
  // Wait for fights page
  await page.waitForURL('**/fights**');
  
  // Step 17: Create a fight
  await page.getByTestId('fight-onboarding-cta').click();
  
  // Fill fight creation form
  await page.getByRole('textbox', { name: 'Name' }).fill('Battle at the Temple Gates');
  
  // Fill description
  const fightEditor = await page.locator('div').filter({ hasText: /^Description$/ }).getByRole('textbox');
  await fightEditor.click();
  await page.evaluate(() => {
    const editor = document.querySelector('.ProseMirror[contenteditable="true"]');
    if (editor) {
      editor.focus();
      document.execCommand('insertText', false, 'Evil forces assault the temple! Our heroes must defend the sacred grounds.');
    }
  });
  
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.locator('text=Fight created successfully')).toBeVisible();
  
  // Step 18: Verify congratulations modal and complete onboarding
  await expect(page.locator('text=🎉 Congratulations! 🎉')).toBeVisible();
  await expect(page.locator('text=You\'ve successfully set up your world!')).toBeVisible();
  
  // Click to dismiss congratulations
  await page.getByRole('button', { name: 'Got it! Let\'s Play!' }).click();
  
  // Verify onboarding complete
  await expect(page.locator('text=Congratulations dismissed! You\'re all set to play!')).toBeVisible();
});

// Helper test for quick login with existing user
test('Login with existing user', async ({ page }) => {
  await page.goto('http://localhost:3001/login');
  await page.getByRole('textbox', { name: 'Email Address' }).fill('progressions@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  await page.waitForURL('**/campaigns**');
  await expect(page.locator('text=Campaigns')).toBeVisible();
});