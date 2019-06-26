class DropPreferenceLevels < ActiveRecord::Migration[5.2]
  def change
  	drop_table :preference_levels
  end
end
