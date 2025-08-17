#!/usr/bin/env ruby

# Test authentication in Rails console
user = User.find_by(email: 'progressions@gmail.com')
puts "User found: #{user.present?}"
if user
  puts "User ID: #{user.id}"
  puts "User password attribute: #{user.password.inspect}"
  puts "User encrypted_password: #{user.encrypted_password.present?}"
  
  # Test direct password comparison (as used in controller)
  puts "Direct password comparison ('password' == user.password): #{'password' == user.password}"
  
  # Test proper Devise validation
  puts "Devise password validation: #{user.valid_password?('password')}"
end