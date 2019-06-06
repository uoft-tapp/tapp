class AddFkToPositionDataForAds < ActiveRecord::Migration[5.2]
  def change
    	add_reference :position_data_for_ads, :position, index: true
  end
end
