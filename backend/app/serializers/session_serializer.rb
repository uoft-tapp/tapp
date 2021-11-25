# frozen_string_literal: true

class SessionSerializer < ActiveModel::Serializer
    attributes :id,
               :start_date,
               :end_date,
               :name,
               :rate1,
               :rate2,
               :applications_visible_to_instructors
end
