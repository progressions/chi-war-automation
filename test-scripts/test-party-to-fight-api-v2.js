/**
 * End-to-End Test: Party to Fight API v2 Implementation
 * 
 * Tests the new POST /api/v2/parties/:party_id/fight/:fight_id endpoint
 * to verify that parties can be added to fights with multiple instances allowed.
 */

const { chromium } = require('playwright');
const { loginAsGamemaster } = require('./login-helper');

async function testPartyToFightApiV2() {
  console.log('🚀 Starting Party to Fight API v2 E2E Test...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Login as gamemaster to get proper authentication
    console.log('📝 Step 1: Logging in as gamemaster...');
    await loginAsGamemaster(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results',
      screenshotName: 'party-to-fight-01-login'
    });

    // Step 2: Create test data via API calls
    console.log('🔧 Step 2: Setting up test data...');
    
    // Get authentication token from localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (!token) {
      throw new Error('No authentication token found after login');
    }

    // Create a test party via API
    console.log('Creating test party...');
    const createPartyResponse = await page.evaluate(async (authToken) => {
      const response = await fetch('http://localhost:3000/api/v2/parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          party: {
            name: 'E2E Test Party',
            description: 'Party created for testing party-to-fight functionality'
          }
        })
      });
      const data = await response.json();
      return { status: response.status, data };
    }, token);

    if (createPartyResponse.status !== 201) {
      throw new Error(`Failed to create test party: ${JSON.stringify(createPartyResponse)}`);
    }
    
    const testParty = createPartyResponse.data;
    console.log('✅ Created test party:', testParty.name, 'ID:', testParty.id);

    // Create a test fight via API
    console.log('Creating test fight...');
    const createFightResponse = await page.evaluate(async (authToken) => {
      const response = await fetch('http://localhost:3000/api/v2/fights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          fight: {
            name: 'E2E Test Fight',
            description: 'Fight created for testing party-to-fight functionality'
          }
        })
      });
      const data = await response.json();
      return { status: response.status, data };
    }, token);

    if (createFightResponse.status !== 201) {
      throw new Error(`Failed to create test fight: ${JSON.stringify(createFightResponse)}`);
    }
    
    const testFight = createFightResponse.data;
    console.log('✅ Created test fight:', testFight.name, 'ID:', testFight.id);

    // Step 3: Test the party-to-fight endpoint
    console.log('🎯 Step 3: Testing party-to-fight API endpoint...');
    
    const addPartyToFightResponse = await page.evaluate(async (authToken, partyId, fightId) => {
      const response = await fetch(`http://localhost:3000/api/v2/parties/${partyId}/fight/${fightId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      return { status: response.status, data };
    }, token, testParty.id, testFight.id);

    console.log('API Response Status:', addPartyToFightResponse.status);
    console.log('API Response Data:', JSON.stringify(addPartyToFightResponse.data, null, 2));

    // Step 4: Verify the response
    if (addPartyToFightResponse.status !== 200) {
      throw new Error(`API call failed with status ${addPartyToFightResponse.status}: ${JSON.stringify(addPartyToFightResponse.data)}`);
    }

    const responseData = addPartyToFightResponse.data;
    
    // Verify response structure
    if (!responseData.id || responseData.id !== testParty.id) {
      throw new Error('Response does not contain expected party ID');
    }
    
    if (!responseData.name || responseData.name !== testParty.name) {
      throw new Error('Response does not contain expected party name');
    }

    console.log('✅ Party successfully added to fight!');
    console.log('✅ Response contains correct party ID:', responseData.id);
    console.log('✅ Response contains correct party name:', responseData.name);

    // Step 5: Test multiple instances - add the same party again
    console.log('🔄 Step 5: Testing multiple instances (adding same party again)...');
    
    const addPartyAgainResponse = await page.evaluate(async (authToken, partyId, fightId) => {
      const response = await fetch(`http://localhost:3000/api/v2/parties/${partyId}/fight/${fightId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      return { status: response.status, data };
    }, token, testParty.id, testFight.id);

    if (addPartyAgainResponse.status !== 200) {
      throw new Error(`Second API call failed with status ${addPartyAgainResponse.status}: ${JSON.stringify(addPartyAgainResponse.data)}`);
    }

    console.log('✅ Same party successfully added to fight again (multiple instances allowed)!');

    // Step 6: Clean up test data
    console.log('🧹 Step 6: Cleaning up test data...');
    
    // Delete test party
    const deletePartyResponse = await page.evaluate(async (authToken, partyId) => {
      const response = await fetch(`http://localhost:3000/api/v2/parties/${partyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return { status: response.status };
    }, token, testParty.id);

    // Delete test fight
    const deleteFightResponse = await page.evaluate(async (authToken, fightId) => {
      const response = await fetch(`http://localhost:3000/api/v2/fights/${fightId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      return { status: response.status };
    }, token, testFight.id);

    console.log('✅ Test data cleaned up successfully');

    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/party-to-fight-02-success.png',
      fullPage: true 
    });

    console.log('🎉 All tests passed! Party-to-Fight API v2 is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ 
      path: 'test-results/party-to-fight-ERROR.png',
      fullPage: true 
    });
    
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
if (require.main === module) {
  testPartyToFightApiV2()
    .then(() => {
      console.log('✅ Party-to-Fight API v2 E2E test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Party-to-Fight API v2 E2E test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPartyToFightApiV2 };