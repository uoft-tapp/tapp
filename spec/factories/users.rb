# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    utorid { "utorid#{Faker::Number.number(2)}" }

    trait :admin do
      role { 'admin' }
    end

    trait :instructor do
      role { 'instructor' }
    end
  end
end

# == Schema Information
#
# Table name: users
#
#  id         :bigint(8)        not null, primary key
#  role       :integer
#  utorid     :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_users_on_utorid  (utorid) UNIQUE
#
