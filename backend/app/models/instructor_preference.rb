# frozen_string_literal: true

# A class representing a position_preference for an application
# to a position with a preference level.
class InstructorPreference < ApplicationRecord
    belongs_to :position
    belongs_to :application

    scope :by_session,
          lambda { |session_id|
              joins(:position).where(position: { session_id: session_id })
          }

    scope :by_instructor,
          lambda { |instructor_id|
              joins(position: :instructors).where(
                  position: { instructors: instructor_id }
              )
          }

    scope :by_visible_to_instructors,
          lambda {
              joins(position: :session).where(
                  sessions: { applications_visible_to_instructors: true }
              )
          }

    validates :preference_level, numericality: true, allow_nil: true
    validates_uniqueness_of :application_id, scope: %i[position_id]
end

# == Schema Information
#
# Table name: instructor_preferences
#
#  id               :integer          not null, primary key
#  position_id      :integer          not null
#  application_id   :integer          not null
#  preference_level :integer
#  comment          :text
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_position_preferences_on_application_id                  (application_id)
#  index_position_preferences_on_position_id                     (position_id)
#  index_position_preferences_on_position_id_and_application_id  (position_id,application_id) UNIQUE
#
