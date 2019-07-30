# frozen_string_literal: true

FactoryBot.define do
  factory :position_template do
    association :session, factory: :session, traits: :fall

    position_type { "TA Job" }
    offer_template { "/tmp/template" }
  end
end
