class ExtendApplicantFields < ActiveRecord::Migration[5.2]
  def change
    add_column :applicants, :program, :string
    add_column :applicants, :dept_fields, :string
  end
end
