const axios = require('axios');

// Test configuration
const API_BASE = 'http://localhost:3004';
const TEST_USER = 'progressions@gmail.com';
const TEST_PASSWORD = 'TestPass123!';

async function testDeletionAPI() {
  console.log('🧪 Testing Unified Deletion System via API');
  console.log('==========================================\n');
  
  try {
    // 1. Login to get JWT token
    console.log('1. Logging in to get JWT token...');
    const loginResponse = await axios.post(`${API_BASE}/users/sign_in`, {
      user: {
        email: TEST_USER,
        password: TEST_PASSWORD
      }
    });
    
    const token = loginResponse.headers['authorization'];
    console.log('✅ Login successful, got JWT token');
    
    // Create axios instance with auth header
    const api = axios.create({
      baseURL: API_BASE,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    // 2. Get campaigns list
    console.log('\n2. Fetching campaigns...');
    const campaignsResponse = await api.get('/api/v2/campaigns');
    const campaigns = campaignsResponse.data.campaigns;
    console.log(`Found ${campaigns.length} campaigns`);
    
    // Find Test Campaign
    const testCampaign = campaigns.find(c => c.name === 'Test Campaign');
    if (!testCampaign) {
      throw new Error('Test Campaign not found');
    }
    console.log(`Found Test Campaign with ID: ${testCampaign.id}`);
    
    // 3. Try to delete campaign without force
    console.log('\n3. Attempting to delete Test Campaign without force parameter...');
    try {
      await api.delete(`/api/v2/campaigns/${testCampaign.id}`);
      console.log('❌ Campaign was deleted without force - this should not happen!');
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.log('✅ Got expected 422 error for campaign with associations');
        console.log('Response:', JSON.stringify(error.response.data, null, 2));
        
        // Check for unified error format
        const errorData = error.response.data;
        if (errorData.error_type === 'associations_exist') {
          console.log('✅ Unified error format detected!');
          console.log('Constraints:', errorData.constraints);
        }
      } else {
        console.log('Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    
    // 4. Test character deletion
    console.log('\n4. Testing character deletion...');
    const charactersResponse = await api.get('/api/v2/characters');
    const characters = charactersResponse.data.characters;
    
    if (characters.length > 0) {
      const testCharacter = characters[0];
      console.log(`Testing deletion of character: ${testCharacter.name} (${testCharacter.id})`);
      
      try {
        await api.delete(`/api/v2/characters/${testCharacter.id}`);
        console.log('✅ Character deleted successfully (no associations)');
      } catch (error) {
        if (error.response && error.response.status === 422) {
          console.log('✅ Got expected 422 error for character with associations');
          console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.log('Unexpected error:', error.response?.status, error.response?.data);
        }
      }
    }
    
    // 5. Test faction deletion
    console.log('\n5. Testing faction deletion...');
    const factionsResponse = await api.get('/api/v2/factions');
    const factions = factionsResponse.data.factions;
    
    if (factions.length > 0) {
      const testFaction = factions[0];
      console.log(`Testing deletion of faction: ${testFaction.name} (${testFaction.id})`);
      
      try {
        await api.delete(`/api/v2/factions/${testFaction.id}`);
        console.log('✅ Faction deleted successfully (no associations)');
      } catch (error) {
        if (error.response && error.response.status === 422) {
          console.log('✅ Got expected 422 error for faction with associations');
          console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
          console.log('Unexpected error:', error.response?.status, error.response?.data);
        }
      }
    }
    
    console.log('\n==========================================');
    console.log('✅ API Deletion Test Completed!');
    console.log('==========================================');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Run the test
testDeletionAPI().catch(error => {
  console.error('Test execution failed:', error.message);
  process.exit(1);
});