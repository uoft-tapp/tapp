# frozen_string_literal: true

class UserSerializer < ActiveModel::Serializer
    attributes :id, :utorid, :roles

    def roles
        object.computed_roles
    end
end
