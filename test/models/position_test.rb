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
#  campus_code       :integer
#  cap_enrolment     :integer
#  course_code       :string
#  course_name       :text
#  current_enrolment :integer
#  duties            :text
#  end_date          :datetime
#  estimated         :integer
#  estimated_count   :integer
#  hours             :integer
#  num_waitlisted    :integer
#  open              :boolean
#  qualification     :text
#  start_date        :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  session_id        :bigint(8)
#
# Indexes
#
#  index_positions_on_session_id  (session_id)
#
