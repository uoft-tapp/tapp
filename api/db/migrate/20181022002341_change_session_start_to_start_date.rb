class ChangeSessionStartToStartDate < ActiveRecord::Migration[5.1]
  def change
    rename_column :sessions, :session_start, :start_date
    rename_column :sessions, :session_end, :end_date
  end
end
