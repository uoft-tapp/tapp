# frozen_string_literal: true

# A class representing the ad portion of a position.
class PositionDataForAd < ApplicationRecord
    belongs_to :position

    validates :ad_num_assignments, numericality: true, allow_nil: true
    validates :ad_hours_per_assignment, numericality: { only_float: true }, allow_nil: true
end

# == Schema Information
#
# Table name: position_data_for_ads
#
#  id                      :integer          not null, primary key
#  position_id             :integer          not null
#  duties                  :text
#  qualifications          :text
#  ad_hours_per_assignment :float
#  ad_num_assignments      :integer
#  ad_open_date            :datetime
#  ad_close_date           :datetime
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_position_data_for_ads_on_position_id  (position_id)
#
