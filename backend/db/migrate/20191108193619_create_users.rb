# Create User migration
class CreateUsers < ActiveRecord::Migration[6.0]
    def change
        create_table :users do |t|
            t.string :utorid
            t.timestamps
        end
        add_index :users, :utorid, unique: true
    end
end