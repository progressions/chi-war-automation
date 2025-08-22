---
description: Run Rails RSpec tests
---

run-specs: Run Rails backend tests.

```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
RAILS_ENV=test bundle exec rspec

echo "✅ RSpec tests complete"
