class CreateInstructorPreferences < ActiveRecord::Migration[6.0]
    def change
        create_table :instructor_preferences do |t|
            t.references :position, null: false, foreign_key: true
            t.references :application, null: false, foreign_key: true
            t.integer :preference_level
            t.text :comment

            t.timestamps

            # We can never have null updated/created columns. However, when we call `upsert` without
            # supplying those columns, the database assumes those columns are null and errors.
            # This shoudl change the columns to automatically set the created/updated time.
            change_column_default :position_preferences,
                                  :created_at,
                                  from: nil, to: -> { 'now()' }
            change_column_default :position_preferences,
                                  :updated_at,
                                  from: nil, to: -> { 'now()' }
        end
        add_index :instructor_preferences,
                  %i[position_id application_id],
                  unique: true
    end
end
