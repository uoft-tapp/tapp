# frozen_string_literal: true

# A class representing a school term. For example, "fall 2018".
class Session < ApplicationRecord
  has_many :rounds

  enum semesters: %i[fall winter summer]

  validates_presence_of :semester, :year
  # Every session has a unique semester, year, and round. IE "Fall 2018 round 1".
  validates :semester, uniqueness: { scope: %i[year] }, inclusion: { in: semesters.keys }
  validates :year, numericality: { only_integer: true, greater_than: 0 }
end

# == Schema Information
#
# Table name: sessions
#
#  id            :bigint(8)        not null, primary key
#  pay           :float
#  semester      :string
#  session_end   :datetime
#  session_start :datetime
#  year          :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
