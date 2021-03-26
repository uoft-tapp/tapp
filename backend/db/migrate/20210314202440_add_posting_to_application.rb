class AddPostingToApplication < ActiveRecord::Migration[6.1]
  def change
    add_reference :applications, :posting, null: true, foreign_key: true
  end
end
