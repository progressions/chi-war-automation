# Implementing OTP Passwordless Authentication in Chi War

**Date:** December 5, 2025

Passwords are a friction point in any application. Users forget them, reuse them across services, and increasingly expect alternatives. This post documents the implementation of OTP (One-Time Password) passwordless authentication for Chi War, providing users with a modern login option that doesn't require remembering yet another password.

## What the Feature Does

The OTP passwordless login system offers two authentication methods alongside traditional password login:

1. **Email Verification Codes** - Users enter their email address and receive a 6-digit numeric code
2. **Magic Links** - Users receive a clickable link that automatically authenticates them

Both methods eliminate the password entirely from the login flow while maintaining security through time-limited, single-use tokens.

## The User Experience

The login page now presents a tabbed interface allowing users to choose their preferred authentication method:

```
┌─────────────┬─────────────┐
│  Password   │ Email Code  │
└─────────────┴─────────────┘
```

Selecting "Email Code" initiates a two-step flow:

1. **Email Entry** - User provides their email address
2. **Code Verification** - User enters the 6-digit code received via email

The interface provides clear feedback at each stage, including loading states, success messages, and error handling.

## Technical Implementation

### Frontend Architecture

The login page uses React state to manage the authentication flow:

```typescript
type LoginMethod = "password" | "otp"

const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")
const [otpSent, setOtpSent] = useState(false)
const [otpEmail, setOtpEmail] = useState("")
const [otpCode, setOtpCode] = useState("")
```

The OTP code input enforces numeric-only entry with automatic filtering:

```typescript
<TextField
  label="Login Code"
  value={otpCode}
  onChange={e => {
    const value = e.target.value.replace(/\D/g, "")
    setOtpCode(value)
  }}
  inputProps={{
    maxLength: 6,
    inputMode: "numeric",
    pattern: "[0-9]*",
    style: { letterSpacing: "0.5em", textAlign: "center" },
  }}
/>
```

### API Client Layer

The authentication client exposes three new methods:

```typescript
// Request an OTP code to be sent via email
async function requestOtp(email: string): Promise<AxiosResponse<OtpRequestResponse>> {
  return postPublic(api.otpRequest(), { email })
}

// Verify a 6-digit OTP code
async function verifyOtp(
  email: string,
  code: string
): Promise<AxiosResponse<OtpVerifyResponse>> {
  return postPublic(api.otpVerify(), { email, code })
}

// Verify a magic link token
async function verifyMagicLink(token: string): Promise<AxiosResponse<OtpVerifyResponse>> {
  return getPublic(api.otpMagicLink(token))
}
```

A key implementation detail: these endpoints required a new `postPublic` method in the base client. Standard API calls include JWT authentication headers, but login operations must work for unauthenticated users:

```typescript
async function postPublic<T>(
  url: string,
  data: Parameters_ = {}
): Promise<AxiosResponse<T>> {
  return axios.post(url, data)
}
```

### Magic Link Verification Page

The magic link handler (`/login/otp`) automatically verifies tokens from URL parameters:

```typescript
function MagicLinkHandler() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!token) {
        setStatus("error")
        setErrorMessage("Invalid magic link - no token provided")
        return
      }

      try {
        const client = createClient()
        const response = await client.verifyMagicLink(token)

        if (response.data.token) {
          // Store JWT, fetch user data, redirect
          Cookies.set("jwtToken", response.data.token, { ... })
          setStatus("success")
          setTimeout(() => router.push("/"), 1500)
        }
      } catch (error) {
        setStatus("error")
        setErrorMessage("Failed to verify magic link")
      }
    }

    verifyMagicLink()
  }, [token])
}
```

### Type Safety

The feature includes comprehensive TypeScript definitions:

```typescript
interface OtpRequestResponse {
  message: string
}

interface OtpVerifyResponse {
  token?: string
  message?: string
}

interface SignInError {
  message?: string
  error_type?: "unconfirmed_account"
  email?: string
}
```

The `signIn` method uses a discriminated union to provide type-safe error handling:

```typescript
async function signIn(credentials: SignInCredentials): Promise<
  | { success: true; token: string }
  | { success: false; error: SignInError }
>
```

This pattern allows callers to narrow the type based on the `success` property:

```typescript
const result = await client.signIn({ email, password })

if (!result.success) {
  if (result.error.error_type === "unconfirmed_account") {
    // Handle unconfirmed account specifically
  }
  // TypeScript knows result.error exists here
}
```

## Challenges Faced

### Async Testing with React

The most significant challenge was testing components that perform asynchronous operations in `useEffect`. React Testing Library requires careful handling of state updates:

```typescript
// Wrapping render in act() ensures useEffect completes
await act(async () => {
  render(<MagicLinkPage />)
})

// waitFor handles the async verification
await waitFor(() => {
  expect(screen.getByText(/login successful/i)).toBeInTheDocument()
})
```

Tests that use `jest.useFakeTimers()` (for testing redirect delays) needed isolation to prevent interference with promise resolution:

```typescript
it("redirects to home after successful login", async () => {
  jest.useFakeTimers()

  // ... setup and render ...

  await waitFor(() => {
    expect(screen.getByText(/login successful/i)).toBeInTheDocument()
  })

  jest.advanceTimersByTime(1500)
  expect(mockPush).toHaveBeenCalledWith("/")

  jest.useRealTimers()
})
```

### State Reset on Tab Switching

When users switch between Password and Email Code tabs, state needs to reset appropriately:

```typescript
const handleTabChange = (_: React.SyntheticEvent, newValue: LoginMethod) => {
  setLoginMethod(newValue)
  setError(null)
  setSuccessMessage(null)
  setIsUnconfirmed(false)
  setOtpSent(false)
  setOtpCode("")
}
```

This prevents stale error messages from one tab appearing in another, and ensures the OTP flow restarts from the email entry step.

### Security: Preventing Email Enumeration

The backend API returns a success response regardless of whether the email exists. This prevents attackers from using the OTP request endpoint to enumerate valid email addresses:

```typescript
// The API always returns success to prevent email enumeration,
// so errors here are network/server errors
setSuccessMessage(
  response.data.message || "Check your email for a login code"
)
```

## Test Coverage

The feature includes 35 tests across two test files:

**LoginPage.test.tsx (22 tests)**
- Tab navigation and state management
- Password login with error handling
- OTP request flow with success/error cases
- OTP code verification
- Unconfirmed account handling
- Redirect after login

**MagicLinkPage.test.tsx (13 tests)**
- Loading state during verification
- Successful verification flow
- JWT cookie and user context handling
- Error states for missing/invalid/expired tokens
- Suspense fallback rendering

## Improving User Experience

This feature addresses several user experience concerns:

1. **Reduced Friction** - Users who don't remember their password can still log in quickly
2. **Mobile-Friendly** - Numeric keypad appears on mobile devices for code entry
3. **Clear Feedback** - Loading states, success messages, and error explanations at each step
4. **Recovery Path** - "Use a different email" button allows users to correct mistakes
5. **Graceful Degradation** - Traditional password login remains available

## Future Considerations

Several enhancements could build on this foundation:

- **Rate Limiting UI** - Display remaining attempts and cooldown periods
- **Code Resend** - Button to request a new code without starting over
- **Remember Device** - Reduce OTP frequency for trusted devices
- **SMS Delivery** - Alternative delivery channel for users who prefer SMS
- **Passkey Integration** - WebAuthn support for truly passwordless authentication

## Conclusion

OTP passwordless authentication represents a meaningful improvement to Chi War's login experience. The implementation maintains security while reducing the friction of password-based authentication. With comprehensive test coverage and proper error handling, the feature is ready for production use.

The tabbed interface allows users to choose their preferred method without hiding the traditional password option, providing flexibility while encouraging adoption of the passwordless flow. As the application moves toward beta, this authentication foundation will support the growing user base with modern, secure login options.
