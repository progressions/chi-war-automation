---
description: Stop test servers and clean up test processes
---

cleanup-test-env: Stop all test servers and clean up processes.

```bash
echo "🧹 Cleaning up test environment..."

echo "🔄 Stopping test servers..."
pkill -f "port 3004" 2>/dev/null || true
pkill -f "port 3005" 2>/dev/null || true
lsof -ti:3004 | xargs kill -9 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true

echo "🔍 Verifying ports are free..."
if lsof -i :3004 >/dev/null 2>&1; then
    echo "⚠️  Port 3004 still in use"
else
    echo "✅ Port 3004 is free"
fi

if lsof -i :3005 >/dev/null 2>&1; then
    echo "⚠️  Port 3005 still in use"
else
    echo "✅ Port 3005 is free"
fi

echo "✅ Cleanup complete!"
```