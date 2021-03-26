class DropExtraPositionTables < ActiveRecord::Migration[6.1]
    def change
        change_table :positions do |t|
            # merge the "position data for ad"
            t.column :duties, :text
            t.column :qualifications, :text

            # merge the "position data for matching"
            t.integer :desired_num_assignments
            t.integer :current_enrollment
            t.integer :current_waitlisted
        end
        drop_table :position_data_for_ads
        drop_table :position_data_for_matchings
    end
end
