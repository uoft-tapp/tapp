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

