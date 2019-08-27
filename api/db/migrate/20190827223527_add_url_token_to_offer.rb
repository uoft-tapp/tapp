class AddUrlTokenToOffer < ActiveRecord::Migration[5.2]
  def change
    add_column :offers, :url_token, :string
    add_index :offers, :url_token, unique: true
  end
end
