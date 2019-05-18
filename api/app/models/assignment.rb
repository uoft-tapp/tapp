# frozen_string_literal: true

# A class representing an assignment. This class has many offers and belongs to 
# applicant and position.
class Assignment < ApplicationRecord
  has_many :offers
  belongs_to :applicants
  belongs_to :positions

  validates_uniqueness_of :applicant_id, :scope => [:position_id]
end

# == Schema Information
#
# Table name: assignments
#
#  id           :bigint(8)        not null, primary key
#  end_date     :date
#  hours        :integer
#  pay1         :float
#  pay2         :float
#  start_date   :date
#  status       :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  applicant_id :bigint(8)
#  position_id  :bigint(8)
#
# Indexes
#
#  index_assignments_on_applicant_id  (applicant_id)
#  index_assignments_on_position_id   (position_id)
#
