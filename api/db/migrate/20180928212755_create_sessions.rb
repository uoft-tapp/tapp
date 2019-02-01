# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[5.1]
  def change
    create_table :sessions, &:timestamps
  end
end
