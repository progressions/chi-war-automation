#!/usr/bin/env node

// Test Runner Utility for Chi War Application
// Provides coordinated test execution across backend and frontend

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const TEST_CONFIG = require('./test-config')
class TestRunner {
  constructor() {
    this.rootDir = path.dirname(__dirname);
    this.serverDir = path.join(this.rootDir, 'shot-server');
    this.clientDir = path.join(this.rootDir, 'shot-client-next');
    this.testScriptsDir = path.join(this.rootDir, 'test-scripts');
    
    this.serverProcess = null;
    this.clientProcess = null;
    
    this.results = {
      backend_unit: null,
      backend_integration: null,
      backend_contract: null,
      frontend_e2e: null,
      enhanced_e2e: null
    };
  }
  
  async runTestSuite(suite) {
    console.log(`🚀 Starting test suite: ${suite}`);
    
    switch (suite) {
      case 'backend-unit':
        return await this.runBackendUnitTests();
      case 'backend-integration':
        return await this.runBackendIntegrationTests();
      case 'backend-contract':
        return await this.runBackendContractTests();
      case 'backend-all':
        return await this.runAllBackendTests();
      case 'e2e-basic':
        return await this.runBasicE2ETests();
      case 'e2e-enhanced':
        return await this.runEnhancedE2ETests();
      case 'full-suite':
        return await this.runFullTestSuite();
      case 'campaign-memberships':
        return await this.runCampaignMembershipTests();
      default:
        throw new Error(`Unknown test suite: ${suite}`);
    }
  }
  
  async runBackendUnitTests() {
    console.log('🧪 Running backend unit tests...');
    
    const testFiles = [
      'spec/models/',
      'spec/services/',
      'spec/jobs/'
    ];
    
    return await this.runRSpecTests(testFiles.join(' '));
  }
  
  async runBackendIntegrationTests() {
    console.log('🔗 Running backend integration tests...');
    
    const testFiles = [
      'spec/requests/api/v2/campaign_memberships_integration_spec.rb'
    ];
    
    return await this.runRSpecTests(testFiles.join(' '));
  }
  
  async runBackendContractTests() {
    console.log('📋 Running backend contract tests...');
    
    const testFiles = [
      'spec/requests/api/v2/campaign_memberships_contract_spec.rb'
    ];
    
    return await this.runRSpecTests(testFiles.join(' '));
  }
  
  async runCampaignMembershipTests() {
    console.log('🎯 Running all campaign membership tests...');
    
    const testFiles = [
      'spec/requests/api/v2/campaign_memberships_spec.rb',
      'spec/requests/api/v2/campaign_memberships_integration_spec.rb',
      'spec/requests/api/v2/campaign_memberships_contract_spec.rb'
    ];
    
    return await this.runRSpecTests(testFiles.join(' '));
  }
  
  async runAllBackendTests() {
    console.log('🏗️ Running all backend tests...');
    
    const results = {};
    
    try {
      results.unit = await this.runBackendUnitTests();
      results.integration = await this.runBackendIntegrationTests();
      results.contract = await this.runBackendContractTests();
      
      const allPassed = Object.values(results).every(r => r.success);
      
      return {
        success: allPassed,
        results: results,
        summary: this.generateBackendSummary(results)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: results
      };
    }
  }
  
  async runBasicE2ETests() {
    console.log('🌐 Running basic E2E tests...');
    
    try {
      await this.ensureServersRunning();
      
      const result = await this.runNodeTest('test-current-campaign-clearing-e2e.js');
      
      return {
        success: result.exitCode === 0,
        output: result.output,
        duration: result.duration
      };
    } finally {
      // Keep servers running for potential subsequent tests
    }
  }
  
  async runEnhancedE2ETests() {
    console.log('🔍 Running enhanced E2E tests with network validation...');
    
    try {
      await this.ensureServersRunning();
      
      const result = await this.runNodeTest('test-current-campaign-clearing-enhanced-e2e.js');
      
      return {
        success: result.exitCode === 0,
        output: result.output,
        duration: result.duration,
        networkViolations: this.extractNetworkViolations(result.output)
      };
    } finally {
      // Keep servers running for potential subsequent tests
    }
  }
  
  async runFullTestSuite() {
    console.log('🎯 Running full test suite...');
    
    const results = {};
    let overallSuccess = true;
    
    try {
      // Run backend tests first
      console.log('📊 Phase 1: Backend Tests');
      results.backend = await this.runAllBackendTests();
      overallSuccess = overallSuccess && results.backend.success;
      
      // Run E2E tests
      console.log('📊 Phase 2: E2E Tests');
      results.e2e_basic = await this.runBasicE2ETests();
      overallSuccess = overallSuccess && results.e2e_basic.success;
      
      results.e2e_enhanced = await this.runEnhancedE2ETests();
      overallSuccess = overallSuccess && results.e2e_enhanced.success;
      
      return {
        success: overallSuccess,
        results: results,
        summary: this.generateFullSuiteSummary(results)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results: results
      };
    } finally {
      await this.cleanup();
    }
  }
  
  async runRSpecTests(testPath) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const command = `cd ${this.serverDir} && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && bundle exec rspec ${testPath}`;
      
      exec(command, { shell: '/bin/bash', maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
        const duration = Date.now() - startTime;
        
        const output = stdout + stderr;
        const success = error === null;
        
        // Parse RSpec output for detailed results
        const examples = this.parseRSpecOutput(output);
        
        resolve({
          success,
          exitCode: error ? error.code : 0,
          output,
          duration,
          examples,
          command
        });
      });
    });
  }
  
  async runNodeTest(testFile) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const testPath = path.join(this.testScriptsDir, testFile);
      
      const child = spawn('node', [testPath], {
        cwd: this.testScriptsDir,
        stdio: 'pipe'
      });
      
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        const duration = Date.now() - startTime;
        
        resolve({
          exitCode: code,
          output,
          duration,
          testFile
        });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      // Kill test after 5 minutes if it doesn't complete
      setTimeout(() => {
        child.kill('SIGTERM');
      }, 5 * 60 * 1000);
    });
  }
  
  async ensureServersRunning() {
    console.log('🚦 Ensuring test servers are running...');
    
    // Check if servers are already running
    const backendRunning = await this.checkServerRunning('TEST_CONFIG.getBackendUrl()/api/v2/users/current');
    const frontendRunning = await this.checkServerRunning(TEST_CONFIG.getFrontendUrl());
    
    if (!backendRunning) {
      console.log('🔄 Starting backend server...');
      await this.startBackendServer();
      await this.waitForServer('TEST_CONFIG.getBackendUrl()/api/v2/users/current');
    }
    
    if (!frontendRunning) {
      console.log('🔄 Starting frontend server...');
      await this.startFrontendServer();
      await this.waitForServer(TEST_CONFIG.getFrontendUrl());
    }
    
    console.log('✅ Servers are running');
  }
  
  async startBackendServer() {
    return new Promise((resolve) => {
      const command = `cd ${this.serverDir} && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails db:prepare && RAILS_ENV=test rails server -p 3000`;
      
      this.serverProcess = spawn('bash', ['-c', command], {
        detached: true,
        stdio: 'pipe'
      });
      
      // Give the server time to start
      setTimeout(resolve, 10000);
    });
  }
  
  async startFrontendServer() {
    return new Promise((resolve) => {
      this.clientProcess = spawn('npm', ['run', 'dev'], {
        cwd: this.clientDir,
        detached: true,
        stdio: 'pipe'
      });
      
      // Give the server time to start
      setTimeout(resolve, 8000);
    });
  }
  
  async checkServerRunning(url) {
    try {
      // Use curl instead of fetch for Node.js compatibility
      return new Promise((resolve) => {
        exec(`curl -s ${url}`, (error, stdout, stderr) => {
          resolve(error === null);
        });
      });
    } catch (error) {
      return false;
    }
  }
  
  async waitForServer(url, maxWait = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      if (await this.checkServerRunning(url)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error(`Server at ${url} did not start within ${maxWait}ms`);
  }
  
  parseRSpecOutput(output) {
    const lines = output.split('\n');
    const examples = { total: 0, passed: 0, failed: 0, pending: 0 };
    const failures = [];
    
    // Look for RSpec summary line
    const summaryLine = lines.find(line => line.includes('examples,'));
    if (summaryLine) {
      const match = summaryLine.match(/(\d+) examples?, (\d+) failures?(?:, (\d+) pending)?/);
      if (match) {
        examples.total = parseInt(match[1]);
        examples.failed = parseInt(match[2]);
        examples.pending = parseInt(match[3]) || 0;
        examples.passed = examples.total - examples.failed - examples.pending;
      }
    }
    
    // Extract failure details
    let inFailureSection = false;
    let currentFailure = null;
    
    for (const line of lines) {
      if (line.includes('Failures:')) {
        inFailureSection = true;
        continue;
      }
      
      if (inFailureSection && line.match(/^\s*\d+\)/)) {
        if (currentFailure) failures.push(currentFailure);
        currentFailure = { description: line.trim(), details: [] };
      } else if (currentFailure && line.trim()) {
        currentFailure.details.push(line.trim());
      }
    }
    
    if (currentFailure) failures.push(currentFailure);
    
    return { ...examples, failures };
  }
  
  extractNetworkViolations(output) {
    const violations = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('API Contract Violation:')) {
        violations.push(line);
      }
    }
    
    return violations;
  }
  
  generateBackendSummary(results) {
    const totalExamples = Object.values(results).reduce((sum, r) => sum + (r.examples?.total || 0), 0);
    const totalPassed = Object.values(results).reduce((sum, r) => sum + (r.examples?.passed || 0), 0);
    const totalFailed = Object.values(results).reduce((sum, r) => sum + (r.examples?.failed || 0), 0);
    
    return {
      totalExamples,
      totalPassed,
      totalFailed,
      successRate: totalExamples > 0 ? (totalPassed / totalExamples * 100).toFixed(1) : 0
    };
  }
  
  generateFullSuiteSummary(results) {
    const summary = {
      backend: results.backend?.summary || {},
      e2e: {
        basic: results.e2e_basic?.success || false,
        enhanced: results.e2e_enhanced?.success || false,
        networkViolations: results.e2e_enhanced?.networkViolations?.length || 0
      }
    };
    
    return summary;
  }
  
  async cleanup() {
    console.log('🧹 Cleaning up test processes...');
    
    // Kill spawned processes
    if (this.serverProcess) {
      process.kill(-this.serverProcess.pid);
    }
    
    if (this.clientProcess) {
      process.kill(-this.clientProcess.pid);
    }
    
    // Kill any remaining processes
    try {
      exec('pkill -f "rails server" ; pkill -f "next-server" ; pkill -f "node.*3001"');
    } catch (error) {
      // Ignore errors from pkill
    }
  }
  
  printResults(results) {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    if (results.summary) {
      if (results.summary.backend) {
        const backend = results.summary.backend;
        console.log(`Backend Tests: ${backend.totalPassed}/${backend.totalExamples} passed (${backend.successRate}%)`);
      }
      
      if (results.summary.e2e) {
        const e2e = results.summary.e2e;
        console.log(`E2E Basic: ${e2e.basic ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`E2E Enhanced: ${e2e.enhanced ? '✅ PASSED' : '❌ FAILED'}`);
        if (e2e.networkViolations > 0) {
          console.log(`⚠️ Network Violations: ${e2e.networkViolations}`);
        }
      }
    }
    
    console.log(`\nOverall: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
  }
}

// CLI interface
async function main() {
  const suite = process.argv[2] || 'campaign-memberships';
  const runner = new TestRunner();
  
  try {
    const results = await runner.runTestSuite(suite);
    runner.printResults(results);
    
    process.exit(results.success ? 0 : 1);
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { TestRunner };