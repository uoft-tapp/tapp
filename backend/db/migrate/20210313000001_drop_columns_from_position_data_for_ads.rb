class DropColumnsFromPositionDataForAds < ActiveRecord::Migration[6.1]
    def change
        change_table :positions do |t|
            t.column :duties, :text
            t.column :qualifications, :text
        end
        drop_table :position_data_for_ads
    end
end
