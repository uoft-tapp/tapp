class Preference < ApplicationRecord
  belongs_to :applicant
  belongs_to :position
end

# == Schema Information
#
# Table name: preferences
#
#  id           :bigint(8)        not null, primary key
#  applicant_id :bigint(8)
#  position_id  :bigint(8)
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
