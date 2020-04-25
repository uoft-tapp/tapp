class CreatePositionPreferences < ActiveRecord::Migration[6.0]
    def change
        create_table :position_preferences do |t|
            t.references :position, null: false, foreign_key: true
            t.references :application, null: false, foreign_key: true
            t.integer :preference_level

            t.timestamps
        end
        add_index :position_preferences,
                  %i[position_id application_id],
                  unique: true
    end
end
