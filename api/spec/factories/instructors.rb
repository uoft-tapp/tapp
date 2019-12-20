# frozen_string_literal: true

FactoryBot.define do
    factory :instructor do
        first_name { Faker::Name.unique.first_name }
        last_name { Faker::Name.unique.last_name }
        email { Faker::Internet.email(name: "#{first_name} #{last_name}", separators: '') }
        utorid { Faker::Internet.slug(words: "#{last_name} #{first_name} #{Faker::Number.number(digits: 2)}", glue: '') }
        trait :without_utorid do
            utorid { }
        end
    end
end

# == Schema Information
#
# Table name: instructors
#
#  id         :integer          not null, primary key
#  first_name :string           not null
#  last_name  :string           not null
#  email      :string           not null
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
