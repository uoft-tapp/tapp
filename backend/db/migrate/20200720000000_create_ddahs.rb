class CreateDdahs < ActiveRecord::Migration[6.0]
    def change
        create_table :ddahs do |t|
            t.references :assignment, null: false, foreign_key: true
            t.datetime :approved_date
            t.datetime :accepted_date
            t.datetime :revised_date
            t.datetime :emailed_date

            t.string :signature
            t.string :url_token

            t.timestamps
        end
        add_index :ddahs, :url_token
    end
end
