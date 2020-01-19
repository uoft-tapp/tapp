# frozen_string_literal: true

FactoryBot.define do
    factory :position_preference do
        postion { nil }
        application { nil }
        preference_level { '' }
    end
end

# == Schema Information
#
# Table name: position_preferences
#
#  id               :integer          not null, primary key
#  position_id      :integer          not null
#  application_id   :integer          not null
#  preference_level :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_position_preferences_on_application_id                  (application_id)
#  index_position_preferences_on_position_id                     (position_id)
#  index_position_preferences_on_position_id_and_application_id  (position_id,application_id) UNIQUE
#
