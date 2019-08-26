# frozen_string_literal: true

# A class representing a position. This encapsulates the idea of a "course". Students apply to many positions.
# For example, a person who applies to Fall 2018, CSC148, is applying to the CSC148 position.
# This has many instructors, because multiple instructors can teach a course, and every position belongs
# to a session.
class Position < ApplicationRecord
    has_and_belongs_to_many :instructors
    belongs_to :session
    has_many :reporting_tags
    has_many :assignments
    has_many :position_preferences
    has_many :applications, through: :position_preferences
    has_one :position_data_for_ad
    has_one :position_data_for_matching
    validates :est_hours_per_assignment, numericality: {only_float: true}, allow_nil: true
    validates :position_code, :presence => true, :uniqueness => {scope: :session}
end

# == Schema Information
#
# Table name: positions
#
#  id                       :bigint(8)        not null, primary key
#  est_end_date             :datetime
#  est_hours_per_assignment :float
#  est_start_date           :datetime
#  position_code            :string
#  position_title           :string
#  position_type            :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  session_id               :bigint(8)
#
# Indexes
#
#  index_positions_on_session_id  (session_id)
#
# Foreign Keys
#
#  fk_rails_...  (session_id => sessions.id)
#
