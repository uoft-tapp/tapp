class RenameCreatePreferenceLevelToPreferenceLevel < ActiveRecord::Migration[5.2]
  def change
	rename_table :create_preference_levels, :preference_levels
  end
end
