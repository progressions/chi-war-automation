# Testing Guide for Chi War Application

This guide provides instructions for setting up and running tests in the Chi War application.

## Overview

The Chi War application uses separate test environments to avoid interfering with development work:

- **Development Servers**: Rails (port 3000), Next.js (port 3001)
- **Test Servers**: Rails (port 3004), Next.js (port 3005)
- **Test Database**: Isolated test database with seeded data

## Test Environment Setup

### Prerequisites

- Ruby 3.2.2 (managed via RVM)
- Node.js and npm
- PostgreSQL running
- Playwright installed

### 1. Clear and Setup Test Database

Always start with a clean test database:

```bash
# Navigate to Rails backend
cd shot-server

# Switch to correct Ruby version
source ~/.rvm/scripts/rvm && rvm use 3.2.2

# Reset test database completely
RAILS_ENV=test rails db:drop db:create db:migrate db:seed

# Verify seed data was created
RAILS_ENV=test rails console --no-sandbox -e "
puts 'Test DB: ' + ActiveRecord::Base.connection.current_database
puts 'User count: ' + User.count.to_s
puts 'Test users:'
User.all.each {|u| puts \"  #{u.email} - confirmed: #{u.confirmed?}\"}
exit
"
```

Expected output should show:
- Test users: `progressions@gmail.com` (gamemaster) and `player@example.com` (player)
- Both users should be confirmed
- Test campaigns should exist

### 2. Kill Existing Test Servers

Before starting test servers, kill any existing processes on test ports (leave development servers alone):

```bash
# Kill only test servers (ports 3004/3005)
pkill -f "port 3004"
pkill -f "port 3005"
lsof -ti:3004 | xargs kill -9 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true

# Verify test ports are free
lsof -i :3004
lsof -i :3005
# Should show no output if ports are free
```

### 3. Start Test Servers

#### Start Rails Test Server (Port 3004)

```bash
# From shot-server directory
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
RAILS_ENV=test rails server -p 3004
```

Keep this running in a separate terminal. The server should start without errors.

#### Start Next.js Test Server (Port 3005)

```bash
# From shot-client-next directory in another terminal
cd shot-client-next

# Use .env.test for test configuration
NODE_ENV=test npm run dev -- -p 3005
```

The Next.js server will automatically use `.env.test` which points to the Rails test server on port 3004.

### 4. Verify Test Environment

Before running tests, verify both servers are responding:

```bash
# Test Rails API (should return 401 unauthorized - this is expected)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/api/v2/users/current
# Expected: 401

# Test Next.js frontend (should return 200 or 307 redirect)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005
# Expected: 200 or 307
```

## Running Tests

### End-to-End Tests

With test servers running, execute E2E tests from the test-scripts directory:

```bash
cd test-scripts

# Run email change protection tests
node test-email-change-protection-e2e.js

# Run other E2E tests
node test-invitation-simple.js
node test-profile-page.js
```

### Backend Tests (RSpec)

```bash
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
bundle exec rspec
```

### Frontend Unit Tests (When Jest is configured)

```bash
cd shot-client-next
npm test
```

Note: Jest configuration is pending. See issue `2025-08-22-configure-jest-unit-testing.md`

## Test Configuration Files

### Environment Configuration

- **`.env.test`**: Next.js test environment variables
  ```
  NEXT_PUBLIC_API_BASE_URL="http://localhost:3004"
  NEXT_PUBLIC_SERVER_URL="http://localhost:3004"
  NEXT_PUBLIC_WEBSOCKET_URL="http://localhost:3004"
  ```

- **`config/environments/test.rb`**: Rails test environment configuration

### Test Data

The test database is seeded with:

- **Gamemaster**: `progressions@gmail.com` (password: `password`)
- **Player**: `player@example.com` (password: `password`)
- **Campaigns**: "Test Campaign", "Secondary Campaign", "Third Campaign"
- **Characters**: Sample test characters
- **User Memberships**: Player is member of multiple campaigns

## Troubleshooting

### Common Issues

#### "Login timeout" or "Can't authenticate"
- Verify test database is seeded correctly
- Check that Rails test server is running on port 3004
- Ensure `.env.test` points to correct Rails server URL

#### "Connection refused" errors
- Check that both test servers are running
- Verify ports 3004/3005 are not blocked
- Kill any conflicting processes on test ports

#### "Test database empty"
- Run `RAILS_ENV=test rails db:reset db:migrate db:seed`
- Verify seed output shows user creation

#### "Wrong Ruby version"
- Ensure RVM is loaded: `source ~/.rvm/scripts/rvm`
- Switch to correct version: `rvm use 3.2.2`

### Debug Commands

```bash
# Check what's running on test ports
lsof -i :3004
lsof -i :3005

# Check test database users
cd shot-server
RAILS_ENV=test rails runner "User.all.each {|u| puts \"#{u.email} - #{u.confirmed?}\"}"

# Check Rails test server health
curl http://localhost:3004/api/v2/users/current

# Check Next.js test server health
curl http://localhost:3005
```

### Clean Reset

If tests are consistently failing, perform a complete reset:

```bash
# Kill all test processes
pkill -f "port 3004"
pkill -f "port 3005"

# Reset test database
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
RAILS_ENV=test rails db:drop db:create db:migrate db:seed

# Restart test servers and try again
```

## Test Scripts

### Available E2E Tests

- `test-email-change-protection-e2e.js` - Email change confirmation dialog
- `test-invitation-simple.js` - User invitation flow
- `test-profile-page.js` - Profile page functionality
- `test-campaign-activation.js` - Campaign switching
- `test-character-creation.js` - Character creation flow

### Test Results

Test results and screenshots are saved to `test-scripts/test-results/` directory.

## CI/CD Considerations

For automated testing environments:

1. Use Docker containers for consistent environments
2. Set up test database reset in CI pipeline
3. Use headless Playwright configuration
4. Ensure proper cleanup between test runs

## Development vs Test Isolation

**Important**: Always use dedicated test servers and database:

- ✅ **Correct**: Test servers (3004/3005) with test database
- ❌ **Wrong**: Running tests against development servers (3000/3001)

This isolation ensures:
- Development work is not interrupted by tests
- Test data doesn't pollute development database
- Tests run with consistent, known data state