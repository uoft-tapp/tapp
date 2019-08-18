class AddActiveOfferIdToAssignments < ActiveRecord::Migration[5.2]
  def change
    add_reference :assignments, :active_offer, foreign_key: { to_table: :offers}
  end
end
