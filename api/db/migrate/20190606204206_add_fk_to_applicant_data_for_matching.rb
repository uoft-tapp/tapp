class AddFkToApplicantDataForMatching < ActiveRecord::Migration[5.2]
  def change
    add_reference :applicant_data_for_matchings, :applicant, index: true
    add_reference :applicant_data_for_matchings, :application, index: true
  end
end
