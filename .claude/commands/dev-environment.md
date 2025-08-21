---
description: Start up development environment, with Rails server and NextJS server.
---

**Individual Server Startup:**

For Rails development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-server
source ~/.rvm/scripts/rvm && rvm use 3.2.2
rails server -p 3000
```

For Next.js development server:
```bash
cd /Users/isaacpriestley/tech/isaacpriestley/chi-war/shot-client-next
npm run dev
```

**Notes:**
- Rails development server takes ~8-10 seconds to fully start
- Next.js server is usually ready in ~3-5 seconds with Turbopack
- Both servers should show proper error responses when running correctly
- Rails development environment uses the main database (not test database)

- [ ] Kill any Rails server that's still running on port 3000
- [ ] Kill any Next.js server that's still running on port 3001
- [ ] Start Rails server on port 3000 using the above commands
- [ ] Start Next.js server on port 3001 using the above commands
