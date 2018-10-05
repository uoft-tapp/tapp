class CreateInstructorsAndPositions < ActiveRecord::Migration[5.1]
  def change
    create_table :instructors do |t|

      t.timestamps
    end
    
    create_table :instructors_positions do |t|
      t.belongs_to :instructor
      t.belongs_to :position
    end

    create_table :positions do |t|
      t.belongs_to :session
      t.timestamps
    end
  end
end

