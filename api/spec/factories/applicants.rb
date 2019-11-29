FactoryBot.define do
    factory :applicant do
        utorid { Faker::Internet.slug("#{last_name} #{first_name} #{Faker::Number.number(2)}", '') }
        student_number { Faker::Number.number(10) }
        first_name { Faker::Name.first_name }
        last_name { Faker::Name.last_name }
        email { Faker::Internet.email("#{first_name} #{last_name}", '') }
        phone { Faker::Number.number(10) }
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
