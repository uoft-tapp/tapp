class CreatePositionPreferences < ActiveRecord::Migration[5.2]
  def change
    create_table :position_preferences do |t|
    	t.belongs_to :position
    	t.belongs_to :preference_level
    	t.belongs_to :application

      	t.timestamps
    end
  end
end
