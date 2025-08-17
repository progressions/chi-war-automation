#!/usr/bin/env ruby

# Test Devise authentication
user = User.find_by(email: 'progressions@gmail.com')
puts "User found: #{user.present?}"
if user
  puts "Testing Devise password== method:"
  puts "user.password == 'password': #{user.password == 'password'}"
  puts "user.password == 'wrong': #{user.password == 'wrong'}"
  puts "user.password.class: #{user.password.class}"
  puts "user.respond_to?(:password): #{user.respond_to?(:password)}"
end