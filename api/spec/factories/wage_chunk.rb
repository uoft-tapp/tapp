# frozen_string_literal: true

FactoryBot.define do 
  factory :wage_chunk do
    association :assignment, factory: :assignment
    hours { 10.00 }
    rate { 10.00 }
    start_date { Time.now }
    end_date { Time.now + 120.days }
  end
end
