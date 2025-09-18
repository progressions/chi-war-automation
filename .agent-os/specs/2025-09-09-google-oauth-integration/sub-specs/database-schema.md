# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-09-09-google-oauth-integration/spec.md

## Schema Changes

### Add OAuth Fields to Users Table

```ruby
class AddOauthFieldsToUsers < ActiveRecord::Migration[7.2]
  def change
    # OAuth provider fields
    add_column :users, :provider, :string
    add_column :users, :uid, :string
    
    # Google profile data
    add_column :users, :google_avatar_url, :string
    add_column :users, :google_refresh_token, :text
    add_column :users, :google_token_expires_at, :datetime
    
    # OAuth metadata
    add_column :users, :oauth_linked_at, :datetime
    add_column :users, :last_oauth_login_at, :datetime
    
    # Indexes for performance
    add_index :users, [:provider, :uid], unique: true
    add_index :users, :uid
    add_index :users, :provider
    
    # Composite index for OAuth lookups
    add_index :users, [:email, :provider]
  end
end
```

### Create OAuth Audit Log Table

```ruby
class CreateOauthAuditLogs < ActiveRecord::Migration[7.2]
  def change
    create_table :oauth_audit_logs, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, null: false
      t.string :event_type, null: false # login, register, link, unlink, refresh
      t.string :provider, null: false
      t.string :ip_address
      t.string :user_agent
      t.jsonb :metadata, default: {}
      t.datetime :occurred_at, null: false
      
      t.timestamps
    end
    
    add_index :oauth_audit_logs, :user_id
    add_index :oauth_audit_logs, :event_type
    add_index :oauth_audit_logs, :occurred_at
    add_index :oauth_audit_logs, [:user_id, :occurred_at]
  end
end
```

### Create OAuth Sessions Table (for Refresh Token Management)

```ruby
class CreateOauthSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :oauth_sessions, id: :uuid do |t|
      t.references :user, type: :uuid, foreign_key: true, null: false
      t.string :provider, null: false
      t.text :encrypted_refresh_token
      t.string :encrypted_refresh_token_iv
      t.datetime :expires_at
      t.datetime :last_refreshed_at
      t.string :device_fingerprint
      t.boolean :active, default: true
      
      t.timestamps
    end
    
    add_index :oauth_sessions, [:user_id, :provider, :active]
    add_index :oauth_sessions, :expires_at
    add_index :oauth_sessions, [:user_id, :active]
  end
end
```

## Specifications

### Users Table Modifications

**OAuth Provider Fields:**
- `provider`: Stores OAuth provider name ('google' for Google OAuth)
- `uid`: Unique identifier from Google for the user
- Composite unique index on [provider, uid] prevents duplicate OAuth accounts

**Google Profile Data:**
- `google_avatar_url`: URL to user's Google profile picture
- `google_refresh_token`: Encrypted storage of refresh token for token rotation
- `google_token_expires_at`: Expiration timestamp for access token management

**OAuth Metadata:**
- `oauth_linked_at`: Timestamp when Google account was linked
- `last_oauth_login_at`: Track most recent OAuth authentication

### OAuth Audit Logs Table

**Purpose:** Track all OAuth-related events for security and debugging
- Records login, registration, linking, unlinking, and token refresh events
- Stores IP address and user agent for security analysis
- JSONB metadata field for flexible event-specific data storage

### OAuth Sessions Table

**Purpose:** Manage refresh tokens with enhanced security
- Encrypted storage of refresh tokens with IV for AES encryption
- Device fingerprinting for session security
- Support for multiple active sessions per user
- Automatic expiration handling

## Rationale

### Security Considerations
- **Encrypted refresh tokens**: Prevents token theft if database is compromised
- **Unique constraints**: Ensures one Google account maps to one user account
- **Audit logging**: Provides forensic capabilities for security incidents
- **Session management**: Allows revocation of compromised sessions

### Performance Considerations
- **Composite indexes**: Optimizes OAuth lookup queries during authentication
- **JSONB for metadata**: Flexible storage without schema changes
- **UUID primary keys**: Consistent with existing schema patterns
- **Selective indexing**: Balances query performance with write overhead

### Data Integrity Rules
- **Foreign key constraints**: Maintains referential integrity with users table
- **Non-null constraints**: Ensures required OAuth data is always present
- **Default values**: Provides sensible defaults for boolean and JSONB fields
- **Timestamp tracking**: Enables temporal queries and audit trails