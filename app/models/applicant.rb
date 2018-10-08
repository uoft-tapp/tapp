# frozen_string_literal: true

# A class representing an applicant. This holds information regarding a student. This class
# has many preferences (a student can apply to many positions).
class Applicant < ApplicationRecord
  has_many :preferences
  has_many :positions, through: :preferences
end

# == Schema Information
#
# Table name: applicants
#
#  id              :bigint(8)        not null, primary key
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  utorid          :string
#  student_number  :string
#  first_name      :string
#  last_name       :string
#  email           :string
#  phone           :string
#  address         :text
#  commentary      :text
#  dept            :string
#  year_in_program :integer
#  full_time       :string
#
