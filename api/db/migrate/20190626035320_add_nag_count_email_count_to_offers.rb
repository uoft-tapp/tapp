class AddNagCountEmailCountToOffers < ActiveRecord::Migration[5.2]
  def change
    add_column :offers, :nag_count, :integer, default: 0
    add_column :offers, :email_count, :integer, default: 0
  end
end
