class CreateApplicants < ActiveRecord::Migration[6.0]
    def change
        create_table :applicants do |t|
            t.string :utorid, null: false
            t.string :student_number
            t.string :first_name
            t.string :last_name
            t.string :email
            t.string :phone

            t.timestamps
        end
        add_index :applicants, :utorid, unique: true
    end
end
