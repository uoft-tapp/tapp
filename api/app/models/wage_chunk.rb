# frozen_string_literal: true

# A class representing a wage chunk for an assignment.
class WageChunk < ApplicationRecord
    has_and_belongs_to_many :reporting_tags
    belongs_to :assignment

    validates :hours, numericality: { only_float: true }, allow_nil: true
    validates :rate, numericality: { only_float: true }, allow_nil: true

    before_save :set_rates

    private

    def set_rates
        session = assignment.position.session
        # Apply Session rate1 as the rate if there is no Session rate2
        if session.rate1 && session.rate2.blank? && rate != session.rate1
            self.rate = session.rate1
            return
        end

        # Apply Session rate1 or rate2 depending on the time of year
        # TODO: Check for different rates
        if session.rate1 && session.rate2
            self.rate = if Time.zone.now.end_of_year >= end_date
                            session.rate1
                        else
                            session.rate2
                        end
        end
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
