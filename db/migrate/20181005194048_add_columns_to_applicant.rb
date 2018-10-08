# frozen_string_literal: true

class AddColumnsToApplicant < ActiveRecord::Migration[5.1]
  def change
    add_column :applicants, :utorid, :string
    add_column :applicants, :student_number, :string
    add_column :applicants, :first_name, :string
    add_column :applicants, :last_name, :string
    add_column :applicants, :email, :string
    add_column :applicants, :phone, :string
    add_column :applicants, :address, :text
    add_column :applicants, :commentary, :text
    add_column :applicants, :dept, :string
    add_column :applicants, :year_in_program, :integer
    add_column :applicants, :is_full_time, :boolean
    add_column :applicants, :is_grad, :boolean
  end
end
