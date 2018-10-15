# frozen_string_literal: true

# A class representing a round. It is a time period which an applicant applies to. For example,
# an applicant can apply to Round 1 of the session Fall 2018.
class Round < ApplicationRecord
  belongs_to :session
  has_many :positions
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
