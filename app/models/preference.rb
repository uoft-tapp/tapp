# frozen_string_literal: true

# This class represents a preference. It is a join between an applicant and a
# position. An applicant "applies" to a position through preferences.
class Preference < ApplicationRecord
  belongs_to :applicant
  belongs_to :position

  # TODO: Should we convert priority to Enum?
  validates_presence_of :priority, :applicant, :position
  validates :priority, numericality: { only_integer: true, less_than_or_equal_to: 3, greater_than_or_equal_to: 0 }
end

# == Schema Information
#
# Table name: preferences
#
#  id           :bigint(8)        not null, primary key
#  priority     :integer
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  applicant_id :bigint(8)
#  position_id  :bigint(8)
#
# Indexes
#
#  index_preferences_on_applicant_id  (applicant_id)
#  index_preferences_on_position_id   (position_id)
#
