# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

session = Session.new({
  start_date: Time.zone.now,
  end_date: Time.zone.now.end_of_year,
  name: "Fall 2019 Session",
  rate1: 40
})

session.save!
session.contract_templates.create!
session.positions.new({
  contract_template: session.contract_templates.first,
  position_code: "Position 1"
})


session2 = Session.new({
  start_date: Time.zone.now.end_of_year + 1.day,
  end_date: Time.zone.now.end_of_year + 1.day + 4.months,
  name: "Winter 2020 Session",
  rate1: 40
})
session2.save!

applicant1 = Applicant.new({
  "utorid": "A",
  "email": "A",
  "first_name": "A",
  "last_name": "A",
  "student_number": "A"
})

applicant2 = Applicant.new({
  "utorid": "B",
  "email": "B",
  "first_name": "B",
  "last_name": "B",
  "student_number": "B"
})

applicant3 = Applicant.new({
  "utorid": "C",
  "email": "C",
  "first_name": "C",
  "last_name": "C",
  "student_number": "C"
})

applicant1.save!
applicant2.save!
applicant3.save!

application = Application.new({
  session: session,
  applicant: applicant1
})

application.save!

application2 = Application.new({
  session: session2,
  applicant: applicant1,
})

application3 = Application.new({
  session: session,
  applicant: applicant1,
})

application3.save!

ApplicantDataForMatching.create!({
  applicant: applicant1,
  application: application,
})

contract_template = ContractTemplate.new({
  session: session
})
contract_template.save!

position = Position.new({
  contract_template: contract_template,
  position_code: "Position for ABC",
  session: session
})

position.save!