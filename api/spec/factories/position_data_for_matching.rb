# frozen_string_literal: true

FactoryBot.define do
  factory :position_data_for_matching do
    association :position, factory: :position
    
    desired_num_assignments { 10 }
    current_enrollment { 2 }
    current_waitlisted { 0 }
  end
end
