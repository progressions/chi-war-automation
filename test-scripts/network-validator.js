// Network Validation Utility for E2E Tests
// Provides API contract validation for Playwright tests

class NetworkValidator {
  constructor(page, config = {}) {
    this.page = page;
    this.config = {
      logRequests: config.logRequests !== false, // Default true
      logResponses: config.logResponses !== false, // Default true
      validateResponseBodies: config.validateResponseBodies !== false, // Default true
      baseUrl: config.baseUrl || 'http://localhost:3000',
      ...config
    };
    
    this.requests = [];
    this.responses = [];
    this.violations = [];
    this.capturedBodies = new Map(); // Store response bodies for validation
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
  }
  
  setupNetworkMonitoring() {
    // Capture all requests
    this.page.on('request', (request) => {
      if (this.isApiRequest(request.url())) {
        const requestData = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: Date.now(),
          id: this.generateRequestId()
        };
        
        this.requests.push(requestData);
        
        if (this.config.logRequests) {
          console.log(`📡 API Request: ${request.method()} ${request.url()}`);
        }
      }
    });
    
    // Capture all responses with bodies
    this.page.on('response', async (response) => {
      if (this.isApiRequest(response.url())) {
        const responseData = {
          url: response.url(),
          method: response.request().method(),
          status: response.status(),
          headers: response.headers(),
          timestamp: Date.now(),
          id: this.generateRequestId()
        };
        
        // Capture response body for validation
        if (this.config.validateResponseBodies) {
          try {
            const body = await response.text();
            responseData.body = body;
            this.capturedBodies.set(response.url() + response.request().method(), body);
          } catch (error) {
            console.log(`⚠️ Could not capture response body: ${error.message}`);
          }
        }
        
        this.responses.push(responseData);
        
        if (this.config.logResponses) {
          console.log(`📡 API Response: ${response.status()} ${response.request().method()} ${response.url()}`);
        }
        
        // Validate response immediately
        this.validateResponse(responseData);
      }
    });
  }
  
  isApiRequest(url) {
    return url.includes('/api/') && url.startsWith(this.config.baseUrl);
  }
  
  generateRequestId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  validateResponse(responseData) {
    const { url, method, status, body } = responseData;
    
    // Find matching API pattern
    const pattern = this.findApiPattern(url, method);
    
    if (!pattern) {
      if (this.config.logRequests) {
        console.log(`⚠️ No validation pattern found for: ${method} ${url}`);
      }
      return;
    }
    
    // Validate status code
    this.validateStatusCode(responseData, pattern);
    
    // Validate response body structure
    if (this.config.validateResponseBodies && body) {
      this.validateResponseBody(responseData, pattern);
    }
    
    // Validate headers
    this.validateHeaders(responseData, pattern);
  }
  
  validateStatusCode(responseData, pattern) {
    const { url, method, status } = responseData;
    const isExpectedSuccess = status === pattern.expectedSuccessStatus;
    const isExpectedError = pattern.expectedErrorStatuses?.includes(status);
    
    if (!isExpectedSuccess && !isExpectedError) {
      const violation = {
        type: 'UNEXPECTED_STATUS_CODE',
        url,
        method,
        actualStatus: status,
        expectedSuccess: pattern.expectedSuccessStatus,
        expectedErrors: pattern.expectedErrorStatuses || [],
        timestamp: Date.now(),
        severity: 'HIGH'
      };
      this.violations.push(violation);
      console.error(`❌ API Contract Violation: ${method} ${url} returned ${status}, expected ${pattern.expectedSuccessStatus} or ${pattern.expectedErrorStatuses?.join(', ') || 'N/A'}`);
    } else {
      if (this.config.logResponses) {
        console.log(`✅ Status Code Valid: ${method} ${url} returned ${status}`);
      }
    }
  }
  
  validateResponseBody(responseData, pattern) {
    const { url, method, status, body } = responseData;
    
    try {
      // For JSON APIs, parse and validate structure
      if (this.isJsonResponse(responseData)) {
        const parsedBody = JSON.parse(body);
        
        // Validate error responses have proper error field
        if (status >= 400) {
          if (!parsedBody.error || typeof parsedBody.error !== 'string') {
            this.violations.push({
              type: 'INVALID_ERROR_FORMAT',
              url,
              method,
              status,
              issue: 'Error response missing or invalid error field',
              expectedFormat: '{ "error": "string" }',
              actualBody: body.substring(0, 200),
              timestamp: Date.now(),
              severity: 'MEDIUM'
            });
            console.error(`❌ API Contract Violation: Error response missing proper error format`);
          } else {
            if (this.config.logResponses) {
              console.log(`✅ Error Format Valid: ${method} ${url} has proper error format`);
            }
          }
        }
        
        // Validate success responses for specific endpoints
        if (status >= 200 && status < 300) {
          this.validateSuccessResponseStructure(responseData, pattern, parsedBody);
        }
      }
    } catch (parseError) {
      if (status < 400) {
        // Non-error responses should be valid JSON for API endpoints
        this.violations.push({
          type: 'INVALID_JSON_RESPONSE',
          url,
          method,
          status,
          issue: 'Response body is not valid JSON',
          parseError: parseError.message,
          timestamp: Date.now(),
          severity: 'HIGH'
        });
        console.error(`❌ API Contract Violation: Invalid JSON response`);
      }
    }
  }
  
  validateSuccessResponseStructure(responseData, pattern, parsedBody) {
    const { url, method, status } = responseData;
    
    // Campaign membership POST should return campaign object
    if (method === 'POST' && url.includes('/campaign_memberships')) {
      const requiredFields = ['id', 'name'];
      const missingFields = requiredFields.filter(field => !(field in parsedBody));
      
      if (missingFields.length > 0) {
        this.violations.push({
          type: 'MISSING_REQUIRED_FIELDS',
          url,
          method,
          status,
          issue: `Missing required fields in response: ${missingFields.join(', ')}`,
          requiredFields,
          actualFields: Object.keys(parsedBody),
          timestamp: Date.now(),
          severity: 'HIGH'
        });
        console.error(`❌ API Contract Violation: Missing required fields: ${missingFields.join(', ')}`);
      }
    }
    
    // Campaign membership DELETE should return empty response
    if (method === 'DELETE' && url.includes('/campaign_memberships')) {
      if (Object.keys(parsedBody).length > 0) {
        this.violations.push({
          type: 'UNEXPECTED_RESPONSE_BODY',
          url,
          method,
          status,
          issue: 'DELETE response should be empty',
          actualBody: JSON.stringify(parsedBody),
          timestamp: Date.now(),
          severity: 'LOW'
        });
        console.error(`❌ API Contract Violation: DELETE response should be empty`);
      }
    }
  }
  
  validateHeaders(responseData, pattern) {
    const { url, method, headers } = responseData;
    
    // Check Content-Type for JSON APIs
    if (this.isJsonApi(url)) {
      const contentType = headers['content-type'];
      if (contentType && !contentType.includes('application/json')) {
        this.violations.push({
          type: 'INVALID_CONTENT_TYPE',
          url,
          method,
          issue: `Expected application/json, got ${contentType}`,
          actualContentType: contentType,
          timestamp: Date.now(),
          severity: 'MEDIUM'
        });
        console.error(`❌ API Contract Violation: Invalid Content-Type: ${contentType}`);
      }
    }
  }
  
  isJsonResponse(responseData) {
    const contentType = responseData.headers['content-type'];
    return contentType && contentType.includes('application/json');
  }
  
  isJsonApi(url) {
    return url.includes('/api/');
  }
  
  findApiPattern(url, method) {
    const patterns = {
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
      },
      users_current: {
        url: /\/api\/v2\/users\/current/,
        method: 'GET',
        expectedSuccessStatus: 200,
        expectedErrorStatuses: [401, 500]
      },
      campaigns_list: {
        url: /\/api\/v2\/campaigns/,
        method: 'GET',
        expectedSuccessStatus: 200,
        expectedErrorStatuses: [401, 500]
      }
    };
    
    return Object.values(patterns).find(pattern => 
      pattern.url.test(url) && pattern.method === method
    );
  }
  
  // Validation methods for specific scenarios
  async waitForApiCall(urlPattern, method, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const checkForCall = () => {
        const matchingResponse = this.responses.find(r => 
          urlPattern.test(r.url) && r.method === method && r.timestamp >= startTime
        );
        
        if (matchingResponse) {
          resolve(matchingResponse);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`API call not found within ${timeout}ms: ${method} ${urlPattern}`));
        } else {
          setTimeout(checkForCall, 100);
        }
      };
      
      checkForCall();
    });
  }
  
  validateAuthenticationHeaders() {
    const unauthenticatedRequests = this.requests.filter(req => {
      const authHeader = req.headers['authorization'];
      return !authHeader || !authHeader.startsWith('Bearer ');
    });
    
    if (unauthenticatedRequests.length > 0) {
      unauthenticatedRequests.forEach(req => {
        this.violations.push({
          type: 'MISSING_AUTHENTICATION',
          url: req.url,
          method: req.method,
          issue: 'API request missing Bearer token authorization',
          timestamp: req.timestamp,
          severity: 'HIGH'
        });
      });
      console.error(`❌ Found ${unauthenticatedRequests.length} API requests without proper authentication`);
    }
    
    return unauthenticatedRequests.length === 0;
  }
  
  validateUuidParameters() {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalidUuidRequests = [];
    
    this.requests.forEach(req => {
      if (req.url.includes('/campaign_memberships') && req.method === 'DELETE') {
        try {
          const url = new URL(req.url);
          const campaignId = url.searchParams.get('campaign_id');
          const userId = url.searchParams.get('user_id');
          
          if (campaignId && !uuidRegex.test(campaignId)) {
            invalidUuidRequests.push({ ...req, issue: 'Invalid campaign_id UUID format' });
          }
          
          if (userId && !uuidRegex.test(userId)) {
            invalidUuidRequests.push({ ...req, issue: 'Invalid user_id UUID format' });
          }
        } catch (error) {
          // Ignore URL parsing errors
        }
      }
    });
    
    invalidUuidRequests.forEach(req => {
      this.violations.push({
        type: 'INVALID_UUID_FORMAT',
        url: req.url,
        method: req.method,
        issue: req.issue,
        timestamp: req.timestamp,
        severity: 'MEDIUM'
      });
    });
    
    return invalidUuidRequests.length === 0;
  }
  
  // Getter methods
  getViolations(severity = null) {
    if (severity) {
      return this.violations.filter(v => v.severity === severity);
    }
    return this.violations;
  }
  
  getNetworkSummary() {
    const severityCounts = this.violations.reduce((acc, violation) => {
      acc[violation.severity] = (acc[violation.severity] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalRequests: this.requests.length,
      totalResponses: this.responses.length,
      apiRequests: this.requests.filter(r => this.isApiRequest(r.url)).length,
      violations: this.violations.length,
      violationsBySeverity: severityCounts,
      timespan: {
        start: Math.min(...this.requests.map(r => r.timestamp)),
        end: Math.max(...this.responses.map(r => r.timestamp))
      }
    };
  }
  
  generateReport() {
    const summary = this.getNetworkSummary();
    const highViolations = this.getViolations('HIGH');
    const mediumViolations = this.getViolations('MEDIUM');
    const lowViolations = this.getViolations('LOW');
    
    return {
      summary,
      violations: {
        high: highViolations,
        medium: mediumViolations,
        low: lowViolations
      },
      recommendations: this.generateRecommendations()
    };
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    if (this.getViolations('HIGH').length > 0) {
      recommendations.push('Fix HIGH severity violations immediately - these indicate broken API contracts');
    }
    
    if (this.violations.some(v => v.type === 'MISSING_AUTHENTICATION')) {
      recommendations.push('Ensure all API requests include proper Bearer token authentication');
    }
    
    if (this.violations.some(v => v.type === 'INVALID_ERROR_FORMAT')) {
      recommendations.push('Standardize error response format to include "error" field with string message');
    }
    
    if (this.violations.some(v => v.type === 'UNEXPECTED_STATUS_CODE')) {
      recommendations.push('Review API endpoints returning unexpected status codes');
    }
    
    return recommendations;
  }
  
  // Cleanup method
  reset() {
    this.requests = [];
    this.responses = [];
    this.violations = [];
    this.capturedBodies.clear();
  }
}

module.exports = { NetworkValidator };