class RemoveApplicantIdAndPositionIdFromOffers < ActiveRecord::Migration[5.2]
  def change
	remove_column :offers, :applicant_id
	remove_column :offers, :position_id
  end
end
