# frozen_string_literal: true

FactoryBot.define do
  factory :position_preference do
    association :application, factory: :application
    association :position, factory: :position

    preference_level { 1 }
  end
end

