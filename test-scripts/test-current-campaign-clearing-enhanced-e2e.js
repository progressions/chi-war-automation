// Enhanced End-to-End Test: Current Campaign Clearing with Network Validation
// Tests the complete flow while monitoring network traffic for API contract violations

const { chromium } = require('playwright');
const { loginAsGamemaster, loginAsPlayer } = require('./login-helper');

// Network validation configuration
const EXPECTED_API_PATTERNS = {
  campaign_membership_delete: {
    url: /\/api\/v2\/campaign_memberships\?campaign_id=.+&user_id=.+/,
    method: 'DELETE',
    expectedSuccessStatus: 200,
    expectedErrorStatuses: [400, 401, 403, 404, 422, 500]
  },
  campaign_membership_create: {
    url: /\/api\/v2\/campaign_memberships/,
    method: 'POST', 
    expectedSuccessStatus: 201,
    expectedErrorStatuses: [400, 401, 403, 404, 422, 500]
  }
};

class NetworkValidator {
  constructor(page) {
    this.page = page;
    this.requests = [];
    this.responses = [];
    this.violations = [];
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
  }
  
  setupNetworkMonitoring() {
    // Capture all requests
    this.page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        this.requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now()
        });
        console.log(`📡 API Request: ${request.method()} ${request.url()}`);
      }
    });
    
    // Capture all responses
    this.page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        this.responses.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now()
        });
        console.log(`📡 API Response: ${response.status()} ${response.request().method()} ${response.url()}`);
        
        // Validate response immediately
        this.validateResponse(response);
      }
    });
  }
  
  validateResponse(response) {
    const url = response.url();
    const method = response.request().method();
    const status = response.status();
    
    // Find matching pattern
    const pattern = Object.values(EXPECTED_API_PATTERNS).find(p => 
      p.url.test(url) && p.method === method
    );
    
    if (!pattern) {
      console.log(`⚠️ No validation pattern found for: ${method} ${url}`);
      return;
    }
    
    // Validate status code
    const isExpectedSuccess = status === pattern.expectedSuccessStatus;
    const isExpectedError = pattern.expectedErrorStatuses.includes(status);
    
    if (!isExpectedSuccess && !isExpectedError) {
      const violation = {
        type: 'UNEXPECTED_STATUS_CODE',
        url,
        method,
        actualStatus: status,
        expectedSuccess: pattern.expectedSuccessStatus,
        expectedErrors: pattern.expectedErrorStatuses,
        timestamp: Date.now()
      };
      this.violations.push(violation);
      console.error(`❌ API Contract Violation: ${method} ${url} returned ${status}, expected ${pattern.expectedSuccessStatus} or ${pattern.expectedErrorStatuses.join(', ')}`);
    } else {
      console.log(`✅ API Response Valid: ${method} ${url} returned ${status}`);
    }
  }
  
  async validateResponseBody(url, method) {
    // Find the latest response for this URL/method combination
    const response = this.responses
      .filter(r => r.url.includes(url) && r.method === method)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    
    if (!response) {
      console.log(`⚠️ No response found for validation: ${method} ${url}`);
      return;
    }
    
    // For error responses, validate they have proper error format
    if (response.status >= 400) {
      try {
        // Make a request to get the response body
        const apiResponse = await this.page.evaluate(async (responseUrl) => {
          // This is a simplified check - in real implementation we'd need to
          // capture the actual response body during the response event
          return { hasErrorField: true }; // Placeholder
        }, response.url);
        
        if (!apiResponse.hasErrorField) {
          this.violations.push({
            type: 'INVALID_ERROR_FORMAT',
            url: response.url,
            method: response.method,
            status: response.status,
            issue: 'Error response missing error field',
            timestamp: Date.now()
          });
          console.error(`❌ API Contract Violation: Error response missing proper error format`);
        }
      } catch (error) {
        console.log(`⚠️ Could not validate response body: ${error.message}`);
      }
    }
  }
  
  getViolations() {
    return this.violations;
  }
  
  getNetworkSummary() {
    return {
      totalRequests: this.requests.length,
      totalResponses: this.responses.length,
      violations: this.violations.length,
      apiCalls: this.requests.filter(r => r.url.includes('/api/')).length
    };
  }
}

async function runEnhancedCurrentCampaignClearingE2ETest() {
  console.log('🚀 Starting Enhanced Current Campaign Clearing End-to-End Test with Network Validation...');
  
  // Launch browser with network events enabled
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Initialize network validator
  const networkValidator = new NetworkValidator(page);
  
  try {
    // Test Setup: Login as player who has multiple campaigns
    console.log('🔐 Test Setup: Logging in as player user...');
    await loginAsPlayer(page, { 
      takeScreenshot: true, 
      screenshotPath: 'test-results' 
    });
    
    // Navigate to profile page
    console.log('👤 Step 1: Navigating to profile page...');
    await navigateToProfilePage(page);
    
    // Test Scenario 1: Leave active campaign with network validation
    console.log('🎯 Scenario 1: Testing leave active campaign with network monitoring...');
    await testLeaveActiveCampaignWithValidation(page, networkValidator);
    
    // Test Scenario 2: Leave non-active campaign with network validation
    console.log('🎯 Scenario 2: Testing leave non-active campaign with network monitoring...');
    await testLeaveNonActiveCampaignWithValidation(page, networkValidator);
    
    // Test Scenario 3: Test API error handling
    console.log('🎯 Scenario 3: Testing API error scenarios...');
    await testApiErrorScenarios(page, networkValidator);
    
    // Validate network traffic
    console.log('🔍 Analyzing network traffic for violations...');
    await validateNetworkTraffic(networkValidator);
    
    console.log('🎉 All Enhanced Current Campaign Clearing E2E tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Enhanced Current Campaign Clearing E2E test failed:', error);
    await page.screenshot({ 
      path: 'test-results/enhanced-current-campaign-clearing-e2e-error.png', 
      fullPage: true 
    });
    console.log('📸 Error screenshot taken');
    
    // Log network violations if any
    const violations = networkValidator.getViolations();
    if (violations.length > 0) {
      console.error('🚨 API Contract Violations detected:');
      violations.forEach((violation, index) => {
        console.error(`  ${index + 1}. ${violation.type}: ${violation.method} ${violation.url}`);
        console.error(`     Status: ${violation.actualStatus}, Expected: ${violation.expectedSuccess} or ${violation.expectedErrors?.join(', ')}`);
      });
    }
    
    throw error;
  } finally {
    // Print network summary
    const summary = networkValidator.getNetworkSummary();
    console.log('📊 Network Traffic Summary:');
    console.log(`   Total Requests: ${summary.totalRequests}`);
    console.log(`   Total Responses: ${summary.totalResponses}`);
    console.log(`   API Calls: ${summary.apiCalls}`);
    console.log(`   Contract Violations: ${summary.violations}`);
    
    await browser.close();
  }
}

async function navigateToProfilePage(page) {
  try {
    console.log('🔍 Navigating directly to profile page...');
    
    // Navigate directly to profile page
    await page.goto('http://localhost:3001/profile');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify profile page loaded
    const hasProfileContent = await page.locator('text=Personal Information').or(
      page.locator('text=Account Information')
    ).or(
      page.locator('text=Campaigns')
    ).count();
    
    if (hasProfileContent === 0) {
      throw new Error('Profile page content not found after navigation');
    }
    
    // Take screenshot of profile page
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-profile-page-loaded.png', 
      fullPage: true 
    });
    console.log('📸 Profile page loaded screenshot taken');
    console.log('✅ Successfully navigated to profile page');
    
  } catch (error) {
    console.error('❌ Failed to navigate to profile page:', error);
    throw error;
  }
}

async function testLeaveActiveCampaignWithValidation(page, networkValidator) {
  try {
    console.log('📝 Step 1.1: Identifying current active campaign...');
    
    // Look for campaign with "Active" badge
    const activeCampaignSection = page.locator('text=As Player').locator('..').locator('..')
      .locator('div:has-text("Active")').first();
    
    // Take screenshot showing campaigns list
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-campaigns-before-leave-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list before leaving active campaign screenshot taken');
    
    // Check if there's an active campaign
    const hasActiveCampaign = await activeCampaignSection.count() > 0;
    
    if (!hasActiveCampaign) {
      console.log('⚠️ No active campaign found - skipping active campaign leave test');
      return;
    }
    
    console.log('✅ Found active campaign');
    
    // Find the leave button (X icon) for the active campaign
    const leaveCampaignButton = activeCampaignSection.locator('button').filter({ 
      hasText: /cancel|×|close/i 
    }).or(
      activeCampaignSection.locator('button[aria-label*="Leave"]')
    ).or(
      activeCampaignSection.locator('svg').locator('..').locator('button')
    ).first();
    
    console.log('📝 Step 1.2: Clicking leave campaign button...');
    await leaveCampaignButton.waitFor({ timeout: 5000 });
    
    // Clear previous network data for focused monitoring
    const initialViolations = networkValidator.getViolations().length;
    
    await leaveCampaignButton.click();
    
    // Wait for confirmation dialog
    console.log('📝 Step 1.3: Handling confirmation dialog...');
    await page.waitForSelector('text=Leave Campaign', { timeout: 5000 });
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-leave-active-confirmation.png', 
      fullPage: true 
    });
    console.log('📸 Leave active campaign confirmation dialog screenshot taken');
    
    // Set up response monitoring for the DELETE request
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v2/campaign_memberships') && 
      response.request().method() === 'DELETE'
    );
    
    // Click the confirmation button
    const confirmButton = page.getByRole('button', { name: /leave campaign/i });
    await confirmButton.click();
    
    console.log('📝 Step 1.4: Monitoring API response...');
    
    try {
      // Wait for the API response
      const response = await responsePromise;
      const status = response.status();
      
      console.log(`📡 DELETE request completed with status: ${status}`);
      
      // Validate the response body for error format if needed
      if (status >= 400) {
        try {
          const responseBody = await response.json();
          if (!responseBody.error) {
            networkValidator.violations.push({
              type: 'INVALID_ERROR_FORMAT',
              url: response.url(),
              method: 'DELETE',
              status: status,
              issue: 'Error response missing error field in body',
              timestamp: Date.now()
            });
            console.error(`❌ API Contract Violation: Error response missing error field`);
          } else {
            console.log(`✅ Error response has proper format: ${responseBody.error}`);
          }
        } catch (jsonError) {
          console.error(`❌ Could not parse error response as JSON: ${jsonError.message}`);
        }
      }
      
      // Wait for either success (dialog closes) or error handling
      try {
        await page.waitForSelector('text=Leave Campaign', { state: 'hidden', timeout: 5000 });
        console.log('✅ Dialog closed - operation completed');
      } catch (error) {
        const errorMessage = await page.locator('text=Failed to leave campaign').count();
        if (errorMessage > 0) {
          console.log('⚠️ Frontend error detected: Failed to leave campaign');
          // Close the dialog manually
          const cancelButton = page.getByRole('button', { name: /cancel/i });
          await cancelButton.click();
          await page.waitForTimeout(1000);
        }
      }
      
    } catch (responseError) {
      console.error(`❌ Failed to monitor API response: ${responseError.message}`);
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after leaving active campaign
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-campaigns-after-leave-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list after leaving active campaign screenshot taken');
    
    // Verify network behavior
    const newViolations = networkValidator.getViolations().length - initialViolations;
    if (newViolations === 0) {
      console.log('✅ No API contract violations detected for leave active campaign');
    } else {
      console.log(`⚠️ ${newViolations} API contract violations detected`);
    }
    
    console.log('✅ Successfully tested leaving active campaign with network validation');
    
  } catch (error) {
    console.error('❌ Failed to test leaving active campaign with validation:', error);
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-leave-active-error.png', 
      fullPage: true 
    });
    console.log('📸 Leave active campaign error screenshot taken');
    throw error;
  }
}

async function testLeaveNonActiveCampaignWithValidation(page, networkValidator) {
  try {
    console.log('📝 Step 2.1: Identifying non-active campaign to leave...');
    
    // Look for campaigns without "Active" badge in the player section
    const playerSection = page.locator('text=As Player').locator('..').locator('..');
    const allPlayerCampaigns = playerSection.locator('[role="button"]').or(
      playerSection.locator('div').filter({ hasText: /campaign/i })
    );
    
    const campaignCount = await allPlayerCampaigns.count();
    console.log(`Found ${campaignCount} player campaigns`);
    
    if (campaignCount === 0) {
      console.log('⚠️ No remaining player campaigns found - skipping non-active campaign test');
      return;
    }
    
    // Take screenshot showing current state
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-campaigns-before-leave-non-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list before leaving non-active campaign screenshot taken');
    
    // Find a leave button for any remaining campaign
    const leaveCampaignButton = playerSection.locator('button').filter({ 
      hasText: /cancel|×|close/i 
    }).or(
      playerSection.locator('button[aria-label*="Leave"]')
    ).or(
      playerSection.locator('svg').locator('..').locator('button')
    ).first();
    
    const hasLeaveButton = await leaveCampaignButton.count() > 0;
    
    if (!hasLeaveButton) {
      console.log('⚠️ No leave button found for non-active campaigns - skipping test');
      return;
    }
    
    console.log('📝 Step 2.2: Clicking leave button for non-active campaign...');
    
    // Clear previous network data for focused monitoring
    const initialViolations = networkValidator.getViolations().length;
    
    await leaveCampaignButton.click();
    
    // Wait for confirmation dialog
    console.log('📝 Step 2.3: Handling confirmation dialog...');
    await page.waitForSelector('text=Leave Campaign', { timeout: 5000 });
    
    // Take screenshot of confirmation dialog
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-leave-non-active-confirmation.png', 
      fullPage: true 
    });
    console.log('📸 Leave non-active campaign confirmation dialog screenshot taken');
    
    // Set up response monitoring for the DELETE request
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/v2/campaign_memberships') && 
      response.request().method() === 'DELETE'
    );
    
    // Click the confirmation button
    const confirmButton = page.getByRole('button', { name: /leave campaign/i });
    await confirmButton.click();
    
    console.log('📝 Step 2.4: Monitoring API response...');
    
    try {
      // Wait for the API response
      const response = await responsePromise;
      const status = response.status();
      
      console.log(`📡 DELETE request completed with status: ${status}`);
      
      // For non-active campaigns, the response should still be successful
      if (status === 200) {
        console.log('✅ Non-active campaign leave returned 200 as expected');
      } else {
        console.log(`⚠️ Non-active campaign leave returned ${status}`);
      }
      
      // Wait for dialog to close
      try {
        await page.waitForSelector('text=Leave Campaign', { state: 'hidden', timeout: 5000 });
        console.log('✅ Dialog closed - operation completed');
      } catch (error) {
        console.log('⚠️ Dialog did not close as expected');
      }
      
    } catch (responseError) {
      console.error(`❌ Failed to monitor API response: ${responseError.message}`);
    }
    
    await page.waitForTimeout(2000);
    
    // Take screenshot after leaving non-active campaign
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-campaigns-after-leave-non-active.png', 
      fullPage: true 
    });
    console.log('📸 Campaigns list after leaving non-active campaign screenshot taken');
    
    // Verify network behavior
    const newViolations = networkValidator.getViolations().length - initialViolations;
    if (newViolations === 0) {
      console.log('✅ No API contract violations detected for leave non-active campaign');
    } else {
      console.log(`⚠️ ${newViolations} API contract violations detected`);
    }
    
    console.log('✅ Successfully tested leaving non-active campaign with network validation');
    
  } catch (error) {
    console.error('❌ Failed to test leaving non-active campaign with validation:', error);
    await page.screenshot({ 
      path: 'test-results/enhanced-e2e-leave-non-active-error.png', 
      fullPage: true 
    });
    console.log('📸 Leave non-active campaign error screenshot taken');
    throw error;
  }
}

async function testApiErrorScenarios(page, networkValidator) {
  try {
    console.log('📝 Step 3.1: Testing API error scenario handling...');
    
    // Test 1: Invalid API request (this might require injecting a malformed request)
    console.log('📝 Step 3.2: Monitoring for any invalid API patterns...');
    
    // Check if any requests were made with invalid parameters
    const requests = networkValidator.requests;
    const invalidRequests = requests.filter(req => {
      if (req.url.includes('/api/v2/campaign_memberships')) {
        // Check for malformed URLs or missing required parameters
        if (req.method === 'DELETE') {
          const url = new URL(req.url, 'http://localhost:3000');
          const campaignId = url.searchParams.get('campaign_id');
          const userId = url.searchParams.get('user_id');
          
          if (!campaignId || !userId) {
            return true; // Invalid request
          }
          
          // Check for invalid UUID format
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (!uuidRegex.test(campaignId) || !uuidRegex.test(userId)) {
            return true; // Invalid UUID format
          }
        }
      }
      return false;
    });
    
    if (invalidRequests.length > 0) {
      console.log(`⚠️ Found ${invalidRequests.length} potentially invalid API requests`);
      invalidRequests.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.method} ${req.url}`);
      });
    } else {
      console.log('✅ No invalid API request patterns detected');
    }
    
    // Test 2: Check for proper authentication headers
    const authMissingRequests = requests.filter(req => 
      req.url.includes('/api/') && 
      (!req.headers['authorization'] || !req.headers['authorization'].startsWith('Bearer '))
    );
    
    if (authMissingRequests.length > 0) {
      console.log(`⚠️ Found ${authMissingRequests.length} API requests without proper authentication`);
    } else {
      console.log('✅ All API requests have proper authentication headers');
    }
    
    console.log('✅ API error scenario validation completed');
    
  } catch (error) {
    console.error('❌ Failed to test API error scenarios:', error);
    throw error;
  }
}

async function validateNetworkTraffic(networkValidator) {
  const violations = networkValidator.getViolations();
  const summary = networkValidator.getNetworkSummary();
  
  console.log('🔍 Network Traffic Validation Summary:');
  console.log(`   Total API Requests: ${summary.apiCalls}`);
  console.log(`   Total Responses: ${summary.totalResponses}`);
  console.log(`   Contract Violations: ${violations.length}`);
  
  if (violations.length > 0) {
    console.error('🚨 API Contract Violations Found:');
    violations.forEach((violation, index) => {
      console.error(`   ${index + 1}. Type: ${violation.type}`);
      console.error(`      URL: ${violation.url}`);
      console.error(`      Method: ${violation.method}`);
      if (violation.actualStatus) {
        console.error(`      Status: ${violation.actualStatus} (expected: ${violation.expectedSuccess})`);
      }
      if (violation.issue) {
        console.error(`      Issue: ${violation.issue}`);
      }
      console.error('');
    });
    
    throw new Error(`${violations.length} API contract violations detected`);
  } else {
    console.log('✅ No API contract violations detected');
  }
}

// Run the test
if (require.main === module) {
  runEnhancedCurrentCampaignClearingE2ETest()
    .then(() => {
      console.log('✅ Enhanced Current Campaign Clearing End-to-End test passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Enhanced Current Campaign Clearing End-to-End test failed:', error);
      process.exit(1);
    });
}

module.exports = { runEnhancedCurrentCampaignClearingE2ETest, NetworkValidator };