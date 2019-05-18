class CreateAssignmentsAndOffers < ActiveRecord::Migration[5.2]
  def change
    create_table :assignments do |t|
    	t.belongs_to :applicants
    	t.belongs_to :positions
    	t.timestamps
    end

    create_table :offers do |t|
    	t.belongs_to :applicants
    	t.belongs_to :positions
    	t.belongs_to :assignments
      t.timestamps
    end
  end
end
