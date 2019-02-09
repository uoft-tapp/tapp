# frozen_string_literal: true

# A class representing a position. This encapsulates the idea of a "course". Students apply to many positions.
# For example, a person who applies to Fall 2018, CSC148, is applying to the CSC148 position.
# This has many instructors, because multiple instructors can teach a course, and every position belongs
# to a session.
class Position < ApplicationRecord
  has_and_belongs_to_many :instructors
  belongs_to :session
  has_many :preferences
  has_many :applicants, through: :preferences

  validates_presence_of :course_code, :openings, :session
  validates :openings, numericality: { only_integer: true, greater_than: 0 }
  validates :course_code, uniqueness: { scope: :session_id, message: 'course duplicated in same session'}

  def as_json(_options = {})
    super(
      include: {
        instructors: { only: %i[id first_name last_name] }
      }
    )
  end
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
#  end_date          :datetime
#  hours             :integer
#  num_waitlisted    :integer
#  openings          :integer
#  qualifications    :text
#  start_date        :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  session_id        :bigint(8)
#
# Indexes
#
#  index_positions_on_course_code_and_session_id  (course_code,session_id) UNIQUE
#  index_positions_on_session_id                (session_id)
#
