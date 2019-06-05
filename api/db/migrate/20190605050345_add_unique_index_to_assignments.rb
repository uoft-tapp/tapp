class AddUniqueIndexToAssignments < ActiveRecord::Migration[5.2]
  def change
  	add_index :assignments, [:position_id, :applicant_id], unique: true
  end
end
