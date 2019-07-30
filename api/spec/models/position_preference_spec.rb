# frozen_string_literal: true

describe PositionPreference do
  it 'should have a valid factory' do
    a = FactoryBot.create(:position_preference)
    byebug
  end
end

# == Schema Information
#
# Table name: applicants
#
#  id             :bigint(8)        not null, primary key
#  email          :string           not null
#  first_name     :string           not null
#  last_name      :string           not null
#  phone          :string
#  student_number :string           not null
#  utorid         :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
