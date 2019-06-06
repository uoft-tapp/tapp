class CreateApplicantDataForMatchings < ActiveRecord::Migration[5.2]
  def change
    create_table :applicant_data_for_matchings do |t|
      t.string :program
      t.string :department
      t.text :previous_uoft_ta_experience
      t.integer :yip
      t.string :annotation

      t.timestamps
    end
  end
end
