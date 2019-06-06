class AddNewColumnsToAssignments < ActiveRecord::Migration[5.2]
  def change
    add_column :assignments, :contract_start, :datetime
    add_column :assignments, :contract_end, :datetime
    add_column :assignments, :note, :text
    add_column :assignments, :offer_override_pdf, :string
  end
end
