class CreateReportingTags < ActiveRecord::Migration[6.0]
  def change
    create_table :reporting_tags do |t|
      t.references :position, null: false, foreign_key: true
      t.references :wage_chunk, null: false, foreign_key: true
      t.string :name

      t.timestamps
    end
  end
end
