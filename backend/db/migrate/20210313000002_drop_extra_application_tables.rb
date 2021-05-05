class DropExtraApplicationTables < ActiveRecord::Migration[6.1]
    def change
        change_table :applications do |t|
            # merge the "applicant data for matching"
            t.string :program
            t.string :department
            t.integer :yip
            t.string :annotation
            t.boolean :previous_department_ta
            t.boolean :previous_university_ta

            t.text :previous_experience_summary
            t.float :gpa
            t.json :custom_question_answers
        end

        drop_table :applicant_data_for_matchings
    end
end
