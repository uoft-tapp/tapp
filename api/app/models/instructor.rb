# frozen_string_literal: true

# Class representing an instructor. An instructor can teach many positions.
class Instructor < ApplicationRecord
  	has_and_belongs_to_many :positions

  	validates_presence_of :last_name, :first_name, :utorid, :email
  	validates_uniqueness_of :utorid
end

# == Schema Information
#
# Table name: instructors
#
#  id         :bigint(8)        not null, primary key
#  email      :string           not null
#  first_name :string           not null
#  last_name  :string           not null
#  utorid     :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_instructors_on_utorid  (utorid) UNIQUE
#
