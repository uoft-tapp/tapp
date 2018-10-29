# frozen_string_literal: true

FactoryBot.define do
  factory :preference do
    association :position
    association :applicant

    trait :high do
      priority { 3 }
    end

    trait :medium do
      priority { 2 }
    end

    trait :low do
      priority { 1 }
    end
  end
end
