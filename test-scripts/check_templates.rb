#!/usr/bin/env ruby
require_relative '../shot-server/config/environment'

puts "Template Characters in Test Database:"
puts "======================================"

templates = Character.where(is_template: true)

if templates.empty?
  puts "No template characters found in database!"
  puts "Character creation may not work without templates."
else
  templates.each do |char|
    archetype = char.action_values['Archetype'] rescue 'Unknown'
    puts "#{char.name}: #{archetype}"
  end
end

puts "\nTotal template characters: #{templates.count}"