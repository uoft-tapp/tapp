class CreatePostings < ActiveRecord::Migration[6.1]
    def change
        create_table :postings do |t|
            t.references :session, null: false, foreign_key: true
            t.datetime :open_date
            t.datetime :close_date
            t.integer :status
            t.text :intro_text
            t.text :custom_questions
            t.string :name, null: false

            t.timestamps
        end
    end
end
