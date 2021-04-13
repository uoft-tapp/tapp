class DropExtraApplicationTables < ActiveRecord::Migration[6.1]
    def change
        change_table :applications do |t|
            # merge the "applicant data for matching"
            t.string :program
            t.string :department
            t.integer :yip
            t.integer :status
            t.string :annotation

            t.text :previous_uoft_experience
            t.float :gpa
            t.json :custom_question_answers
        end
        drop_table :applicant_data_for_matchings
    end
end
