#!/usr/bin/env ruby

# Create unconfirmed test user for E2E testing
# Run from shot-server directory

# Add the Rails app to the load path
require_relative '../shot-server/config/environment'

Rails.application.eager_load!

# Set Rails environment
Rails.env = 'test'

puts "Creating unconfirmed test user..."

# Check if user already exists
email = 'unconfirmed-test@example.com'
existing_user = User.find_by(email: email)

if existing_user
  puts "User already exists: #{email}"
  puts "Confirmed: #{existing_user.confirmed?}"
  puts "Confirmed at: #{existing_user.confirmed_at}"
  
  # Make sure the user is unconfirmed
  unless existing_user.confirmed?
    puts "✅ User is already unconfirmed - perfect for testing"
  else
    puts "Making user unconfirmed for testing..."
    existing_user.update!(confirmed_at: nil, confirmation_token: Devise.friendly_token)
    puts "✅ User is now unconfirmed"
  end
else
  # Create new unconfirmed user
  puts "Creating new unconfirmed user..."
  user = User.create!(
    email: email,
    password: 'TestPassword123!',
    password_confirmation: 'TestPassword123!',
    name: 'Test Unconfirmed User'
  )
  
  # Make sure user is unconfirmed (should be by default)
  if user.confirmed?
    user.update!(confirmed_at: nil, confirmation_token: Devise.friendly_token)
  end
  
  puts "✅ Created unconfirmed user: #{email}"
  puts "ID: #{user.id}"
  puts "Confirmed: #{user.confirmed?}"
end

# Also check for existing confirmed users
confirmed_users = User.where.not(confirmed_at: nil)
puts "\nConfirmed users in test database:"
confirmed_users.each do |user|
  puts "- #{user.email} (#{user.name || 'No name'})"
end

puts "\nTest data setup complete!"