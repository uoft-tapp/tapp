class CreatePositions < ActiveRecord::Migration[5.1]
  def change
    create_table :positions do |t|

      t.timestamps
    end
  end
end
