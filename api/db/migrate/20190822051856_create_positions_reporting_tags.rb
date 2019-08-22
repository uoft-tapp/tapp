class CreatePositionsReportingTags < ActiveRecord::Migration[5.2]
    def change
        create_table :positions_reporting_tags do |t|
            t.belongs_to :reporting_tag
            t.belongs_to :position
        end
    end
end
