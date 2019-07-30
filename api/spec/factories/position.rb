# frozen_string_literal: true

FactoryBot.define do
  factory :position do
    association :session, :fall # Have it be fall by default
    
    position_code { 'CSC148' }
    position_title { 'Introduction to Computer Science' }
    est_hours_per_assignment { 60.00 }
    est_start_date { Time.now }
    est_end_date { Time.now + 120.days }
    position_type { "Some role" }
    
    factory :position_with_instructors do
      after(:build) do |position, evaluator|
        instructor = FactoryBot.create(:instructor, positions: [position])
        position.instructors = [instructor]
      end
    end
  end
end
