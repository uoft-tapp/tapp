class DropColumnsFromPositionDataForAds < ActiveRecord::Migration[6.1]
    def change
        change_table :position_data_for_ads do |t|
            t.remove :ad_hours_per_assignment, if_exists: true
            t.remove :ad_num_assignments, if_exists: true
            t.remove :ad_open_date, if_exists: true
            t.remove :ad_close_date, if_exists: true
        end
    end
end
