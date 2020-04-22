# frozen_string_literal: true

class UserSerializer < ActiveModel::Serializer
    attributes :id, :utorid, :roles
end
