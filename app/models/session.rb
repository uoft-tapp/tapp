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
