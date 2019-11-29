class SessionSerializer < ActiveModel::Serializer
    attributes :id, :start_date, :end_date, :name
end
