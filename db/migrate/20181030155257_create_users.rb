class CreateUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :users do |t|
      t.string :utorid
      t.integer :role

      t.timestamps
    end
    
    # Add unique constraint
    add_index :users, :utorid, unique: true
  end
end
