class AddFkToAssignments < ActiveRecord::Migration[5.2]
  def change
    	add_reference :assignments, :position, index: true
    	add_reference :assignments, :applicant, index: true
  end
end
