# frozen_string_literal: true

FactoryBot.define do
  factory :application do
    association :session, factory: :session
    comments {"Hello there"}
  end
end

