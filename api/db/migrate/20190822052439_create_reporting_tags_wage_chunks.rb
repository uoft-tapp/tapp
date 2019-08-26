class CreateReportingTagsWageChunks < ActiveRecord::Migration[5.2]
    def change
        create_table :reporting_tags_wage_chunks do |t|
            t.belongs_to :reporting_tag
            t.belongs_to :wage_chunk
        end
    end
end
