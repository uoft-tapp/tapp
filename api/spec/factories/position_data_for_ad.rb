# frozen_string_literal: true

FactoryBot.define do
  factory :position_data_for_ad do
    association :position, factory: :position

    duties { "Please do TA stuff" }
    qualifications { "Be a student" }
    ad_hours_per_assignment { 20.00 }
    ad_num_assignments { 10 }
    ad_open_date {Time.now - 10.days}
    ad_close_date {Time.now + 30.days}
  end
end
