# frozen_string_literal: true

FactoryBot.define do
  factory :applicant_data_for_matching do
    association :application, factory: :application
    association :applicant, factory: :applicant

    program { "Computer Science" }
    department { "Arts and Science" }
    previous_uoft_ta_experience { "I have none" }
    yip { 3 }
    annotation { "This is an annotation" }
  end
end
