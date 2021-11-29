class AddInstructorPreferencesOpenToSession < ActiveRecord::Migration[6.0]
    def change
        add_column :sessions,
                   :applications_visible_to_instructors,
                   :boolean,
                   default: false
    end
end
