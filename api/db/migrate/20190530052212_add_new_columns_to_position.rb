class AddNewColumnsToPosition < ActiveRecord::Migration[5.2]
  def change
  	add_column :positions, :position_code, :string
  	add_column :positions, :position_title, :string
  	add_column :positions, :est_hours_per_assignment, :float
  	add_column :positions, :est_start_date, :datetime
  	add_column :positions, :est_end_date, :datetime
  	add_column :positions, :position_type, :string
  end
end
