# frozen_string_literal: true

FactoryBot.define do
  factory :assignment do
    association :applicant, factory: :applicant
    association :position, factory: :position

    contract_start { Time.now }
    contract_end { Time.now + 120.days }
    note { "This is a note" }
    offer_override_pdf { "/tmp/override.pdf" }
  end
end
