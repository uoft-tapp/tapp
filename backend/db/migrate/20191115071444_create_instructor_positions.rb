class CreateInstructorPositions < ActiveRecord::Migration[6.0]
  def change
    create_table :instructors_positions do |t|
      t.belongs_to :instructor
      t.belongs_to :position
    end
  end
end
