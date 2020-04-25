class CreateApplicantDataForMatchings < ActiveRecord::Migration[6.0]
    def change
        create_table :applicant_data_for_matchings do |t|
            t.references :applicant, null: false, foreign_key: true
            t.string :program
            t.string :department
            t.text :previous_uoft_experience
            t.integer :yip
            t.string :annotation

            t.timestamps
        end
    end
end
