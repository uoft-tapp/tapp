# frozen_string_literal: true

class AddColumnsToSession < ActiveRecord::Migration[5.1]
  def change
    add_column :sessions, :year, :integer
    add_column :sessions, :semester, :string
    add_column :sessions, :pay, :float
  end
end
