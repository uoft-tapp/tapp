# frozen_string_literal: true

class AddColumnsToSession < ActiveRecord::Migration[5.1]
  def change
    add_column :sessions, :year, :integer
    add_column :sessions, :semester, :string
    add_column :sessions, :pay, :float   
    add_column :sessions, :round, :integer
    add_column :sessions, :round_start, :datetime
    add_column :sessions, :round_end, :datetime
    add_column :sessions, :session_start, :datetime
    add_column :sessions, :session_end, :datetime
  end
end
