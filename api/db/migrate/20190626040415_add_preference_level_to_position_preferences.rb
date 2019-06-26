class AddPreferenceLevelToPositionPreferences < ActiveRecord::Migration[5.2]
  def change
    add_column :position_preferences, :preference_level, :integer
  end
end
