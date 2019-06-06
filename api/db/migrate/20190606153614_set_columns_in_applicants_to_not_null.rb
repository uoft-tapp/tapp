class SetColumnsInApplicantsToNotNull < ActiveRecord::Migration[5.2]
  def change
  	change_column :applicants, :first_name, :string, null: false 
  	change_column :applicants, :last_name, :string, null: false 
  	change_column :applicants, :email, :string, null: false 
  	change_column :applicants, :student_number, :string, null: false 
  	change_column :applicants, :utorid, :string, null: false
  end
end
