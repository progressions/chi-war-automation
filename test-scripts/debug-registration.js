const axios = require('axios');
const TEST_CONFIG = require('./test-config');

const testData = {
  email: `debug_test_${Date.now()}@example.com`,
  password: 'TestPass123!',
  password_confirmation: 'TestPass123!',
  first_name: 'Test',
  last_name: 'User'
};

async function testRegistration() {
  try {
    console.log('Testing registration API directly...');
    console.log('Backend URL:', TEST_CONFIG.getBackendUrl());
    console.log('Registration data:', testData);
    
    const response = await axios.post(
      `${TEST_CONFIG.getBackendUrl()}/api/v2/auth/registrations`,
      { user: testData },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Registration successful');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
  } catch (error) {
    console.log('❌ Registration failed');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
      console.log('Response headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error setting up request:', error.message);
    }
  }
}

testRegistration();