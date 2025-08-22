---
description: Run complete test suite - setup environment and execute all tests
---

test-full: Execute the complete testing workflow by setting up environment and running all test suites.

```bash
echo "🚀 Starting full test suite..."

echo "📋 Step 1: Setting up test environment..."
claude setup-test-env

echo "📋 Step 2: Running E2E tests..."
claude run-e2e-tests

echo "📋 Step 3: Running backend tests..."
claude run-backend-tests

echo "📋 Step 4: Running frontend tests..."
claude run-frontend-tests

echo "🎉 Full test suite complete!"
```