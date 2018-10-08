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
#  address         :text
#  commentary      :text
#  dept            :string
#  email           :string
#  first_name      :string
#  is_full_time    :boolean
#  is_grad_student :boolean
#  last_name       :string
#  phone           :string
#  student_number  :string
#  utorid          :string
#  year_in_program :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
