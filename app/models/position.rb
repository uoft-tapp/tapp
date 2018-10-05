class Position < ApplicationRecord
  has_and_belongs_to_many :instructors
  belongs_to :session
  has_many :preferences
  has_many :applicants, through: :preferences
end

# == Schema Information
#
# Table name: positions
#
#  id                :bigint(8)        not null, primary key
#  session_id        :bigint(8)
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  course_code       :string
#  open              :boolean
#  campus_code       :integer
#  course_name       :text
#  current_enrolment :integer
#  duties            :text
#  qualification     :text
#  hours             :integer
#  estimated_count   :integer
#  estimated         :integer
#  cap_enrolment     :integer
#  num_waitlisted    :integer
#  start_date        :datetime
#  end_date          :datetime
#
