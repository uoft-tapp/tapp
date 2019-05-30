class RemoveColumnsFromAssignments < ActiveRecord::Migration[5.2]
  def change
	remove_column :assignments, :applicant_id
	remove_column :assignments, :position_id
	remove_column :assignments, :hours
	remove_column :assignments, :start_date
	remove_column :assignments, :end_date
	remove_column :assignments, :status
  end
end
