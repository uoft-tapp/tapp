# frozen_string_literal: true

class CreatePreferences < ActiveRecord::Migration[5.1]
  def change
    create_table :preferences do |t|
      t.belongs_to :applicant
      t.belongs_to :position
      t.timestamps
    end
  end
end
