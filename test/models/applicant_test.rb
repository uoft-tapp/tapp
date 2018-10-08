require 'test_helper'

class ApplicantTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

# == Schema Information
#
# Table name: applicants
#
#  id              :bigint(8)        not null, primary key
#  address         :text
#  commentary      :text
#  dept            :string
#  email           :string
#  first_name      :string
#  is_full_time    :boolean
#  is_grad         :boolean
#  last_name       :string
#  phone           :string
#  student_number  :string
#  utorid          :string
#  year_in_program :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
