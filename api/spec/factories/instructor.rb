# frozen_string_literal: true

# Note that since instructor is in a has many relationship with positions, you should manually create
# them in conjunction in any spec
FactoryBot.define do
  factory :instructor do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    email { Faker::Internet.email("#{first_name} #{last_name}", '') }
    utorid { Faker::Internet.slug("#{last_name} #{first_name} #{Faker::Number.number(2)}", '') }

    factory :instructor_with_positions do
      after(:build) do |instructor, evaluatlor|
        position = FactoryBot.create(:position, instructors: [instructor])
        instructor.positions = [position]
      end
    end
  end
end
