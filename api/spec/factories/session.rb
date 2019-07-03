# frozen_string_literal: true

FactoryBot.define do
    # Start the sequence at the current year. Note that every call to create a new session will have a new year.
    sequence(:year, Time.now.year)

    factory :session do
        rate1 { 20.00 }
        rate2 { 30.00 }

        trait :fall do
            start_date { Time.new(year, 9, 1) }
            end_date { Time.new(year, 12, 31) }
            semester "#{year} Fall"
        end

        trait :winter do
            start_date { Time.new(year, 1, 1) }
            end_date { Time.new(year, 4, 30) }
            semester "#{year} Winter"
        end

        trait :summer do
            start_date { Time.new(year, 5, 1) }
            end_date { Time.new(year, 8, 31) }
            semester "#{year} Summer"
        end
    end
end
