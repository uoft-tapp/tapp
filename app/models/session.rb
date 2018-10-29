# frozen_string_literal: true

# A class representing a school term. For example, "fall 2018".
class Session < ApplicationRecord
  has_many :rounds

  enum semesters: %i[fall winter summer]

  validates_presence_of :semester, :year
  # Every session has a unique semester, year IE "Fall 2018".
  validates :semester, uniqueness: { scope: %i[year] }, inclusion: { in: semesters.values }
  validates :year, numericality: { only_integer: true, greater_than: 0 }
end

# == Schema Information
#
# Table name: sessions
#
#  id         :bigint(8)        not null, primary key
#  end_date   :datetime
#  pay        :float
#  semester   :integer          default(0)
#  start_date :datetime
#  year       :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_sessions_on_year_and_semester  (year,semester) UNIQUE
#
