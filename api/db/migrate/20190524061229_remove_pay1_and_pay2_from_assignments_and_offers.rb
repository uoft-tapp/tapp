class RemovePay1AndPay2FromAssignmentsAndOffers < ActiveRecord::Migration[5.2]
  def change
		remove_column :offers, :pay1
		remove_column :offers, :pay2  
		remove_column :assignments, :pay1
		remove_column :assignments, :pay2  
	end
end
