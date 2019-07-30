# frozen_string_literal: true

FactoryBot.define do
  factory :reporting_tag do
    association :wage_chunk, factory: :wage_chunk
    association :position, factory: :position

    name { "Reporting tag 1" }
  end
end
