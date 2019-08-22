# frozen_string_literal: true

FactoryBot.define do
    factory :instructor do
        first_name { Faker::Name.first_name }
        last_name { Faker::Name.last_name }
        email { Faker::Internet.email("#{first_name} #{last_name}", '') }
        utorid { Faker::Internet.slug("#{last_name} #{first_name} #{Faker::Number.number(2)}", '') }
    end
end
