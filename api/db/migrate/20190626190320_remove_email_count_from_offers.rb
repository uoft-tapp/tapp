class RemoveEmailCountFromOffers < ActiveRecord::Migration[5.2]
  def change
	remove_column :offers, :email_count
  end
end
