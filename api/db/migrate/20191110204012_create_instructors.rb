class CreateInstructors < ActiveRecord::Migration[6.0]
  def change
    create_table :instructors do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :utorid, null: false

      t.timestamps
    end
    add_index :instructors, :utorid, unique: true
  end
end
