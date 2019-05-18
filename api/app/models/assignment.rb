# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to 
# applicant and position.
class Assignment < ApplicationRecord
  has_many :offers
  belongs_to :applicant
  belongs_to :position
end

# == Schema Information
#
# Table name: assignments
#
#  id            :bigint(8)        not null, primary key
#  end_date      :date
#  hours         :integer
#  pay1          :float
#  pay2          :float
#  start_date    :date
#  status        :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  applicants_id :bigint(8)
#  positions_id  :bigint(8)
#
# Indexes
#
#  index_assignments_on_applicants_id  (applicants_id)
#  index_assignments_on_positions_id   (positions_id)
#
