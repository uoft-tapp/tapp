class AddColumnsToOffer < ActiveRecord::Migration[5.2]
  def change
    add_column :offers, :hours, :integer
    add_column :offers, :pay1, :float
    add_column :offers, :pay2, :float
    add_column :offers, :start_date, :date
    add_column :offers, :end_date, :date
    add_column :offers, :status, :integer
  end
end
