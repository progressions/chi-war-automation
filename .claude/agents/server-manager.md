# Server Manager Agent

## Purpose
This agent specializes in starting, stopping, and maintaining development and test servers for the Chi War application. It handles both Rails (backend) and Next.js (frontend) servers with proper environment setup.

## Server Configurations

### Development Environment
- **Rails Backend**: Port 3000 (uses development database)
- **Next.js Frontend**: Port 3001 (uses .env.development)
- **Purpose**: Regular development work

### Test Environment  
- **Rails Backend**: Port 3004 (uses test database with seed data)
- **Next.js Frontend**: Port 3005 (uses .env.test)
- **Purpose**: End-to-end testing with Playwright

## Commands

### Kill Servers

#### Kill All Servers (Development + Test)
```bash
pkill -f "rails server" ; pkill -f "puma" ; pkill -f "next-server" ; pkill -f "node.*3001" ; pkill -f "node.*3005" ; sleep 3
```

#### Kill Development Servers Only
```bash
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
```

#### Kill Test Servers Only
```bash
lsof -ti:3004 | xargs kill -9 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true
```

### Start Development Servers

#### Rails Development Server (Port 3000)
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
rails server -p 3000
```

#### Next.js Development Server (Port 3001)
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && \
npm run dev
```

#### Start Both Development Servers (Background)
```bash
# Kill existing servers first
pkill -f "rails server" ; pkill -f "puma" ; pkill -f "next-server" ; pkill -f "node.*3001" ; sleep 3

# Start Rails in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && rails server -p 3000' &

# Start Next.js in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && npm run dev' &

# Wait for servers to initialize
sleep 10

# Verify servers are running
curl -s http://localhost:3000/api/v2/users/current | head -1
curl -s http://localhost:3001 | head -1
```

### Start Test Servers

#### Prepare Test Database
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
RAILS_ENV=test rails db:drop db:create db:migrate db:seed
```

#### Rails Test Server (Port 3004)
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
RAILS_ENV=test rails server -p 3004
```

#### Next.js Test Server (Port 3005)
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && \
NODE_ENV=test npm run dev -- -p 3005
```

#### Start Both Test Servers (Background)
```bash
# Kill existing test servers
lsof -ti:3004 | xargs kill -9 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true
sleep 3

# Prepare test database
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
RAILS_ENV=test rails db:prepare

# Start Rails test server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && source ~/.rvm/scripts/rvm && rvm use 3.2.2 && RAILS_ENV=test rails server -p 3004' &

# Start Next.js test server in background
bash -c 'cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next && NODE_ENV=test npm run dev -- -p 3005' &

# Wait for servers to initialize
sleep 10

# Verify test servers are running
curl -s http://localhost:3004/api/v2/users/current | head -1
curl -s http://localhost:3005 | head -1
```

### Additional Services

#### Start Sidekiq (Background Jobs)
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
bundle exec sidekiq
```

#### Start Test Sidekiq
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server && \
source ~/.rvm/scripts/rvm && \
rvm use 3.2.2 && \
RAILS_ENV=test bundle exec sidekiq
```

## Health Checks

### Check Server Status
```bash
# Development servers
echo "Development Rails (3000):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v2/users/current
echo "Development Next.js (3001):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3001

# Test servers
echo "Test Rails (3004):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/api/v2/users/current
echo "Test Next.js (3005):" && curl -s -o /dev/null -w "%{http_code}" http://localhost:3005
```

### Check Which Ports Are In Use
```bash
echo "=== Active Server Ports ==="
lsof -i :3000 | grep LISTEN | head -1
lsof -i :3001 | grep LISTEN | head -1
lsof -i :3004 | grep LISTEN | head -1
lsof -i :3005 | grep LISTEN | head -1
```

## Important Notes

1. **Ruby Version**: Always use RVM with Ruby 3.2.2 for Rails commands
2. **Environment Variables**: 
   - Development: Default Rails environment, uses main database
   - Test: RAILS_ENV=test for Rails, NODE_ENV=test for Next.js
3. **Startup Time**:
   - Rails: Takes 8-10 seconds to fully initialize
   - Next.js: Takes 3-5 seconds with Turbopack
4. **Database**:
   - Development uses the main database
   - Test uses a separate test database that should be seeded
5. **Background Jobs**: Sidekiq is required for WebSocket and async features

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on specific port
lsof -ti:PORT_NUMBER | xargs kill -9
```

### Rails Won't Start
```bash
# Check Ruby version
ruby -v  # Should be 3.2.2

# Ensure RVM is loaded
source ~/.rvm/scripts/rvm && rvm use 3.2.2

# Check for bundle issues
bundle install
```

### Next.js Won't Start
```bash
# Check Node modules
npm install

# Clear Next.js cache
rm -rf .next
```

### Database Issues
```bash
# Reset development database
rails db:reset

# Reset test database
RAILS_ENV=test rails db:reset
```