class RemoveAttributesFromApplicants < ActiveRecord::Migration[5.2]
  def change
	remove_column :applicants, :address
	remove_column :applicants, :commentary
	remove_column :applicants, :dept
	remove_column :applicants, :year_in_program
	remove_column :applicants, :is_full_time
	remove_column :applicants, :is_grad_student
	remove_column :applicants, :program
	remove_column :applicants, :dept_fields
  end
end
