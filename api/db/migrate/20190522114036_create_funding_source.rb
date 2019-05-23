class CreateFundingSource < ActiveRecord::Migration[5.2]
  def change
    create_table :funding_sources do |t|
    	t.belongs_to :assignment
    	t.belongs_to :position
    	t.belongs_to :offer
        t.timestamps
    end
  end
end
