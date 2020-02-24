# frozen_string_literal: true

# A class representing an applicant. This holds information regarding a student. This class
# has many preferences (a student can apply to many positions).
class Applicant < ApplicationRecord
    has_many :assignments
    has_many :applications
    has_one :applicant_data_for_matching

    validates_presence_of :first_name, :last_name, :email, :student_number, :utorid
    validates_uniqueness_of :student_number, case_sensitive: false
    validates_uniqueness_of :utorid

    def self.by_session(session_id)
        # An applicant can come from an application for the current session, or
        # they could have been given an assignment bypassing the application.
        left_outer_joins(:applications, assignments: :position)
            .where('applications.session_id = ? OR positions.session_id = ?', session_id, session_id)
            .distinct
    end
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
