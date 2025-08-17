#!/usr/bin/env ruby

# Confirm the test user for authentication
user = User.find_by(email: 'progressions@gmail.com')
if user
  user.confirmed_at = Time.current
  user.save!
  puts "User confirmed: #{user.confirmed_at}"
  puts "User confirmed?: #{user.confirmed?}"
else
  puts "User not found"
end