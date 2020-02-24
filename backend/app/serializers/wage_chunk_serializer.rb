# frozen_string_literal: true

class WageChunkSerializer < ActiveModel::Serializer
    attributes :id, :assignment_id, :start_date, :end_date, :hours, :rate
end
