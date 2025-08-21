#!/bin/bash

# Create invitation and return URL for testing
# Usage: ./create-invitation.sh [email]

EMAIL=${1:-"testuser@example.com"}

echo "Creating invitation for: $EMAIL"

# Get JWT token
echo "Logging in..."
TOKEN=$(curl -s -X POST http://localhost:3000/users/sign_in \
  -H "Content-Type: application/json" \
  -d "{\"user\":{\"email\":\"progressions@gmail.com\",\"password\":\"password\"}}" \
  -i | grep -i '^authorization:' | cut -d' ' -f2- | tr -d '\r\n')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get authentication token"
  exit 1
fi

echo "✅ Got auth token"

# Create invitation
echo "Creating invitation..."
INVITATION=$(curl -s -X POST http://localhost:3000/api/v2/invitations \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d "{\"invitation\":{\"email\":\"$EMAIL\"}}")

# Extract invitation ID
INVITATION_ID=$(echo $INVITATION | jq -r '.id')

if [ "$INVITATION_ID" = "null" ] || [ -z "$INVITATION_ID" ]; then
  echo "❌ Failed to create invitation"
  echo "Response: $INVITATION"
  exit 1
fi

echo "✅ Invitation created successfully"
echo ""
echo "🎯 Invitation URL: http://localhost:3001/redeem/$INVITATION_ID"
echo ""
echo "📧 Email: $EMAIL"
echo "🆔 ID: $INVITATION_ID"