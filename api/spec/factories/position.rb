# frozen_string_literal: true

FactoryBot.define do
    year = Time.now.year
    factory :position do
        association :session, :fall # Have it be fall by default
        position_code { 'CSC148' }
        position_title { 'Introduction to Computer Science' }
        position_type { 'type name' }
        est_start_date { Time.new(year, 9, 1) }
        est_end_date { Time.new(year, 12, 31) }
        est_hours_per_assignment { 10 }
    end
end
