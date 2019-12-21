# frozen_string_literal: true

FactoryBot.define do
    factory :applicant do
        utorid do
            Faker::Internet.slug(words: "#{last_name} #{first_name} \
            #{Faker::Number.number(digits: 2)}", glue: '')
        end
        first_name { Faker::Name.first_name }
        last_name { Faker::Name.last_name }
        email { Faker::Internet.email(name: "#{first_name} #{last_name}", separators: '') }
        phone { Faker::Number.number(digits: 10) }
        trait :with_student_number do
            student_number { Faker::Number.number(digits: 10) }
        end
        trait :with_utorid do
            utorid do
                Faker::Internet.slug(words: "#{last_name} #{first_name} \
                    #{Faker::Number.number(digits: 2)}", glue: '')
            end
        end
    end
end

# == Schema Information
#
# Table name: applicants
#
#  id             :integer          not null, primary key
#  utorid         :string           not null
#  student_number :string           not null
#  first_name     :string           not null
#  last_name      :string           not null
#  email          :string           not null
#  phone          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
