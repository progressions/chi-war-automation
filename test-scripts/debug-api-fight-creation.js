const axios = require('axios');

async function testFightCreationViaAPI() {
  console.log('🚀 Starting API Fight Creation Debug Test');
  
  try {
    // Step 1: Get JWT token
    console.log('🔐 Step 1: Getting JWT token...');
    const loginResponse = await axios.post('http://localhost:3004/users/sign_in', {
      user: {
        email: 'progressions@gmail.com',
        password: 'TestPass123!'
      }
    });
    
    const token = loginResponse.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No JWT token received');
    }
    console.log('✅ JWT token obtained');
    
    // Step 2: Create a fight via API
    console.log('🎮 Step 2: Creating fight via API...');
    const fightResponse = await axios.post('http://localhost:3004/api/v2/fights', {
      fight: {
        name: 'Debug API Test Fight',
        description: 'Testing WebSocket broadcasts via API'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Fight created:', fightResponse.data.name);
    console.log('🔍 Fight ID:', fightResponse.data.id);
    
    console.log('⏳ Waiting 3 seconds for WebSocket broadcasts...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Test completed - check Rails server logs for WebSocket debug output');
    
  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - check test user credentials');
    }
  }
}

// Run the test
testFightCreationViaAPI().catch(console.error);