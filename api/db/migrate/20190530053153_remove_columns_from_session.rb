class RemoveColumnsFromSession < ActiveRecord::Migration[5.2]
  def change
	remove_column :sessions, :year
	remove_column :sessions, :semester
	remove_column :sessions, :pay
  end
end
