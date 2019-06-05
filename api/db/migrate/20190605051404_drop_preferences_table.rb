class DropPreferencesTable < ActiveRecord::Migration[5.2]
  def change
  	drop_table :preferences
  end
end
