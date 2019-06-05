# frozen_string_literal: true


# A class representing a position_preference for an application 
# 	to a position with a preference level.
class PositionPreference < ApplicationRecord
	belongs_to :application
	belongs_to :position
	belongs_to :preference_level
end

# == Schema Information
#
# Table name: position_preferences
#
#  id                  :bigint(8)        not null, primary key
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  application_id      :bigint(8)
#  position_id         :bigint(8)
#  preference_level_id :bigint(8)
#
# Indexes
#
#  index_position_preferences_on_application_id       (application_id)
#  index_position_preferences_on_position_id          (position_id)
#  index_position_preferences_on_preference_level_id  (preference_level_id)
#
