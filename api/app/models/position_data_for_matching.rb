# frozen_string_literal: true

# A class representing the matching portion of a position data.
class PositionDataForMatching < ApplicationRecord
end

# == Schema Information
#
# Table name: position_data_for_matchings
#
#  id                      :bigint(8)        not null, primary key
#  current_enrollment      :integer
#  current_waitlisted      :integer
#  desired_num_assignments :integer
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
