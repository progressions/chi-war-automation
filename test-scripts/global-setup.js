// Global Setup for Chi War Playwright Tests
// Ensures test environment is properly configured before running tests

const TEST_CONFIG = require('./test-config');

async function globalSetup() {
  console.log('🚀 Chi War Test Suite - Global Setup Starting...');
  
  // Wait for servers to be ready
  const { chromium } = require('playwright');
  
  console.log('⏳ Waiting for servers to be ready...');
  
  // Check Rails server
  let railsReady = false;
  let attempts = 0;
  const maxAttempts = 30;
  
  while (!railsReady && attempts < maxAttempts) {
    try {
      const response = await fetch(TEST_CONFIG.getBackendUrl() + '/api/v2/health');
      if (response.status === 404 || response.status === 401) {
        // 404 or 401 means server is responding (even if endpoint doesn't exist)
        railsReady = true;
        console.log('✅ Rails server is ready');
      }
    } catch (error) {
      attempts++;
      console.log(`⏳ Waiting for Rails server... (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!railsReady) {
    throw new Error('❌ Rails server failed to start within timeout period');
  }
  
  // Check Next.js server
  let nextReady = false;
  attempts = 0;
  
  while (!nextReady && attempts < maxAttempts) {
    try {
      const response = await fetch(TEST_CONFIG.getFrontendUrl());
      if (response.status === 200 || response.status === 302) {
        nextReady = true;
        console.log('✅ Next.js server is ready');
      }
    } catch (error) {
      attempts++;
      console.log(`⏳ Waiting for Next.js server... (attempt ${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  if (!nextReady) {
    throw new Error('❌ Next.js server failed to start within timeout period');
  }
  
  console.log('✅ Global setup completed - servers are ready');
}

module.exports = globalSetup;