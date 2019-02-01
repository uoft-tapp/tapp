# frozen_string_literal: true

class CreateApplicants < ActiveRecord::Migration[5.1]
  def change
    create_table :applicants, &:timestamps
  end
end
