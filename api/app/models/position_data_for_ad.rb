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
#  id                      :bigint(8)        not null, primary key
#  ad_close_date           :datetime
#  ad_hours_per_assignment :float
#  ad_num_assignments      :integer
#  ad_open_date            :datetime
#  duties                  :text
#  qualifications          :text
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  position_id             :bigint(8)
#
# Indexes
#
#  index_position_data_for_ads_on_position_id  (position_id)
#
