class CreateApplications < ActiveRecord::Migration[6.0]
  def change
    create_table :applications do |t|
      t.references :session, null: false, foreign_key: true
      t.references :applicant, null: false, foreign_key: true
      t.text :comments

      t.timestamps
    end
  end
end
