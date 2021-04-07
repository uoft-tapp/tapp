class ModifyPositionPreferences < ActiveRecord::Migration[6.1]
    def change
        # We can never have null updated/created columns. However, when we call `upsert` without
        # supplying those columns, the database assumes those columns are null and errors.
        # This shoudl change the columns to automatically set the created/updated time.
        change_column_default :position_preferences, :created_at, from: nil, to: ->{ 'now()' }
        change_column_default :position_preferences, :updated_at, from: nil, to: ->{ 'now()' }
    end
end
