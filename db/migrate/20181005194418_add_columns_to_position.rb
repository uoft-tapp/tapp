# frozen_string_literal: true

class AddColumnsToPosition < ActiveRecord::Migration[5.1]
  def change
    add_column :positions, :course_code, :string
    add_column :positions, :course_name, :text
    add_column :positions, :current_enrolment, :integer
    add_column :positions, :duties, :text
    add_column :positions, :qualifications, :text
    add_column :positions, :hours, :integer
    add_column :positions, :cap_enrolment, :integer
    add_column :positions, :num_waitlisted, :integer
    add_column :positions, :openings, :integer
  end
end
