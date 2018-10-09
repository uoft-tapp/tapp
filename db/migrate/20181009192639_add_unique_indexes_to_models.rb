class AddUniqueIndexesToModels < ActiveRecord::Migration[5.1]
  def change
    # Applicant 
    add_index :applicants, :student_number, unique: true
    add_index :applicants, :utorid, unique: true
    
    # Instructor
    add_index :instructors, :utorid, unique: true

    # Session
    add_index :sessions, %i[year round], unique: true
  end
end
