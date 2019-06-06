class SetColumnsInInstructorsToNotNull < ActiveRecord::Migration[5.2]
  def change
  	change_column :instructors, :last_name, :string, null: false
  	change_column :instructors, :first_name, :string, null: false
  	change_column :instructors, :utorid, :string, null: false
  	change_column :instructors, :email, :string, null: false
  end
end
