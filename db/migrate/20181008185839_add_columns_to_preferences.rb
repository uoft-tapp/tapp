class AddColumnsToPreferences < ActiveRecord::Migration[5.1]
  def change
    add_column :preferences, :priority, :integer
  end
end
