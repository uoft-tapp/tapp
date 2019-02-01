# frozen_string_literal: true

FactoryBot.define do
  # Note that open_date and close_date are not defined here because session
  # sequences per year. To make sure you have the correct data, make sure
  # that when you create it, you fill out open_date and close_date attributes
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
