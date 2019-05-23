class CreateAssignmentsAndOffers < ActiveRecord::Migration[5.2]
  def change
    create_table :assignments do |t|
    	t.belongs_to :applicant
    	t.belongs_to :position
    	t.timestamps
    end

    create_table :offers do |t|
    	t.belongs_to :applicant
    	t.belongs_to :position
    	t.belongs_to :assignment
      t.timestamps
    end
  end
end
