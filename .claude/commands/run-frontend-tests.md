---
description: Run Next.js Jest tests (when configured)
---

run-frontend-tests: Execute Next.js frontend unit tests.

```bash
cd shot-client-next

echo "⚛️  Running Next.js Jest tests..."
npm test -- --detectOpenHandles --forceExit --testTimeout=10000

echo "✅ Frontend tests complete!"
```