# frozen_string_literal: true

# A class representing a session. It is a "term" of which an applicant applies to. For example,
# an applicant that applies to Fall 2018, round 1 applies to the "Fall 2018 Round 1" session.
class Session < ApplicationRecord
  has_many :positions

  # TODO: Since we're using enums for semester, we might have to change semester to integer for type.
  enum semesters: %i[fall winter summer]

  validates_presence_of :round, :semester, :year
  # Every session has a unique semester, year, and round. IE "Fall 2018 round 1".
  validates :semester, uniqueness: { scope: %i[year round] }, inclusion: { in: semesters.keys }
  validates :year, numericality: { only_integer: true, greater_than: 0 }
end

# == Schema Information
#
# Table name: sessions
#
#  id            :bigint(8)        not null, primary key
#  pay           :float
#  round         :integer
#  round_end     :datetime
#  round_start   :datetime
#  semester      :string
#  session_end   :datetime
#  session_start :datetime
#  year          :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_sessions_on_year_and_round  (year,round) UNIQUE
#
