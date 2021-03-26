class CreatePostingPositions < ActiveRecord::Migration[6.1]
    def change
        create_table :posting_positions do |t|
            t.references :position, null: false, foreign_key: true
            t.references :posting, null: false, foreign_key: true
            t.integer :num_positions
            t.float :hours

            t.timestamps
        end
    end
end
