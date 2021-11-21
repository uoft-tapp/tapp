# frozen_string_literal: true

class Instructor < ApplicationRecord
    has_and_belongs_to_many :positions

    validates_presence_of :last_name, :first_name, :utorid
    validates_uniqueness_of :utorid

    # Returns all the positions this instructor is assigned to in a given session
    def positions_by_session(session_id)
        positions.distinct.where(session: session_id).order(:position_code)
    end

    # Returns all the assignments for courses this instructor is an instructor for
    # in the given session. These assignments are limited to ones that have been
    # Accepted or are Pending; no Rejected/Withdrawn/Preliminary assignments are returned
    def assignments_by_session(session_id)
        Assignment.joins(:active_offer, position: :instructors).distinct.order(
            :id
        ).where(
            active_offer: { status: %i[pending accepted] },
            position: { instructors: id, session: session_id }
        )
    end

    # Returns all the applicants associated with the instructor and session
    def applicants_by_session(session_id)
        Applicant.distinct.joins(:assignments)
            .where("assignments.id": assignments_by_session(session_id).ids)
    end

    # Returns all applications that are associated with the instructor and session
    def applications_by_session(session_id)
        Application.order(:id).where(
            applicant_id: applicants_by_session(session_id).ids
        )
    end

    # Returns a formatted string displaying the instructor's contact information
    def contact_info
        if email?
            "#{first_name} #{last_name} <#{email}>"
        else
            "#{first_name} #{last_name}"
        end
    end
end

# == Schema Information
#
# Table name: instructors
#
#  id         :integer          not null, primary key
#  first_name :string
#  last_name  :string
#  email      :string
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
