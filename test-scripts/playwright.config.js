// Playwright Configuration for Chi War E2E Tests
// This configuration optimizes Playwright for Chi War testing scenarios

const { defineConfig, devices } = require('@playwright/test');
const TEST_CONFIG = require('./test-config');

module.exports = defineConfig({
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: TEST_CONFIG.getFrontendUrl(),
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Browser timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        // Keep browser open for debugging
        launchOptions: {
          slowMo: process.env.DEBUG ? 1000 : 0,
          headless: process.env.CI ? true : false,
        }
      },
    },
    // Uncomment for additional browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Run local dev servers before starting the tests
  webServer: [
    {
      command: 'cd ../shot-server && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails server -p 3000',
      port: 3000,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'cd ../shot-client-next && npm run dev',
      port: 3001,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./global-setup.js'),
  globalTeardown: require.resolve('./global-teardown.js'),

  // Test output directory
  outputDir: 'test-results',
  
  // Global timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
});