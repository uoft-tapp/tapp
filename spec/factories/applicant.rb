# frozen_string_literal: true

FactoryBot.define do
  factory :applicant do |a|
    trait :full do
      a.first_name { Faker::Name.first_name }
      a.last_name { Faker::Name.last_name }
      a.email { Faker::Internet.email }
      a.student_number { Faker::Number.number(10) }
      a.utorid { Faker::Internet.slug("#{a.last_name} #{a.first_name} #{Faker::Number.number(2)}", '') }
    end
  end
end
