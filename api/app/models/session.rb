# frozen_string_literal: true

# A class representing a school term. For example, "fall 2018".
class Session < ApplicationRecord
  has_many :positions
  has_many :position_templates
  has_many :applications

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
#  name       :string
#  rate1      :float
#  rate2      :float
#  start_date :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
