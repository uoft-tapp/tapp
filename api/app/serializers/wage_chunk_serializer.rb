class WageChunkSerializer < ActiveModel::Serializer
    attributes :id, :start_date, :end_date, :hours, :rate
end
