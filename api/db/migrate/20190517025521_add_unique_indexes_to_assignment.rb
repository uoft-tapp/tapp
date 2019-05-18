class AddUniqueIndexesToAssignment < ActiveRecord::Migration[5.2]
  def change
	add_index :assignments, [:applicant_id, :position_id], :unique => true
  end
end
