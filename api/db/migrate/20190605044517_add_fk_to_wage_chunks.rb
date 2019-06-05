class AddFkToWageChunks < ActiveRecord::Migration[5.2]
  def change
    	add_reference :wage_chunks, :assignment, index: true
  end
end
