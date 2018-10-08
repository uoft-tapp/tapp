# frozen_string_literal: true

# A class representing a session. It is a "term" of which an applicant applies to. For example,
# an applicant that applies to Fall 2018, round 1 applies to the "Fall 2018 Round 1" session.
class Session < ApplicationRecord
  has_many :positions
end

# == Schema Information
#
# Table name: sessions
#
#  id         :bigint(8)        not null, primary key
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  year       :integer
#  semester   :string
#  pay        :float
#
