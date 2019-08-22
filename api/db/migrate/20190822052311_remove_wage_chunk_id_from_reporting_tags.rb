class RemoveWageChunkIdFromReportingTags < ActiveRecord::Migration[5.2]
    def change
        remove_column :reporting_tags, :wage_chunk_id
    end
end
