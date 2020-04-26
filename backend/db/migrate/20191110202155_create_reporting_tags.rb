class CreateReportingTags < ActiveRecord::Migration[6.0]
    def change
        create_table :reporting_tags do |t|
            t.references :position, foreign_key: true
            t.references :wage_chunk, foreign_key: true
            t.string :name

            t.timestamps
        end
    end
end
