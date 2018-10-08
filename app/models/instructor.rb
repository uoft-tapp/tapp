# frozen_string_literal: true

# Class representing an instructor. An instructor can teach many positions.
class Instructor < ApplicationRecord
  has_and_belongs_to_many :positions
end

# == Schema Information
#
# Table name: instructors
#
#  id         :bigint(8)        not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  last_name  :string
#  first_name :string
#  email      :string
#  utorid     :string
#
