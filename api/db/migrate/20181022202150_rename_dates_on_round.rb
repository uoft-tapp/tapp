class RenameDatesOnRound < ActiveRecord::Migration[5.1]
  def change
    rename_column :rounds, :start_date, :open_date
    rename_column :rounds, :end_date, :close_date
  end
end
