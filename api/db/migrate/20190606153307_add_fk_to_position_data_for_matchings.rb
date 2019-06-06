class AddFkToPositionDataForMatchings < ActiveRecord::Migration[5.2]
  def change
    	add_reference :position_data_for_matchings, :position, index: true
  end
end
