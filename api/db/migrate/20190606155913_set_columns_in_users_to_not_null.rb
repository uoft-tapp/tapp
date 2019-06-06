class SetColumnsInUsersToNotNull < ActiveRecord::Migration[5.2]
  def change
  	change_column :users, :utorid, :string, null: false
  end
end
