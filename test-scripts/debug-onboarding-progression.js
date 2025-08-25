const { chromium } = require('playwright');
const { registerNewUser, confirmUserEmail, loginWithCredentials } = require('./helpers/user-registration-helper');

// Generate unique test user data
const testEmail = `debug_gm_${Date.now()}@example.com`;
const GM_DATA = {
  email: testEmail,
  password: 'TestPass123!',
  firstName: 'Debug',
  lastName: 'Master',
  role: 'gamemaster'
};

async function debugOnboardingProgression() {
  console.log('🚀 Starting Onboarding Progression Debug');
  console.log('📧 Test email:', testEmail);
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1024 }});
  const page = await context.newPage();
  
  try {
    // Step 1: Register new user
    console.log('\n👤 Step 1: Registering new user');
    const registrationResult = await registerNewUser(page, GM_DATA, { 
      takeScreenshots: true, 
      screenshotDir: 'test-results' 
    });
    
    if (!registrationResult.success) {
      throw new Error('Registration failed');
    }
    
    // Step 2: Confirm email
    console.log('\n📧 Step 2: Confirming email');
    await confirmUserEmail(GM_DATA.email);
    
    // Step 3: Login
    console.log('\n🔐 Step 3: Logging in');
    const loginResult = await loginWithCredentials(page, GM_DATA.email, GM_DATA.password, {
      takeScreenshots: true,
      screenshotDir: 'test-results'
    });
    
    if (!loginResult.success) {
      throw new Error('Login failed');
    }
    
    // Step 4: Check onboarding state after login
    console.log('\n🎯 Step 4: Analyzing onboarding state after login');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/debug-onboarding-after-login.png', fullPage: true });
    
    // Look for different CTA buttons
    const campaignCta = await page.locator('[data-testid="campaign-onboarding-cta"]').count();
    const characterCta = await page.locator('[data-testid="character-onboarding-cta"]').count();
    const activateCampaignBtn = await page.locator('button:has-text("Activate Campaign")').count();
    const characterBtn = await page.locator('button:has-text("Character"), button:has-text("character")').count();
    
    console.log('🔍 Element counts:');
    console.log('  Campaign CTA buttons:', campaignCta);
    console.log('  Character CTA buttons:', characterCta);
    console.log('  "Activate Campaign" buttons:', activateCampaignBtn);
    console.log('  Character-related buttons:', characterBtn);
    
    // Check page text content
    const bodyText = await page.textContent('body');
    console.log('\\n📄 Page contains:');
    console.log('  "Create Your First Campaign":', bodyText.includes('Create Your First Campaign'));
    console.log('  "Activate your Campaign":', bodyText.includes('Activate your Campaign'));
    console.log('  "Character":', bodyText.includes('Character'));
    console.log('  "Great! Now build your world":', bodyText.includes('Great! Now build your world'));
    
    // Try to proceed with campaign creation if we're at that stage
    if (campaignCta > 0) {
      console.log('\\n🚦 Step 5: Found campaign CTA, proceeding with campaign creation');
      await page.locator('[data-testid="campaign-onboarding-cta"]').click();
      
      // Wait for form and fill it
      await page.waitForSelector('[data-testid="campaign-form-drawer"], form', { timeout: 10000 });
      await page.fill('input[name="name"]', 'Debug Campaign');
      
      // Fill description using RichTextEditor
      const editor = await page.waitForSelector('.ProseMirror[contenteditable="true"]');
      await editor.click();
      await page.keyboard.type('A debug campaign for testing onboarding progression');
      
      // Save campaign
      await page.locator('button:has-text("Save")').click();
      await page.waitForTimeout(3000);
      
      // Take screenshot after campaign creation
      await page.screenshot({ path: 'test-results/debug-after-campaign-creation.png', fullPage: true });
      
      // Check for activation button
      const activateBtn = await page.locator('button:has-text("Activate")').count();
      console.log('  Activate buttons found after campaign creation:', activateBtn);
      
      if (activateBtn > 0) {
        console.log('\\n🚦 Step 6: Activating campaign');
        // Use the specific onboarding activate button
        const onboardingActivateBtn = await page.locator('[data-testid="activate-campaign-onboarding-cta"]').count();
        if (onboardingActivateBtn > 0) {
          await page.locator('[data-testid="activate-campaign-onboarding-cta"]').click();
        } else {
          await page.locator('button:has-text("Activate")').first().click();
        }
        await page.waitForTimeout(3000);
        
        // Take screenshot after first click
        await page.screenshot({ path: 'test-results/debug-after-onboarding-activate-click.png', fullPage: true });
        
        // Now check if we need to click the actual campaign activate button in the table
        const tableActivateBtn = await page.locator('button:has-text("ACTIVATE")').count();
        console.log('  Table ACTIVATE buttons found:', tableActivateBtn);
        
        if (tableActivateBtn > 0) {
          console.log('  Clicking table ACTIVATE button...');
          // Click the button that's NOT the onboarding CTA (i.e., the one in the campaign table)
          await page.locator('button:has-text("ACTIVATE"):not([data-testid="activate-campaign-onboarding-cta"])').click();
          await page.waitForTimeout(3000);
          
          // Take screenshot after actual activation
          await page.screenshot({ path: 'test-results/debug-after-campaign-activation.png', fullPage: true });
        }
        
        // Now check for character CTA
        const postActivationCharacterCta = await page.locator('[data-testid="character-onboarding-cta"]').count();
        console.log('  Character CTA buttons after activation:', postActivationCharacterCta);
      }
    }
    
    console.log('\\n✅ Debug completed successfully');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'test-results/debug-error.png' });
  } finally {
    await browser.close();
  }
}

debugOnboardingProgression();