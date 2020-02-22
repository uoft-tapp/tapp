class CreateInstructors < ActiveRecord::Migration[6.0]
  def change
    create_table :instructors do |t|
      t.string :first_name
      t.string :last_name
      t.string :email
      t.string :utorid, null: false

      t.timestamps
    end
    add_index :instructors, :utorid, unique: true
  end
end
