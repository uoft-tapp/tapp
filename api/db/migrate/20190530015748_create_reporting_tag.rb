class CreateReportingTag < ActiveRecord::Migration[5.2]
  def change
    create_table :reporting_tags do |t|
    	t.string :name
        t.timestamps
    end
  end
end
