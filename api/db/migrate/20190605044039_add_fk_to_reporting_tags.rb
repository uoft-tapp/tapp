class AddFkToReportingTags < ActiveRecord::Migration[5.2]
  def change
    	add_reference :reporting_tags, :position, index: true
    	add_reference :reporting_tags, :wage_chunk, index: true
  end
end
