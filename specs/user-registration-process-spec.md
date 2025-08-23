# User Registration Process Specification

**Date**: 2025-08-23  
**Status**: Draft  
**Version**: 1.0  
**Related Issue**: issues/2025-08-23-user-registration-process.md

## Executive Summary

This specification defines the implementation of a complete user registration system that allows new users to create accounts independently. The system will integrate with the existing Devise authentication infrastructure and provide both backend API endpoints and frontend registration forms.

## Goals

1. **Enable self-registration** - Allow users to create accounts without admin intervention
2. **Integrate with existing auth system** - Use Devise JWT tokens and patterns
3. **Provide complete user onboarding** - Include email confirmation workflow
4. **Maintain security standards** - Implement proper validation and rate limiting
5. **Support invitation flow** - Allow registration via invitation redemption

## Technical Architecture

### Backend Implementation

#### Registration Controller
```ruby
# app/controllers/api/v2/registrations_controller.rb
class Api::V2::RegistrationsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:create]
  
  # POST /api/v2/registrations
  def create
    @user = User.new(registration_params)
    
    if @user.save
      # Send confirmation email if configured
      @user.send_confirmation_instructions if @user.respond_to?(:send_confirmation_instructions)
      
      render json: { 
        message: "Registration successful. Please check your email to confirm your account.",
        user: UserSerializer.new(@user)
      }, status: :created
    else
      render json: { errors: @user.errors }, status: :unprocessable_entity
    end
  end
  
  private
  
  def registration_params
    params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
  end
end
```

#### Routes Configuration
```ruby
# config/routes.rb
namespace :api do
  namespace :v2 do
    resources :registrations, only: [:create]
    # ... existing routes
  end
end
```

#### User Model Updates
```ruby
# app/models/user.rb (validation enhancements)
class User < ApplicationRecord
  # existing devise modules
  devise :database_authenticatable, :registerable, :confirmable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist
  
  validates :email, presence: true, uniqueness: { case_sensitive: false }
  validates :first_name, presence: true, length: { minimum: 2 }
  validates :last_name, presence: true, length: { minimum: 2 }
  validates :password, length: { minimum: 8 }, if: :password_required?
  
  private
  
  def password_required?
    new_record? || !password.nil?
  end
end
```

### Frontend Implementation

#### Registration Page
```typescript
// src/app/register/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Box, Container, Paper, Typography, Link as MuiLink } from "@mui/material"
import Link from "next/link"
import { RegistrationForm } from "@/components/auth/RegistrationForm"
import { useToast } from "@/contexts"

export default function RegisterPage() {
  const router = useRouter()
  const { toastSuccess, toastError } = useToast()
  
  const handleRegistrationSuccess = () => {
    toastSuccess("Registration successful! Please check your email to confirm your account.")
    router.push("/login")
  }
  
  const handleRegistrationError = (error: string) => {
    toastError(error)
  }
  
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Paper elevation={3} sx={{ padding: 4, width: "100%" }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join Chi War to manage your Feng Shui 2 campaigns
          </Typography>
          
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onError={handleRegistrationError}
          />
          
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account?{" "}
              <Link href="/login" passHref>
                <MuiLink>Sign in</MuiLink>
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}
```

#### Registration Form Component
```typescript
// src/components/auth/RegistrationForm.tsx
"use client"

import { useState } from "react"
import { Box, Stack, TextField, Button, Alert, InputAdornment, IconButton } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useClient } from "@/contexts"
import type { RegistrationData } from "@/types/auth"

interface RegistrationFormProps {
  onSuccess: () => void
  onError: (error: string) => void
}

export function RegistrationForm({ onSuccess, onError }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: ""
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  
  const { client } = useClient()
  
  const handleChange = (field: keyof RegistrationData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value })
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: [] })
    }
  }
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setErrors({})
    
    try {
      await client.register(formData)
      onSuccess()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        onError("Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }
  
  const getFieldError = (field: string): string => {
    return errors[field]?.[0] || ""
  }
  
  const hasFieldError = (field: string): boolean => {
    return errors[field]?.length > 0
  }
  
  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="First Name"
            value={formData.first_name}
            onChange={handleChange("first_name")}
            error={hasFieldError("first_name")}
            helperText={getFieldError("first_name")}
            disabled={loading}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.last_name}
            onChange={handleChange("last_name")}
            error={hasFieldError("last_name")}
            helperText={getFieldError("last_name")}
            disabled={loading}
            required
          />
        </Stack>
        
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={hasFieldError("email")}
          helperText={getFieldError("email")}
          disabled={loading}
          required
        />
        
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange("password")}
          error={hasFieldError("password")}
          helperText={getFieldError("password")}
          disabled={loading}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        <TextField
          fullWidth
          label="Confirm Password"
          type={showPasswordConfirmation ? "text" : "password"}
          value={formData.password_confirmation}
          onChange={handleChange("password_confirmation")}
          error={hasFieldError("password_confirmation")}
          helperText={getFieldError("password_confirmation")}
          disabled={loading}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  edge="end"
                >
                  {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        
        {Object.keys(errors).length > 0 && (
          <Alert severity="error">
            Please correct the errors above and try again.
          </Alert>
        )}
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </Stack>
    </Box>
  )
}
```

### API Client Updates
```typescript
// src/lib/client/authClient.ts (add registration method)
export function createAuthClient(deps: ClientDependencies) {
  const { apiV2 } = deps
  const { post } = createBaseClient(deps)
  
  // existing methods...
  
  async function register(data: RegistrationData): Promise<AxiosResponse<{ message: string, user: User }>> {
    return post(apiV2.registrations(), { user: data })
  }
  
  return {
    // existing methods...
    register
  }
}
```

### Type Definitions
```typescript
// src/types/auth.ts
export interface RegistrationData {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
}
```

## Testing Strategy

### Backend RSpec Tests
```ruby
# spec/requests/api/v2/registrations_spec.rb
require "rails_helper"

RSpec.describe "Api::V2::Registrations", type: :request do
  describe "POST /api/v2/registrations" do
    let(:valid_attributes) do
      {
        email: "newuser@example.com",
        password: "password123",
        password_confirmation: "password123",
        first_name: "John",
        last_name: "Doe"
      }
    end
    
    context "with valid parameters" do
      it "creates a new user" do
        expect {
          post "/api/v2/registrations", params: { user: valid_attributes }
        }.to change { User.count }.by(1)
        
        expect(response).to have_http_status(:created)
        body = JSON.parse(response.body)
        expect(body["message"]).to include("Registration successful")
        expect(body["user"]["email"]).to eq("newuser@example.com")
      end
      
      it "sends confirmation email" do
        expect {
          post "/api/v2/registrations", params: { user: valid_attributes }
        }.to have_enqueued_mail(Devise::Mailer, :confirmation_instructions)
      end
    end
    
    context "with invalid parameters" do
      it "returns errors for missing required fields" do
        post "/api/v2/registrations", params: { user: { email: "" } }
        
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]).to have_key("email")
        expect(body["errors"]).to have_key("password")
        expect(body["errors"]).to have_key("first_name")
        expect(body["errors"]).to have_key("last_name")
      end
      
      it "returns error for duplicate email" do
        User.create!(valid_attributes.merge(confirmed_at: Time.now))
        
        post "/api/v2/registrations", params: { user: valid_attributes }
        
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]["email"]).to include("has already been taken")
      end
      
      it "returns error for password mismatch" do
        invalid_attributes = valid_attributes.merge(password_confirmation: "different")
        
        post "/api/v2/registrations", params: { user: invalid_attributes }
        
        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["errors"]["password_confirmation"]).to include("doesn't match Password")
      end
    end
  end
end
```

### Frontend Playwright E2E Test
```javascript
// test-scripts/test-user-registration.js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting User Registration Test');
    
    // Step 1: Navigate to registration page
    console.log('📍 Navigating to registration page...');
    await page.goto('http://localhost:3001/register');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Fill out registration form
    console.log('📝 Filling out registration form...');
    const timestamp = Date.now();
    const testEmail = `test_user_${timestamp}@example.com`;
    
    await page.fill('input[label="First Name"]', 'Test');
    await page.fill('input[label="Last Name"]', 'User');
    await page.fill('input[label="Email Address"]', testEmail);
    await page.fill('input[label="Password"]', 'password123');
    await page.fill('input[label="Confirm Password"]', 'password123');
    
    // Step 3: Submit registration
    console.log('🚀 Submitting registration...');
    await page.click('button:has-text("Create Account")');
    
    // Step 4: Wait for success message and redirect
    await page.waitForURL('**/login', { timeout: 10000 });
    await page.waitForSelector('text=Registration successful', { timeout: 5000 });
    console.log('✅ Registration successful, redirected to login');
    
    // Step 5: Verify user can login with new credentials
    console.log('🔐 Testing login with new credentials...');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard or campaigns page
    await page.waitForURL('**/campaigns', { timeout: 10000 });
    console.log('✅ Login successful with new credentials');
    
    // Step 6: Verify user profile shows correct information
    console.log('👤 Verifying user profile...');
    await page.goto('http://localhost:3001/profile');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[value="' + testEmail + '"]');
    await expect(emailField).toBeVisible();
    console.log('✅ User profile shows correct email');
    
    // Take final screenshot
    await page.screenshot({ 
      path: 'test-results/user-registration-test-complete.png', 
      fullPage: true 
    });
    
    console.log('✅ All registration tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ 
      path: 'test-results/user-registration-test-error.png', 
      fullPage: true 
    });
    throw error;
  } finally {
    await browser.close();
  }
})();
```

## Implementation Phases

### Phase 1: Backend Implementation (3 hours)
1. Create registrations controller
2. Add routes configuration
3. Update user model validations
4. Write and run RSpec tests
5. Test API endpoints manually

### Phase 2: Frontend Implementation (4 hours)
1. Create registration page
2. Create registration form component
3. Update API client with registration method
4. Add type definitions
5. Integrate with existing authentication flow

### Phase 3: Integration and Polish (2 hours)
1. Add proper error handling and loading states
2. Implement client-side validation
3. Add accessibility features
4. Test mobile responsiveness
5. Cross-browser testing

### Phase 4: End-to-End Testing (2 hours)
1. Create Playwright test suite
2. Test complete registration flow
3. Test error scenarios
4. Verify email confirmation workflow
5. Performance and security testing

## Success Criteria

### Functional Requirements
- ✅ Users can create accounts via registration form
- ✅ Email validation prevents duplicate accounts
- ✅ Password confirmation prevents typos
- ✅ Registration integrates with existing JWT authentication
- ✅ Email confirmation workflow functions correctly
- ✅ User can login immediately after registration (if confirmed)

### Non-Functional Requirements
- ✅ Registration form is mobile responsive
- ✅ Form provides clear error messages
- ✅ Registration completes within 3 seconds
- ✅ Accessible UI with proper ARIA labels
- ✅ 90%+ test coverage for registration flow

### Security Requirements
- ✅ Password strength validation
- ✅ Email format validation
- ✅ Protection against duplicate registrations
- ✅ No sensitive information in error messages
- ✅ Rate limiting on registration endpoint

## Future Enhancements

### Invitation-Based Registration
- Allow registration via invitation redemption
- Pre-fill invitation recipient information
- Automatic campaign membership on acceptance

### Enhanced Onboarding
- Welcome email sequence
- Profile completion prompts
- Tutorial or guided tour for new users

### Social Registration
- Google OAuth integration
- Discord OAuth integration
- Social profile import

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Spam registrations | High | Implement rate limiting, CAPTCHA if needed |
| Email delivery failures | Medium | Clear messaging, admin notification system |
| Password security | High | Strong validation, secure password requirements |
| User confusion | Medium | Clear UI/UX, helpful error messages |

## Approval and Sign-off

This specification is ready for implementation.

**Created by**: Claude Code  
**Date**: 2025-08-23  
**Version**: 1.0

---

## Appendix: API Endpoints

### Registration Endpoint
```
POST /api/v2/registrations
Content-Type: application/json

{
  "user": {
    "email": "user@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Success Response (201 Created)
```json
{
  "message": "Registration successful. Please check your email to confirm your account.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "confirmed": false
  }
}
```

#### Error Response (422 Unprocessable Entity)
```json
{
  "errors": {
    "email": ["has already been taken"],
    "password": ["is too short (minimum is 8 characters)"],
    "password_confirmation": ["doesn't match Password"]
  }
}
```