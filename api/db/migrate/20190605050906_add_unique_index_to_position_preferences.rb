class AddUniqueIndexToPositionPreferences < ActiveRecord::Migration[5.2]
  def change
  	add_index :position_preferences, [:position_id, :application_id], unique: true
  end
end
