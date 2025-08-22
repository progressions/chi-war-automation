# API Patterns

## Required Pattern for All API Calls

**Always use the useClient hook:**

```javascript
import { useClient } from "@/contexts"

function MyComponent() {
  const { client } = useClient()
  
  // Use client for API calls
  const fetchData = async () => {
    const response = await client.get('/api/endpoint')
    return response.data
  }
}
```

## What NOT to Use

❌ **Never use these directly:**
- `fetch()`
- `axios`
- `XMLHttpRequest`
- Any other direct HTTP libraries

## Examples

### ✅ Correct
```javascript
import { useClient } from "@/contexts"

const { client } = useClient()
const users = await client.get('/api/users')
const newUser = await client.post('/api/users', userData)
```

### ❌ Incorrect
```javascript
// Don't do this
const response = await fetch('/api/users')
const users = await axios.get('/api/users')
```

## Why This Pattern?

This ensures consistent:
- Authentication handling
- Error management
- Request/response interceptors
- Base URL configuration