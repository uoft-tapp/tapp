# frozen_string_literal: true

class InstructorPreferenceSerializer < ActiveModel::Serializer
    attributes :application_id, :position_id, :preference_level, :comment
end
