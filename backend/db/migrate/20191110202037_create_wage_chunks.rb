class CreateWageChunks < ActiveRecord::Migration[6.0]
    def change
        create_table :wage_chunks do |t|
            t.references :assignment,
                         null: false, foreign_key: { on_delete: :cascade }
            t.float :hours
            t.float :rate
            t.datetime :start_date
            t.datetime :end_date

            t.timestamps
        end
    end
end
