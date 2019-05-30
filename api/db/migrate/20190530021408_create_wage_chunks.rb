class CreateWageChunks < ActiveRecord::Migration[5.2]
  def change
    create_table :wage_chunks do |t|
      	t.float :hours
      	t.float :rate
      	t.datetime :start_date
      	t.datetime :end_date

      	t.timestamps
    end
  end
end
