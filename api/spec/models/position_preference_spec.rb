require 'rails_helper'

RSpec.describe PositionPreference, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
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
