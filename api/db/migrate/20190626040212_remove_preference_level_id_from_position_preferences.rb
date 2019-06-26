class RemovePreferenceLevelIdFromPositionPreferences < ActiveRecord::Migration[5.2]
  def change
	remove_column :position_preferences, :preference_level_id
  end
end
