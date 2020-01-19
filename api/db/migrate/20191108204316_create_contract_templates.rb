class CreateContractTemplates < ActiveRecord::Migration[6.0]
  def change
    create_table :contract_templates do |t|
      t.references :session, null: false, foreign_key: true
      t.string :template_name
      t.string :template_file

      t.timestamps
    end
  end
end
