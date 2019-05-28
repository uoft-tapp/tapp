# frozen_string_literal: true

# Seed data is contained in the json files under seed folder. This file serves as the script of 
# pasing json file and create tables from the parsed data. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup). For testing purpose, use db:reset to reload all the table.

seed_data_dir = Rails.root.join('db', 'seed')

# applicants
data = File.read("#{seed_data_dir}/applicant.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("applicant")
applicants = json_data.map do |row|
  Applicant.create!(row.with_indifferent_access)
end

# sessions
data = File.read("#{seed_data_dir}/session.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("session")
sessions = json_data.map do |row|
  Session.create!(row.with_indifferent_access)
end

# positions
data = File.read("#{seed_data_dir}/position.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("position")
positions = json_data.map do |row|
  s = sessions[row["session_index"]]
  row = row.except("session_index").merge(session: s)
  Position.create!(row.with_indifferent_access)
end

# preference
data = File.read("#{seed_data_dir}/preference.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("preference")
preference = json_data.map do |row|
  a = applicants[row["applicant_index"]]
  p = positions[row["position_index"]]
  row = row.except("applicant_index").merge(applicant: a)
  row = row.except("position_index").merge(position: p)
  Preference.create!(row.with_indifferent_access)
end

# instructors
data = File.read("#{seed_data_dir}/instructor.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("instructor")
instructors = json_data.map do |row|
  position_indexes = row["position_index"]
  row = row.except("position_index")
  i = Instructor.create!(row.with_indifferent_access)
  position_indexes.each do |p|
    i.positions << positions[p]
    i.save
  end
end

# users
data = File.read("#{seed_data_dir}/user.json")
raise JSON::ParserError.new("the source file is empty") if data.strip.length == 0
json_data = JSON.parse(data).fetch("user")
users = json_data.map do |row|
  User.create!(row.with_indifferent_access)
end
