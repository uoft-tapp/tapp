class AddUniqueIndexesToModels < ActiveRecord::Migration[5.1]
  def change
    # Applicant 
    add_index :applicants, :student_number, unique: true
    add_index :applicants, :utorid, unique: true
    
    # Instructor
    add_index :instructors, :utorid, unique: true
  end
end
