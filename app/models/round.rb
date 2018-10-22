# frozen_string_literal: true

# A class representing a round. It is a time period which an applicant applies to. For example,
# an applicant can apply to Round 1 of the session Fall 2018.
class Round < ApplicationRecord
  belongs_to :session
  has_many :positions

  # Every round should have a round number
  validates_presence_of :number
  validates :number, numericality: { only_integer: true, greater_than: 0 }
end

# == Schema Information
#
# Table name: rounds
#
#  id         :bigint(8)        not null, primary key
#  end_date   :datetime
#  number     :integer
#  start_date :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_rounds_on_session_id  (session_id)
#
