# frozen_string_literal: true

FactoryBot.define do
    factory :user do
        utorid { "utorid#{Faker::Number.number(digits: 2)}" }
        trait :admin do
            role { :admin }
        end
        trait :instructor do
            role { :instructor }
        end
    end
end

# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  utorid     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
