class CreatePositionDataForMatchings < ActiveRecord::Migration[6.0]
  def change
    create_table :position_data_for_matchings do |t|
      t.references :position, null: false, foreign_key: true
      t.integer :desired_num_assignments
      t.integer :current_enrollment
      t.integer :current_waitlisted

      t.timestamps
    end
  end
end
