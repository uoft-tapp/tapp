# frozen_string_literal: true

# A class representing an applicant. This holds information regarding a student. This class
# has many preferences (a student can apply to many positions).
class Applicant < ApplicationRecord
  has_many :preferences
  has_many :positions, through: :preferences

  validates_presence_of :first_name, :last_name, :email, :student_number, :utorid
  validates_uniqueness_of :student_number, :utorid
end

# == Schema Information
#
# Table name: applicants
#
#  id             :bigint(8)        not null, primary key
#  email          :string
#  first_name     :string
#  last_name      :string
#  phone          :string
#  student_number :string
#  utorid         :string
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_applicants_on_student_number  (student_number) UNIQUE
#  index_applicants_on_utorid          (utorid) UNIQUE
#
