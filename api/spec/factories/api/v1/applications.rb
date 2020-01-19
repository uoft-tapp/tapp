# frozen_string_literal: true

FactoryBot.define do
    factory :api_v1_application, class: 'Api::V1::Application' do
        session { nil }
        comments { 'MyText' }
    end
end
