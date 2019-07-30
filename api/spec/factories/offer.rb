# frozen_string_literal: true

FactoryBot.define do
  factory :offer do
    association :assignment
    
    offer_template { "/tmp/offer_template.pdf" }
    first_time_ta { true }
    instructor_contact_desc { "someemail@email.com" }
    pay_period_desc { "Everyday" }
    installments { 10 }
    ta_coordinator_name { "Billy Bob" }
    ta_coordinator_email { "Billybob@email.com" }
    emailed_date { Time.now - 10.days }
    signature { "This is my signature" }
    
    trait :accepted do
      accepted_date { Time.now }
      rejected_date { nil }
      withdrawn_date { nil }
    end

    trait :rejected do
      accepted_date { nil }
      rejected_date { Time.now }
      withdrawn_date { nil }
    end

    trait :withdrawn do
      accepted_date { nil }
      rejected_date { nil }
      withdrawn_date { Time.now }
    end

    after(:build) do |offer|
      offer.offer_override_pdf = offer.assignment.offer_override_pdf
      offer.first_name = offer.assignment.applicant.first_name
      offer.last_name = offer.assignment.applicant.last_name
      offer.email = offer.assignment.applicant.email
      offer.position_code = offer.assignment.position.position_code
      offer.position_title = offer.assignment.position.position_title
      offer.position_start_date = offer.assignment.position.est_start_date
      offer.position_end_date = offer.assignment.position.est_end_date
    end
  end
end
