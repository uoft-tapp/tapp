class AddColumnsToAssignment < ActiveRecord::Migration[5.2]
  def change
    add_column :assignments, :hours, :integer
    add_column :assignments, :pay1, :float
    add_column :assignments, :pay2, :float
    add_column :assignments, :start_date, :date
    add_column :assignments, :end_date, :date
    add_column :assignments, :status, :integer
  end
end
