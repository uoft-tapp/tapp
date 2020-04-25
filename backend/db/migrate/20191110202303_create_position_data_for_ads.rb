class CreatePositionDataForAds < ActiveRecord::Migration[6.0]
    def change
        create_table :position_data_for_ads do |t|
            t.references :position, null: false, foreign_key: true
            t.text :duties
            t.text :qualifications
            t.float :ad_hours_per_assignment
            t.integer :ad_num_assignments
            t.datetime :ad_open_date
            t.datetime :ad_close_date

            t.timestamps
        end
    end
end
