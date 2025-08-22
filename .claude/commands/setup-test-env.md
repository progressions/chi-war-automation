---
description: Setup test environment - reset database and start servers
---

setup-test-env: Reset test database and start test servers.

```bash
# Reset test database
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
RAILS_ENV=test rails db:drop db:create db:migrate db:seed

# Kill existing test servers
pkill -f "port 3004" 2>/dev/null || true
pkill -f "port 3005" 2>/dev/null || true

# Start Rails test server (port 3004)
RAILS_ENV=test rails server -p 3004 &

# Start NextJS test server (port 3005)
cd ../shot-client-next
NODE_ENV=test npm run dev -- -p 3005 &

echo "✅ Test environment ready on ports 3004 (Rails) and 3005 (NextJS)"
