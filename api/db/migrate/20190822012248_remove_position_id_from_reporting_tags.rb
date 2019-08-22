class RemovePositionIdFromReportingTags < ActiveRecord::Migration[5.2]
    def change
        remove_column :reporting_tags, :position_id
    end
end
