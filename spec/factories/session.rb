# frozen_string_literal: true

FactoryBot.define do
  factory :session do
    pay { 20.00 }
    year { Time.now.year } # Set it to the current year

    trait :fall do
      session_start { Time.new(Time.now.year, 9) }
      session_end { Time.new(Time.now.year, 12, 31) }
      semester { Session.semesters[:fall] }
    end

    trait :winter do
      session_start { Time.new(Time.now.year, 1) }
      session_end { Time.new(Time.now.year, 4, 31) }
      semester { Session.semesters[:winter] }
    end

    trait :summer do
      session_start { Time.new(Time.now.year, 5) }
      session_end { Time.new(Time.now.year, 8, 31) }
      semester { Session.semesters[:summer] }
    end
  end
end
