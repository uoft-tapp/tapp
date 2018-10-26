# frozen_string_literal: true

FactoryBot.define do
  # Start the sequence at the current year. Note that every call to create a new session will have a new year.
  sequence(:year, Time.now.year)

  factory :session do
    pay { 20.00 }
    year # Set it to the sequence

    trait :fall do
      start_date { Time.new(year, 9, 1) }
      end_date { Time.new(year, 12, 31) }
      semester { Session.semesters[:fall] }
    end

    trait :winter do
      start_date { Time.new(year, 1, 1) }
      end_date { Time.new(year, 4, 30) }
      semester { Session.semesters[:winter] }
    end

    trait :summer do
      start_date { Time.new(year, 5, 1) }
      end_date { Time.new(year, 8, 31) }
      semester { Session.semesters[:summer] }
    end
  end
end
