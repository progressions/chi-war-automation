/**
 * Centralized test configuration for Chi War E2E tests
 * Provides environment-based configuration for test URLs
 */

const TEST_CONFIG = {
  // Test environment ports (default for isolated testing)
  TEST_FRONTEND_PORT: process.env.TEST_FRONTEND_PORT || '3005',
  TEST_BACKEND_PORT: process.env.TEST_BACKEND_PORT || '3004',
  
  // Get frontend URL for testing
  getFrontendUrl() {
    return `http://localhost:${this.TEST_FRONTEND_PORT}`;
  },
  
  // Get backend URL for testing
  getBackendUrl() {
    return `http://localhost:${this.TEST_BACKEND_PORT}`;
  },
  
  // Common test URLs
  getLoginUrl() {
    return `${this.getFrontendUrl()}/login`;
  },
  
  getRegisterUrl() {
    return `${this.getFrontendUrl()}/register`;
  },
  
  getCampaignsUrl() {
    return `${this.getFrontendUrl()}/campaigns`;
  },
  
  getProfileUrl() {
    return `${this.getFrontendUrl()}/profile`;
  },
  
  getCharactersUrl() {
    return `${this.getFrontendUrl()}/characters`;
  },
  
  getFightsUrl() {
    return `${this.getFrontendUrl()}/fights`;
  },
  
  // API endpoints
  getApiUrl(endpoint) {
    return `${this.getBackendUrl()}/api/v2/${endpoint}`;
  }
};

module.exports = TEST_CONFIG;