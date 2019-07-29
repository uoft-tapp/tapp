# frozen_string_literal: true

FactoryBot.define do
  factory :application do
    association :session
    comments {"Hello there"}
  end
end

