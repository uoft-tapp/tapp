# frozen_string_literal: true

FactoryBot.define do
    factory :posting do
        open_date { '2021-03-14 18:33:53' }
        close_date { '2021-03-14 18:33:53' }
        status { 1 }
        description { 'MyText' }
        custom_questions { 'MyText' }
        position_ad_info { nil }
    end
end
