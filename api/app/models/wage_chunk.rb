# frozen_string_literal: true


# A class representing a wage chunk for an assignment.
class WageChunk < ApplicationRecord
	has_many :reporting_tags
	belongs_to :assignment
	validates :hours, numericality: {only_float: true}, allow_nil: true
	validates :rate, numericality: {only_float: true}, allow_nil: true
end

# == Schema Information
#
# Table name: wage_chunks
#
#  id            :bigint(8)        not null, primary key
#  end_date      :datetime
#  hours         :float
#  rate          :float
#  start_date    :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  assignment_id :bigint(8)
#
# Indexes
#
#  index_wage_chunks_on_assignment_id  (assignment_id)
#
