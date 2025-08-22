/**
 * Simple API Test: Party to Fight API v2
 * 
 * Tests the POST /api/v2/parties/:party_id/fight/:fight_id endpoint 
 * using direct API calls without browser automation.
 */

async function testPartyToFightApi() {
  console.log('🚀 Starting Simple Party to Fight API v2 Test...');
  
  try {
    // Step 1: Login to get JWT token
    console.log('📝 Step 1: Getting authentication token...');
    
    const loginResponse = await fetch('http://localhost:3000/users/sign_in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: {
          email: 'progressions@gmail.com',
          password: 'password'
        }
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const authHeader = loginResponse.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header in login response');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('✅ Authentication token obtained');

    // Step 2: Create a test party
    console.log('🔧 Step 2: Creating test party...');
    
    const createPartyResponse = await fetch('http://localhost:3000/api/v2/parties', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        party: {
          name: 'API Test Party',
          description: 'Party created for API testing'
        }
      })
    });

    if (!createPartyResponse.ok) {
      const errorData = await createPartyResponse.text();
      throw new Error(`Failed to create party: ${createPartyResponse.status} ${errorData}`);
    }
    
    const testParty = await createPartyResponse.json();
    console.log('✅ Created test party:', testParty.name, 'ID:', testParty.id);

    // Step 3: Create a test fight
    console.log('🔧 Step 3: Creating test fight...');
    
    const createFightResponse = await fetch('http://localhost:3000/api/v2/fights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fight: {
          name: 'API Test Fight',
          description: 'Fight created for API testing'
        }
      })
    });

    if (!createFightResponse.ok) {
      const errorData = await createFightResponse.text();
      throw new Error(`Failed to create fight: ${createFightResponse.status} ${errorData}`);
    }
    
    const testFight = await createFightResponse.json();
    console.log('✅ Created test fight:', testFight.name, 'ID:', testFight.id);

    // Step 4: Test the party-to-fight endpoint
    console.log('🎯 Step 4: Testing party-to-fight API endpoint...');
    
    const addPartyToFightResponse = await fetch(`http://localhost:3000/api/v2/parties/${testParty.id}/fight/${testFight.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!addPartyToFightResponse.ok) {
      const errorData = await addPartyToFightResponse.text();
      throw new Error(`Party-to-fight API call failed: ${addPartyToFightResponse.status} ${errorData}`);
    }

    const responseData = await addPartyToFightResponse.json();
    console.log('✅ API call successful!');
    console.log('Response:', JSON.stringify(responseData, null, 2));

    // Verify response structure
    if (!responseData.id || responseData.id !== testParty.id) {
      throw new Error('Response does not contain expected party ID');
    }
    
    if (!responseData.name || responseData.name !== testParty.name) {
      throw new Error('Response does not contain expected party name');
    }

    console.log('✅ Response validation passed!');

    // Step 5: Test multiple instances - add the same party again
    console.log('🔄 Step 5: Testing multiple instances...');
    
    const addPartyAgainResponse = await fetch(`http://localhost:3000/api/v2/parties/${testParty.id}/fight/${testFight.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!addPartyAgainResponse.ok) {
      const errorData = await addPartyAgainResponse.text();
      throw new Error(`Second party-to-fight API call failed: ${addPartyAgainResponse.status} ${errorData}`);
    }

    const secondResponseData = await addPartyAgainResponse.json();
    console.log('✅ Multiple instances allowed - second API call successful!');

    // Step 6: Clean up test data
    console.log('🧹 Step 6: Cleaning up test data...');
    
    // Delete test party
    const deletePartyResponse = await fetch(`http://localhost:3000/api/v2/parties/${testParty.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Delete test fight  
    const deleteFightResponse = await fetch(`http://localhost:3000/api/v2/fights/${testFight.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Test data cleaned up');
    console.log('🎉 All tests passed! Party-to-Fight API v2 is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  testPartyToFightApi()
    .then(() => {
      console.log('✅ Simple Party-to-Fight API v2 test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Simple Party-to-Fight API v2 test failed:', error);
      process.exit(1);
    });
}

module.exports = { testPartyToFightApi };