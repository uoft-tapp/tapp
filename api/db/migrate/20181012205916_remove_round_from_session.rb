class RemoveRoundFromSession < ActiveRecord::Migration[5.1]
  def change
    remove_column :sessions, :round
    remove_column :sessions, :round_start
    remove_column :sessions, :round_end
  end
end
