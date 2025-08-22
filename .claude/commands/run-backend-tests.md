---
description: Run Rails RSpec tests
---

run-backend-tests: Execute Rails backend tests using RSpec.

```bash
cd shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2

echo "🔬 Running Rails RSpec tests..."
RAILS_ENV=test bundle exec rspec

echo "✅ Backend tests complete!"
```