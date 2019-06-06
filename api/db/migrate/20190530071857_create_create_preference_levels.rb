class CreateCreatePreferenceLevels < ActiveRecord::Migration[5.2]
  def change
    create_table :create_preference_levels do |t|
      t.integer :preference_level

      t.timestamps
    end
  end
end
