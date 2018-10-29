class AddDatesToPosition < ActiveRecord::Migration[5.1]
  def change
    add_column :positions, :start_date, :datetime
    add_column :positions, :end_date, :datetime
  end
end
