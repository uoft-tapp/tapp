class DropRoundsTable < ActiveRecord::Migration[5.2]
  def change
    remove_reference :positions, :round, index:true
    drop_table :rounds
  end
end
