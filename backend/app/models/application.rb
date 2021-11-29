# frozen_string_literal: true

# A class representing an application of an applicant.
class Application < ApplicationRecord
    has_many :position_preferences, dependent: :destroy
    has_many :positions, through: :position_preferences
    has_many_attached :documents, service: :application_local
    belongs_to :applicant
    belongs_to :session
    belongs_to :posting, optional: true

    scope :by_session, ->(session_id) { where(session_id: session_id) }

    # Returns all applications that correspond to applicants with a
    # "pending" or "accepted" active offer. These are special because
    # an instructor should be able to see these applications.
    scope :with_pending_or_accepted_offer,
          lambda {
              joins(applicant: { assignments: :active_offer }).where(
                  offers: { status: %i[pending accepted] }
              ).group(:id)
          }

    # Return all applications corresponding to the instructor
    scope :assigned_to_instructor,
          lambda { |instructor_id|
              joins(applicant: { assignments: { position: :instructors } })
                  .where(positions: { instructors: instructor_id }).group(:id)
          }

    # Returns all applications for sessions that have the "applications_visible_to_instructors"
    # flag set.
    scope :by_visible_to_instructors,
          lambda {
              joins(:session).where(
                  session: { applications_visible_to_instructors: true }
              )
          }

    # Returns all applications that applied to a position that the given instructor is
    # assigned to. This method only returns applications where the applicant has indicated
    # a positive preference for the position.
    scope :applied_to_position_for_instructor,
          lambda { |instructor_id|
              joins(position_preferences: { position: :instructors }).where(
                  positions: { instructors: instructor_id }
              ).where('position_preferences.preference_level > ?', 0).group(:id)
          }

    def applicant_data_for_matching
        applicant.applicant_data_for_matching
    end
end

# == Schema Information
#
# Table name: applications
#
#  id           :integer          not null, primary key
#  session_id   :integer          not null
#  applicant_id :integer          not null
#  comments     :text
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_applications_on_applicant_id  (applicant_id)
#  index_applications_on_session_id    (session_id)
#
