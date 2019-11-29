class AddStatusToOffer < ActiveRecord::Migration[5.2]
    def change
        add_column :offers, :status, :int, default: 0, null: false
    end
end