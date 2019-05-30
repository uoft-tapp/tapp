class RemoveAttributesFromPosition < ActiveRecord::Migration[5.2]
  def change
	remove_column :positions, :course_code
	remove_column :positions, :course_name
	remove_column :positions, :current_enrolment
	remove_column :positions, :duties
	remove_column :positions, :qualifications
	remove_column :positions, :hours
	remove_column :positions, :cap_enrolment
	remove_column :positions, :num_waitlisted
	remove_column :positions, :openings
	remove_column :positions, :start_date
	remove_column :positions, :end_date
  end
end
