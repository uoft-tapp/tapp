# frozen_string_literal: true


# A class representing a position_preference for an application 
# 	to a position with a preference level.
class PositionPreference < ApplicationRecord
	belongs_to :application
	belongs_to :position

  	validates_uniqueness_of :application_id, :scope => [:position_id]
end

# == Schema Information
#
# Table name: position_preferences
#
#  id               :bigint(8)        not null, primary key
#  preference_level :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  application_id   :bigint(8)
#  position_id      :bigint(8)
#
# Indexes
#
#  index_position_preferences_on_application_id                  (application_id)
#  index_position_preferences_on_position_id                     (position_id)
#  index_position_preferences_on_position_id_and_application_id  (position_id,application_id) UNIQUE
#
