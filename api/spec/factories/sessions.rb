# frozen_string_literal: true

FactoryBot.define do
    # Start the sequence at the current year. Note that every call to create a
    # new session will have a new year.
    year = Time.now.year
    factory :session do
        rate1 { 20.00 }
        trait :fall do
            start_date { Time.new(year, 9, 1) }
            end_date { Time.new(year, 12, 31) }
            name { 'Fall Session' }
        end

        trait :winter do
            start_date { Time.new(year + 1, 1, 1) }
            end_date { Time.new(year + 1, 4, 30) }
            name { 'Winter Session' }
        end

        trait :summer do
            start_date { Time.new(year + 1, 5, 1) }
            end_date { Time.new(year + 1, 8, 31) }
            name { 'Summer Session' }
        end
    end
end

# == Schema Information
#
# Table name: sessions
#
#  id         :integer          not null, primary key
#  start_date :datetime
#  end_date   :datetime
#  name       :string
#  rate1      :float
#  rate2      :float
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
