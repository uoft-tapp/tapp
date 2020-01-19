# frozen_string_literal: true

class CreateSessions < ActiveRecord::Migration[6.0]
    def change
        create_table :sessions do |t|
            t.datetime :start_date
            t.datetime :end_date
            t.string :name
            t.float :rate1
            t.float :rate2

            t.timestamps
        end
    end
end
