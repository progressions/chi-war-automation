---
description: Run E2E tests
---

run-e2e: Run all E2E tests from test-scripts directory.

```bash
cd test-scripts

# Set test environment variables
export TEST_BASE_URL="http://localhost:3005"
export API_BASE_URL="http://localhost:3004"

# Run all test files
for test_file in *.js; do
    if [ -f "$test_file" ]; then
        echo "Running: $test_file"
        NODE_ENV=test node "$test_file"
    fi
done

echo "✅ E2E tests complete"
