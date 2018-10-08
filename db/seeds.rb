# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default
# values. The data can then be loaded with the rails db:seed command (or created alongside the
# database with db:setup).

a = Applicant.create(
  first_name: 'George',
  last_name: 'Wu',
  utorid: 'wugeorge',
  student_number: '1000136937',
  email: 'george.wu.sample@mail.utoronto.ca',
  phone: '6473879674',
  address: '130 St. George Street',
  dept: 'Computer Science',
  year_in_program: 4,
  is_grad_student: false,
  is_full_time: true
)
s = Session.create(
  year: 2018,
  semester: 'Fall',
  pay: 42.25,
  round: 1,
  session_start: DateTime.new(2018, 9, 1),
  session_end: DateTime.new(2018, 12, 31),
  round_start: DateTime.new(2018, 7, 10),
  round_end: DateTime.new(2018, 8, 20)
)
p = Position.create(
  session: s,
  course_code: 'CSC148H1F',
  course_name: 'Introduction to Computer Science',
  current_enrolment: 500,
  duties: 'Lead labs',
  qualifications: 'Well versed in Python',
  hours: 54,
  cap_enrolment: 500,
  num_waitlisted: 100,
  openings: 40
)
Preference.create(
  position: p,
  applicant: a,
  priority: 1
)
i = Instructor.create(
  first_name: 'Paul',
  last_name: 'Brown',
  email: 'paul.brown.sample@utoronto.ca',
  utorid: 'brownpau'
)
p.instructors << i
