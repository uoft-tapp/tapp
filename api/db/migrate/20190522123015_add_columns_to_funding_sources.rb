class AddColumnsToFundingSources < ActiveRecord::Migration[5.2]
  def change
    add_column :funding_sources, :hours, :float
    add_column :funding_sources, :start_date, :date
    add_column :funding_sources, :end_date, :date
    add_column :funding_sources, :ddah_type, :integer
    add_column :funding_sources, :rates, :float
  end
end
