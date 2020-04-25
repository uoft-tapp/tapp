class CreatePositions < ActiveRecord::Migration[6.0]
    def change
        create_table :positions do |t|
            t.references :session, null: false, foreign_key: true
            t.string :position_code
            t.string :position_title
            t.float :hours_per_assignment
            t.datetime :start_date
            t.datetime :end_date

            t.timestamps
        end
    end
end
