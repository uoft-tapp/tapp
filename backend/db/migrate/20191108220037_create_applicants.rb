class CreateApplicants < ActiveRecord::Migration[6.0]
  def change
    create_table :applicants do |t|
      t.string :utorid, null: false
      t.string :student_number, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :phone

      t.timestamps
    end
    add_index :applicants, :utorid, unique: true
    add_index :applicants, :student_number, unique: true
  end
end
