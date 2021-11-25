# frozen_string_literal: true

# A class representing an applicant. This holds information regarding a student. This class
# has many preferences (a student can apply to many positions).
class Applicant < ApplicationRecord
    has_many :assignments
    has_many :applications, dependent: :destroy
    accepts_nested_attributes_for :applications

    validates_presence_of :utorid
    validates_uniqueness_of :utorid, case_sensitive: false

    # An applicant can come from an application for the current session, or
    # they could have been given an assignment bypassing the application.
    scope :by_session,
          lambda { |session_id|
              left_outer_joins(:applications, assignments: :position).where(
                  'applications.session_id = ? OR positions.session_id = ?',
                  session_id,
                  session_id
              ).group(:id)
          }

    # Returns all applicants that correspond to applicants with a
    # "pending" or "accepted" active offer. These are special because
    # an instructor should be able to see these applications.
    scope :with_pending_or_accepted_offer,
          lambda {
              joins(assignments: :active_offer).where(
                  offers: { status: %i[pending accepted] }
              ).group(:id)
          }

    # Return all applicants corresponding to the instructor
    scope :assigned_to_instructor,
          lambda { |instructor_id|
              joins(assignments: { position: :instructors }).where(
                  positions: { instructors: instructor_id }
              ).group(:id)
          }

    # Returns all applicants for sessions that have the "applications_visible_to_instructors"
    # flag set.
    scope :by_visible_to_instructors,
          lambda {
              joins(applications: :session).where(
                  session: { applications_visible_to_instructors: true }
              )
          }

    # Returns all applicants that applied to a position that the given instructor is
    # assigned to. This method only returns applicants who on an
    # application indicated a positive preference for the position.
    scope :applied_to_position_for_instructor,
          lambda { |instructor_id|
              joins(
                  applications: {
                      position_preferences: { position: :instructors }
                  }
              ).where(positions: { instructors: instructor_id }).where(
                  'position_preferences.preference_level > ?',
                  0
              ).group(:id)
          }
end

# == Schema Information
#
# Table name: applicants
#
#  id             :integer          not null, primary key
#  utorid         :string           not null
#  student_number :string
#  first_name     :string
#  last_name      :string
#  email          :string
#  phone          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_utorid  (utorid) UNIQUE
#
