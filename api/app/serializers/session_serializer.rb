# frozen_string_literal: true

class SessionSerializer < ActiveModel::Serializer
    attributes :id, :start_date, :end_date, :name
end
