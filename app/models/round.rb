# frozen_string_literal: true

# A class representing a round. It is a time period which an applicant applies to. For example,
# an applicant can apply to Round 1 of the session Fall 2018.
class Round < ApplicationRecord
  belongs_to :session
  has_many :positions

  # Every round should have a round number
  validates_presence_of :number
  validates :number, numericality: { only_integer: true, greater_than: 0 }
  validates :number, uniqueness: { scope: :session_id, message: 'is duplicated in the given session' }
end

# == Schema Information
#
# Table name: rounds
#
#  id         :bigint(8)        not null, primary key
#  close_date :datetime
#  number     :integer
#  open_date  :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  session_id :bigint(8)
#
# Indexes
#
#  index_rounds_on_session_id             (session_id)
#  index_rounds_on_session_id_and_number  (session_id,number) UNIQUE
#
