class AddContractTemplateToPosition < ActiveRecord::Migration[6.0]
  def change
    add_reference :positions, :contract_template, null: false, foreign_key: true
  end
end