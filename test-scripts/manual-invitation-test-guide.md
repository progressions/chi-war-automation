# Manual Invitation Redemption Test Guide

This guide provides step-by-step instructions for manually testing the complete invitation redemption flow.

## Prerequisites

1. Start development servers:
   ```bash
   # Terminal 1 - Rails server
   cd shot-server && rails server -p 3004
   
   # Terminal 2 - Next.js server  
   cd shot-client-next && npm run dev -p 3005
   ```

2. Ensure test users exist in database:
   - Gamemaster: `progressions@gmail.com` / `password`
   - Player: `player@example.com` / `password`

## Test Flow

### Step 1: Create Invitation (as Gamemaster)

1. Open browser to `http://localhost:3001/login`
2. Login as gamemaster: `progressions@gmail.com` / `password`
3. Navigate to Campaigns page
4. Click on "Test Campaign" 
5. Scroll to Invitations section
6. Click "MANAGE" button for Invitations
7. Enter test email: `test-user-{timestamp}@example.com`
8. Click "Invite" button
9. **CAPTURE the invitation ID** from the network tab or backend logs

### Step 2: Test Public Invitation Access

1. Open new incognito/private browser window
2. Navigate to: `http://localhost:3001/redeem/{invitation-id}`
3. **Verify**: Page shows invitation details without requiring login
4. **Verify**: Campaign name "Test Campaign" is displayed
5. **Verify**: Gamemaster name is shown
6. **Verify**: "Login to Accept" button is visible

### Step 3: Test Login Redirect

1. Click "Login to Accept" button
2. **Verify**: Redirected to `/login` with return URL parameter
3. **Verify**: URL contains `redirect=%2Fredeem%2F{invitation-id}`

### Step 4: Complete Redemption (as Player)

1. Login as player: `player@example.com` / `password`
2. **Verify**: Automatically redirected back to invitation page
3. **Verify**: Button now shows "Accept Invitation"
4. **Verify**: User sees invitation details
5. Click "Accept Invitation"
6. **Verify**: Success message appears
7. **Verify**: Redirected to campaign page OR homepage with success toast

### Step 5: Verify Invitation Consumed

1. Open new browser window
2. Try to access the same invitation URL: `http://localhost:3001/redeem/{invitation-id}`
3. **Verify**: Shows "not found" or appropriate error message

## Expected Results

- ✅ Public invitation page accessible without authentication
- ✅ Login redirect preserves return URL
- ✅ Authenticated user can accept invitation
- ✅ User is added to campaign
- ✅ Invitation is consumed after successful redemption
- ✅ Appropriate error handling for invalid/used invitations

## API Endpoints Tested

- `GET /api/v2/invitations/{id}` - Public invitation details
- `POST /api/v2/invitations/{id}/redeem` - Redeem invitation (authenticated)

## Frontend Routes Tested

- `/redeem/{id}` - Public invitation redemption page
- `/login?redirect=/redeem/{id}` - Login with redirect

## Alternative Testing with cURL

If you want to test the API directly:

```bash
# Get invitation details (public)
curl http://localhost:3000/api/v2/invitations/{invitation-id}

# Redeem invitation (requires JWT token)
curl -X POST http://localhost:3000/api/v2/invitations/{invitation-id}/redeem \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json"
```

## Notes

- The email template has been enhanced with professional styling
- All error cases are handled gracefully
- Real-time updates via ActionCable when users join campaigns
- Frontend includes comprehensive error handling for edge cases
