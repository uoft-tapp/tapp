class CreatePostings < ActiveRecord::Migration[6.1]
    def change
        create_table :postings do |t|
            t.references :session, null: false, foreign_key: true
            t.datetime :open_date
            t.datetime :close_date
            t.integer :availability, default: 0
            t.text :intro_text
            t.json :custom_questions
            t.string :name, null: false
            t.string :url_token

            t.timestamps
        end
        add_index :postings, :url_token
    end
end
