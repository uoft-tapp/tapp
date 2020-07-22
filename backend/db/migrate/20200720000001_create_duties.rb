class CreateDuties < ActiveRecord::Migration[6.0]
    def change
        create_table :duties do |t|
            t.references :ddah, foreign_key: true
            t.string :description
            t.float :hours
            t.integer :order

            t.timestamps
        end
    end
end
