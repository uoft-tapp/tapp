# frozen_string_literal: true

# A class representing an applicant. This holds information regarding a student. This class
# has many preferences (a student can apply to many positions).
class Applicant < ApplicationRecord
    has_many :assignments
    has_many :applications
    has_one :applicant_data_for_matching

    validates_presence_of :first_name, :last_name, :email, :student_number, :utorid
    validates_uniqueness_of :student_number, :utorid

    def self.by_session(session_id)
        joins(:applications)
            .where('applications.session_id = ?', session_id)
            .distinct
    end
end

# == Schema Information
#
# Table name: applicants
#
#  id             :integer          not null, primary key
#  utorid         :string           not null
#  student_number :string           not null
#  first_name     :string           not null
#  last_name      :string           not null
#  email          :string           not null
#  phone          :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
