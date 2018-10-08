require 'test_helper'

class PositionTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end
end

# == Schema Information
#
# Table name: positions
#
#  id                :bigint(8)        not null, primary key
#  cap_enrolment     :integer
#  course_code       :string
#  course_name       :text
#  current_enrolment :integer
#  duties            :text
#  hours             :integer
#  num_waitlisted    :integer
#  openings          :integer
#  qualifications    :text
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  session_id        :bigint(8)
#
# Indexes
#
#  index_positions_on_session_id  (session_id)
#
