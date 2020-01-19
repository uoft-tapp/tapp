class CreateActiveUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :active_users do |t|
      t.text :credentials
      t.timestamps
    end
  end
end
