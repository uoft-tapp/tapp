class DropFundingTables < ActiveRecord::Migration[5.2]
  def change
  	drop_table :funding_sources
  end
end
