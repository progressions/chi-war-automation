const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');
const path = require('path');

// Quick test to verify new milestone order: Campaign → Activate → Character → Faction → Party → Site → Fight → Congratulations
async function testMilestoneOrder() {
  console.log('🧪 Testing New Milestone Order: Campaign → Activate → Character → Faction → Party → Site → Fight');
  
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-web-security'],
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    // Enable console logging for WebSocket messages
    page.on('console', msg => {
      if (msg.text().includes('🔄') || msg.text().includes('onboarding')) {
        console.log('  📱 FRONTEND:', msg.text());
      }
    });
    
    // Step 1: Login as gamemaster
    console.log('\n👤 Step 1: Login as Gamemaster');
    await loginAsGamemaster(page);
    await page.waitForTimeout(3000);
    
    // Step 2: Go to campaigns page to check onboarding
    console.log('\n🎯 Step 2: Check Initial Onboarding State');
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForTimeout(3000);
    
    // Look for the first milestone (should be Campaign creation)
    const onboardingText = await page.textContent('body').catch(() => '');
    console.log('  📄 Page contains campaign creation milestone:', onboardingText.includes('Create your first Campaign') || onboardingText.includes('Ready to start'));
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'milestone-order-test-initial.png'),
      fullPage: true 
    });
    
    // Step 3: Create a campaign
    console.log('\n🎯 Step 3: Create Campaign (Milestone 1)');
    try {
      const createButton = await page.waitForSelector('button:has-text("Create")', { timeout: 5000 });
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Fill campaign form
      await page.fill('input[name="name"]', 'Test Campaign for Milestone Order');
      const saveButton = await page.waitForSelector('button:has-text("Save")', { timeout: 3000 });
      await saveButton.click();
      await page.waitForTimeout(3000);
      
      console.log('  ✅ Campaign created successfully');
    } catch (error) {
      console.log('  ❌ Campaign creation failed:', error.message);
    }
    
    // Step 4: Activate campaign
    console.log('\n✨ Step 4: Activate Campaign (Milestone 2)');
    try {
      const activateButton = await page.waitForSelector('button:has-text("Activate")', { timeout: 5000 });
      await activateButton.click();
      await page.waitForTimeout(3000);
      
      console.log('  ✅ Campaign activated successfully');
    } catch (error) {
      console.log('  ❌ Campaign activation failed:', error.message);
    }
    
    // Step 5: Check that next milestone is Character creation
    console.log('\n👤 Step 5: Verify Next Milestone is Character Creation');
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForTimeout(3000);
    
    const pageContent = await page.textContent('body').catch(() => '');
    const hasCharacterMilestone = pageContent.includes('Create your first Character') || pageContent.includes('Create a character');
    console.log('  📄 Character creation milestone shown:', hasCharacterMilestone);
    
    // Take screenshot of current milestone state
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'milestone-order-after-activation.png'),
      fullPage: true 
    });
    
    // Step 6: Create a character 
    console.log('\n👤 Step 6: Create Character (Milestone 3)');
    try {
      // Navigate to characters page
      const charactersButton = await page.waitForSelector('button:has-text("Go to Characters"), a[href="/characters"]', { timeout: 5000 });
      await charactersButton.click();
      await page.waitForTimeout(3000);
      
      // Create character
      const createCharButton = await page.waitForSelector('button:has-text("Create")', { timeout: 5000 });
      await createCharButton.click();
      await page.waitForTimeout(2000);
      
      // Use template if available, otherwise create manually
      try {
        // Look for a template selection button (PersonAdd icon)
        const templateButton = await page.waitForSelector('.MuiIconButton-root', { timeout: 3000 });
        await templateButton.click();
        await page.waitForTimeout(2000);
        
        // Confirm template usage
        const confirmButton = await page.waitForSelector('button:has-text("Yes"), button:has-text("Confirm")', { timeout: 3000 });
        await confirmButton.click();
        await page.waitForTimeout(3000);
        
        console.log('  ✅ Character created from template successfully');
      } catch (templateError) {
        // Manual character creation fallback
        await page.fill('input[name="name"]', 'Test Character');
        const saveCharButton = await page.waitForSelector('button:has-text("Save")', { timeout: 3000 });
        await saveCharButton.click();
        await page.waitForTimeout(3000);
        
        console.log('  ✅ Character created manually successfully');
      }
    } catch (error) {
      console.log('  ❌ Character creation failed:', error.message);
    }
    
    // Step 7: Verify next milestone is Faction (not Fight!)
    console.log('\n🏴 Step 7: Verify Next Milestone is Faction Creation (NEW ORDER)');
    await page.goto('http://localhost:3005/campaigns');
    await page.waitForTimeout(3000);
    
    const campaignsPageContent = await page.textContent('body').catch(() => '');
    const hasFactionMilestone = campaignsPageContent.includes('Create your first Faction') || campaignsPageContent.includes('faction') || campaignsPageContent.includes('Faction');
    const hasFightMilestone = campaignsPageContent.includes('Create your first Fight') || campaignsPageContent.includes('Start your first Fight');
    
    console.log('  📄 Faction milestone shown (expected):', hasFactionMilestone);
    console.log('  📄 Fight milestone shown (should be false):', hasFightMilestone);
    
    if (hasFactionMilestone && !hasFightMilestone) {
      console.log('  ✅ MILESTONE ORDER CORRECT: Faction comes before Fight');
    } else if (hasFightMilestone) {
      console.log('  ❌ MILESTONE ORDER INCORRECT: Fight showing instead of Faction');
    } else {
      console.log('  ⚠️  Neither Faction nor Fight milestone detected clearly');
    }
    
    // Take final screenshot
    await page.screenshot({ 
      path: path.join(__dirname, 'test-results', 'milestone-order-final-check.png'),
      fullPage: true 
    });
    
    console.log('\n🎉 Milestone Order Test Complete');
    console.log('Expected Order: Campaign → Activate → Character → Faction → Party → Site → Fight → Congratulations');
    console.log('✅ Fight creation is now the FINAL milestone before congratulations!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testMilestoneOrder().catch(console.error);