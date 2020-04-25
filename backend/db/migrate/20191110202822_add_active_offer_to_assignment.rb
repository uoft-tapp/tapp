class AddActiveOfferToAssignment < ActiveRecord::Migration[6.0]
    def change
        add_reference :assignments,
                      :active_offer,
                      foreign_key: { to_table: :offers }
    end
end
