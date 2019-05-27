# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default
# values. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup).


# a = Applicant.create(
#   first_name: 'George',
#   last_name: 'Wu',
#   utorid: 'wugeorge',
#   student_number: '1000136937',
#   email: 'george.wu.sample@mail.utoronto.ca',
#   phone: '6473879674',
#   address: '130 St. George Street',
#   dept: 'Computer Science',
#   year_in_program: 4,
#   is_grad_student: false,
#   is_full_time: true
# )
# s = Session.create(
#   year: 2018,
#   semester: 'fall',
#   pay: 42.25,
#   start_date: DateTime.new(2018, 9, 1),
#   end_date: DateTime.new(2018, 12, 31),
# )
# p = Position.create(
#   session: s, # session is a ruby obj ref
#   course_code: 'CSC148H1F',
#   course_name: 'Introduction to Computer Science',
#   current_enrolment: 500,
#   duties: 'Lead labs',
#   qualifications: 'Well versed in Python',
#   hours: 54,
#   cap_enrolment: 500,
#   num_waitlisted: 100,
#   start_date: DateTime.new(2018, 9, 10),
#   end_date: DateTime.new(2018, 12, 10),
#   openings: 40
# )

# # perference is assembled by ref
# Preference.create(
#   position: p,
#   applicant: a,
#   priority: 1
# )
# i = Instructor.create(
#   first_name: 'Paul',
#   last_name: 'Brown',
#   email: 'paul.brown.sample@utoronto.ca',
#   utorid: 'brownpau'
# )

# p.instructors << i

# user1 = User.create(
#   utorid: 'brownpau',
#   role: 'instructor'
# )

# user2 = User.create(
#   utorid: 'admintes',
#   role: 'admin'
# )

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


puts applicants
