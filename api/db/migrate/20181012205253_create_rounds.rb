class CreateRounds < ActiveRecord::Migration[5.1]
  def change
    create_table :rounds do |t|
      t.datetime :start_date
      t.datetime :end_date
      t.integer :number

      t.timestamps
      t.belongs_to :session
    end
  end
end
