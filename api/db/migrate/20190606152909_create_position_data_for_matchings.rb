class CreatePositionDataForMatchings < ActiveRecord::Migration[5.2]
  def change
    create_table :position_data_for_matchings do |t|
      t.integer :desired_num_assignments
      t.integer :current_enrollment
      t.integer :current_waitlisted

      t.timestamps
    end
  end
end
