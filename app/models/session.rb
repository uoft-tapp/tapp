# frozen_string_literal: true

class Session < ApplicationRecord
  has_many :positions
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
