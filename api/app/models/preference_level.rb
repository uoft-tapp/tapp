# frozen_string_literal: true

# A class representing a preference_level, which represents the
# 	different preference level possible for each postion_application.
class PreferenceLevel < ApplicationRecord
	has_many :position_preferences
end

# == Schema Information
#
# Table name: preference_levels
#
#  id               :bigint(8)        not null, primary key
#  preference_level :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
