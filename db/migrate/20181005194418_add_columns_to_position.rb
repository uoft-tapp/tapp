# frozen_string_literal: true

class AddColumnsToPosition < ActiveRecord::Migration[5.1]
  def change
    add_column :positions, :course_code, :string
    add_column :positions, :open, :boolean
    add_column :positions, :campus_code, :integer
    add_column :positions, :course_name, :text
    add_column :positions, :current_enrolment, :integer
    add_column :positions, :duties, :text
    add_column :positions, :qualification, :text
    add_column :positions, :hours, :integer
    add_column :positions, :estimated_count, :integer
    add_column :positions, :estimated, :integer
    add_column :positions, :cap_enrolment, :integer
    add_column :positions, :num_waitlisted, :integer
    add_column :positions, :start_date, :datetime
    add_column :positions, :end_date, :datetime
  end
end
