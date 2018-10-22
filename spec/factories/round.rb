# frozen_string_literal: true

FactoryBot.define do
  # Note that start_date and end_date are not defined here because session
  # sequences per year. To make sure you have the correct numbers, make sure
  # that when you create it, you fill out start_date and end_date attributes
  # based on the right year
  factory :round do
    sequence(:number)

    trait :fall do
      association :session, :fall
    end

    trait :winter do
      association :session, :winter
    end

    trait :summer do
      association :session, :summer
    end
  end
end
