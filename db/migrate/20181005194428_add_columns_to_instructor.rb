class AddColumnsToInstructor < ActiveRecord::Migration[5.1]
  def change
    add_column :instructors, :last_name, :string
    add_column :instructors, :first_name, :string
    add_column :instructors, :email, :string
    add_column :instructors, :utorid, :string
  end
end
