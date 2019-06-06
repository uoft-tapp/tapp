class RemoveColumnsFromOffers < ActiveRecord::Migration[5.2]
  def change
    remove_column :offers, :end_date
    remove_column :offers, :hours
    remove_column :offers, :start_date
    remove_column :offers, :status
  end
end
