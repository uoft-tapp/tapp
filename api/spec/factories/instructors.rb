FactoryBot.define do
  factory :instructor do
    first_name { "MyString" }
    last_name { "MyString" }
    email { "MyString" }
    utorid { "MyString" }
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
