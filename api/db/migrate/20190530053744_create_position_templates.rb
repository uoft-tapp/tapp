class CreatePositionTemplates < ActiveRecord::Migration[5.2]
  def change
    create_table :position_templates do |t|
      	t.string :position_type
      	t.string :offer_template
    	t.belongs_to :session

	    t.timestamps
    end
  end
end
