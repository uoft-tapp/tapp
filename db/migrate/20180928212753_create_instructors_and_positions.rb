# frozen_string_literal: true

class CreateInstructorsAndPositions < ActiveRecord::Migration[5.1]
  def change
    create_table :instructors, &:timestamps

    create_table :instructors_positions do |t|
      t.belongs_to :instructor
      t.belongs_to :position
    end

    create_table :positions do |t|
      t.belongs_to :round
      t.timestamps
    end
  end
end
