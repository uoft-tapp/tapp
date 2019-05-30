class AddNewColumnsToSessions < ActiveRecord::Migration[5.2]
  def change
    add_column :sessions, :name, :string
    add_column :sessions, :rate1, :float
    add_column :sessions, :rate2, :float
  end
end
