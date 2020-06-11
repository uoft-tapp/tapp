# frozen_string_literal: true

# A class representing a wage chunk for an assignment.
class WageChunk < ApplicationRecord
    has_and_belongs_to_many :reporting_tags
    belongs_to :assignment

    validates :hours, numericality: { only_float: true }, allow_nil: true
    validates :rate, numericality: { only_float: true }, allow_nil: true

    before_save :set_rates

    def rate
        self[:rate] || compute_rate_from_session
    end

    private

    def compute_rate_from_session
        @session ||= assignment.position.session
        # If there is no rate2, then rate1 is the only rate
        return @session.rate1 if @session.rate1 && @session.rate2.blank?

        # if we have two rates and they both lie on one side
        # of a year boundary, then use rate1. Otherwise, use rate2
        end_of_year = @session.start_date.end_of_year
        if start_date <= end_of_year && end_date <= end_of_year
            return @session.rate1
        end

        @session.rate2
    end

    def set_rates
        self.rate = compute_rate_from_session if rate.blank?
    end
end

# == Schema Information
#
# Table name: wage_chunks
#
#  id            :integer          not null, primary key
#  assignment_id :integer          not null
#  hours         :float
#  rate          :float
#  start_date    :datetime
#  end_date      :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_wage_chunks_on_assignment_id  (assignment_id)
#
